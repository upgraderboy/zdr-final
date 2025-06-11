import { HydrateClient } from "@/trpc/server";
import { CandidateProfileView } from "@/modules/candidates/views/profile-view";
import { trpc } from "@/trpc/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CompanyProfileFormView } from "@/modules/companies/views/home-view";
import ProfileLayout from "@/modules/companies/layouts/form-layout";
export const dynamic = "force-dynamic";
export default async function ProfilePage() {
    const { sessionClaims } = await auth();
    if (!sessionClaims) {
        return redirect("/sign-in");
    }
    if (sessionClaims?.metadata.role === "COMPANY") {
        void trpc.companies.getProfile.prefetch();
        return (
            <ProfileLayout>
                <HydrateClient>
                    <CompanyProfileFormView />
                </HydrateClient>
            </ProfileLayout>
        )
    }
    if (sessionClaims?.metadata.role === "CANDIDATE") {
        void trpc.resume.getList.prefetch();
        void trpc.candidates.getProfile.prefetch();
        return (
            <HydrateClient>
                <CandidateProfileView />
            </HydrateClient>
        )
    }
}