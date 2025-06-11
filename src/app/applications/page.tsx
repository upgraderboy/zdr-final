import { HydrateClient, trpc } from "@/trpc/server";
import { CandidateApplicationsView } from "@/modules/applications/views/candidate-applications-view";
import { CompanyApplicationsView } from "@/modules/applications/views/company-applications-view";
import { auth } from "@clerk/nextjs/server";

export default async function ApplicationsPage() {
    const { sessionClaims } = await auth();
    const role = sessionClaims?.metadata.role;
    if (role === "CANDIDATE") {
        void trpc.applications.getApplicationsByCandidate.prefetch();
        return (
            <HydrateClient>
                <div className="w-full container mx-auto mt-12">
                    <CandidateApplicationsView />
                </div>
            </HydrateClient>
        )
    }
    if (role === "COMPANY") {
        void trpc.applications.getCompanyJobs.prefetch();
        return (
            <HydrateClient>
                <div className="w-full container mx-auto mt-12">
                    <CompanyApplicationsView />
                </div>
            </HydrateClient>
        )
    }
}