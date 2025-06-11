"use client"

import { Check } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { trpc } from '@/trpc/client'

const plans = [
  {
    name: "Free",
    key: "FREE",
    description: "Best for personal use",
    price: "$0",
    billing: "forever",
    buttonText: "Start for Free",
    features: ["Private company account", "Company's public page, accessible by registered candidates", "Company's job offers, accessible by registered candidates", "Environment with advanced analytics on registered candidates' profiles (with direct contact details)", "Advanced reporting tools for data visualization, analysis and extraction", "Possibility to cancel the next subscription the last day of the current month (UTC+1 during the winter/UTC+2 during the summer)"],
  },
  {
    name: "Basic",
    key: "MONTHLY",
    description: "Perfect for small teams",
    price: "$19",
    billing: "per month",
    buttonText: "Subscribe Monthly",
    paymentLink: process.env.STRIPE_MONTHLY_PLAN_LINK || "https://buy.stripe.com/test_8wM4ifak6gmQfo47ss",
    features: ["Private company account", "Company's public page, accessible by registered candidates", "Environment with advanced analytics on registered candidates' profiles (with direct contact details)", "Advanced reporting tools for data visualization, analysis and extraction", "Possibility to cancel the next subscription the last day of the current month (UTC+1 during the winter/UTC+2 during the summer)"],
  },
  {
    name: "Premium",
    key: "YEARLY",
    description: "For larger businesses",
    price: "$199",
    billing: "per year",
    buttonText: "Subscribe Yearly",
    paymentLink: process.env.STRIPE_YEARLY_PLAN_LINK || "https://buy.stripe.com/test_bIY9Cz8bY6Mgb7O5kl",
    features: ["Private company account", "Company's public page, accessible by registered candidates", "Company's job offers, accessible by registered candidates", "Environment with advanced analytics on registered candidates' profiles (with direct contact details)", " Advanced reporting tools for data visualization, analysis and extraction", "10% discount for the next renewal yearly subscription", "Possibility to cancel the next yearly subscription 3 months prior to the end date of the current paying plan"],
  },
]

export default function PricingTable() {
  const { user } = useUser()
  const { data: billingPortalUrl } = trpc.companies.getBillingPortalUrl.useQuery()
  console.log(billingPortalUrl)
  // Get publicMetadata from Clerk
  const publicMetadata = user?.publicMetadata || {}
  const isSubscribed = publicMetadata?.isSubscribed === true
  const currentPlan = publicMetadata?.plan // "MONTHLY" | "YEARLY" | undefined

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-3xl font-bold text-center mb-10">Choose Your Plan</h2>
      <div className="mx-6 md:mx-0 grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrentPlan = plan.key === currentPlan

          let buttonContent

          if (!user) {
            buttonContent = (
              <Button className="w-full">
                <Link href="/auth/login">Login to Subscribe</Link>
              </Button>
            )
          } else if (isSubscribed && isCurrentPlan && plan.key !== "FREE") {
            buttonContent = (
              <Button className="w-full bg-[#2B4356] hover:bg-[#2B4356]/80">
                <Link href={billingPortalUrl || "#"}>Manage Billing</Link>
              </Button>
            )
          } else if (plan.key === "FREE") {
            buttonContent = (
              <Button className="w-full">
                <Link href="/">Start Free</Link>
              </Button>
            )
          } else {
            buttonContent = (
              <Button className="w-full">
                <Link target='_blank' href={plan.paymentLink || "#"}>{plan.buttonText}</Link>
              </Button>
            )
          }

          return (
            <Card key={plan.name} className="flex flex-col text-center">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-4xl font-bold mb-2">
                  {plan.price}
                  <span className="text-sm font-normal text-muted-foreground">/{plan.billing}</span>
                </div>
                <ul className="space-y-4 mb-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="w-fit mx-auto flex items-center text-justify">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>{buttonContent}</CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}