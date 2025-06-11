import { db } from "@/db";
import { companies, companySubscription } from "@/db/schema";
import stripe from "@/lib/stripe";
import { clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Stripe } from "stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
export const config = {
    api: {
      bodyParser: false,
    },
};
export async function POST(req: Request) {
    const body = await req.text();
    const sig = (await headers()).get('stripe-signature');
    console.log("Webhook signature verification failed:", sig, WEBHOOK_SECRET, body);
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, sig!, WEBHOOK_SECRET);
    } catch (error) {
        console.error("Webhook signature verification failed:", error);
        return new NextResponse(`Webhook Error: ${error}`, { status: 400 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = await stripe.checkout.sessions.retrieve(
                    (event.data.object as Stripe.Checkout.Session).id,
                    {
                        expand: ["line_items"],
                    }
                );

                const customerId = session.customer as string;
                const customerDetails = session.customer_details;

                if (!customerDetails?.email) {
                    return new NextResponse("No customer email found in session", { status: 400 });
                }

                const [company] = await db
                    .select()
                    .from(companies)
                    .where(eq(companies.email, customerDetails.email));

                if (!company) {
                    return new NextResponse("Company not found", { status: 404 });
                }
                // Save customerId if not already saved
                if (!company.customerId) {
                    await db
                    .update(companies)
                    .set({ customerId })
                    .where(eq(companies.id, company.id));
                }
                console.log(JSON.stringify(company, null, 2));

                const lineItems = session.line_items?.data || [];

                for (const item of lineItems) {
                    const priceId = item.price?.id;
                    const isSubscription = item.price?.type === "recurring";

                    if (isSubscription && priceId) {
                        const now = new Date();
                        const endDate = new Date(now);
                        
                        console.log("Inserting subscription record", company.id, now, endDate, priceId);
                        if (priceId === process.env.STRIPE_MONTHLY_PRICE_ID) {
                            endDate.setMonth(endDate.getMonth() + 1);
                        } else if (priceId === process.env.STRIPE_YEARLY_PRICE_ID) {
                            endDate.setFullYear(endDate.getFullYear() + 1);
                        } else {
                            return new NextResponse("Invalid Price ID", { status: 400 });
                        }
                        const plan = priceId === process.env.STRIPE_YEARLY_PRICE_ID ? "YEARLY" : "MONTHLY";
                        // Insert subscription record
                        const [subscription] = await db.insert(companySubscription).values({
                            companyId: company.id,
                            startDate: now,
                            endDate,
                            subscriptionStatus: "ACTIVE",
                            period: plan,
                        }).returning();
                        console.log(JSON.stringify(subscription, null, 2));
                        // Update Clerk metadata
                        const client = await clerkClient();
                        await client.users.updateUser(company.clerkId, {
                            publicMetadata: {
                                isSubscribed: true,
                                plan,
                                role: "COMPANY",
                                onboardingComplete: true,
                            },
                        });

                        // Update company record
                        const data = await db.update(companies).set({
                            plan,
                        }).where(eq(companies.id, company.id)).returning();
                        console.log(JSON.stringify(data, null, 2));
                    }
                }

                break;
            }
            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
        
                const customerId = subscription.customer as string;
                if (!customerId) {
                  return new NextResponse("Customer ID missing", { status: 400 });
                }
        
                const [company] = await db
                  .select()
                  .from(companies)
                  .where(eq(companies.customerId, customerId));
        
                if (!company) {
                  return new NextResponse("Company not found", { status: 404 });
                }
        
                // Set all active subscriptions to CANCELLED
                await db
                  .update(companySubscription)
                  .set({ subscriptionStatus: "CANCELLED" })
                  .where(eq(companySubscription.companyId, company.id));
        
                // Optionally downgrade company to FREE plan
                await db
                  .update(companies)
                  .set({ plan: "FREE", customerId: null })
                  .where(eq(companies.id, company.id));
                  const client = await clerkClient();
                  await client.users.updateUser(company.clerkId, {
                      publicMetadata: {
                          isSubscribed: false,
                          plan: "FREE",
                          role: "COMPANY",
                          onboardingComplete: true,
                      },
                  });
                break;
              }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (error) {
        console.error("Error processing webhook:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }

    return new NextResponse("Webhook handled", { status: 200 });
}

