import { CustomSolutions } from "@/app/(home)/pricing-plan/_components/CustomSolutions";

import PricingTable from "@/app/(home)/pricing-plan/_components/PricingTable";
import { HeroSection } from "../_components/HeroSection";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";




const PricingPlanPage = async () => {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata.role === "CANDIDATE") {
    redirect("/candidates");
  }
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <HeroSection title="" description="" />
        <PricingTable />
        <CustomSolutions />
      </div>
    </div>
  )
}
export default PricingPlanPage;