import cron from "node-cron";
import { db } from "@/db";
import { companySubscription, companies } from "@/db/schema";
import { eq, lte } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
// Run every day at midnight (00:00)
cron.schedule("0 0 * * *", async () => {
  console.log("🔄 Checking for expired subscriptions...");

  const now = new Date();

  // Find and update expired subscriptions
  const expiredSubscriptions = await db.delete(companySubscription).where(lte(companySubscription.endDate, now)).returning();

  console.log(`✅ ${expiredSubscriptions.length} subscriptions expired.`);

  for (const subscription of expiredSubscriptions) {
    const client = await clerkClient();
    await client.users.updateUser(subscription.companyId, {
      publicMetadata: {
        isSubscribed: false,
        plan: "FREE",
        role: "COMPANY",
        onboardingComplete: true,
      },
    });
    await db.update(companies).set({ plan: "FREE", customerId: null }).where(eq(companies.id, subscription.companyId));
  }
});

console.log("⏳ Subscription cron job initialized...");