import { HydrateClient } from "@/trpc/server";
import { trpc } from "@/trpc/server";
import { ResumeSection } from "@/modules/candidates/ui/sections/ResumeSection";
export const dynamic = "force-dynamic"
export default async function ProfilePage() {
    void trpc.resume.getList.prefetch();
    return <HydrateClient>
        <ResumeSection />
    </HydrateClient>
}