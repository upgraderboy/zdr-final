import { ProfileView } from "@/modules/companies/views/profile-view";
import { HydrateClient } from "@/trpc/server";
import { trpc } from "@/trpc/server";
export const dynamic = "force-dynamic";
interface PageProps{
    params: Promise<{ companyId: string }>
}
export default async function CompanyProfile({ params }: PageProps) {
  void trpc.companies.companyProfile.prefetch({ companyId: (await params).companyId });
  void trpc.job.getAllJobsByCompany.prefetch({ companyId: (await params).companyId });
  return (
    <HydrateClient>
      <ProfileView companyId={(await params).companyId} />
    </HydrateClient>
  )
}