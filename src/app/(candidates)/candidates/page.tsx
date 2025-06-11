import CandidatesView from "@/modules/candidates/views/candidates-list-view";
import { HydrateClient } from "@/trpc/server";
export const dynamic = "force-dynamic";
import { trpc } from "@/trpc/server";
export default async function ProfilePage() {
    void trpc.candidates.getAllCandidates.prefetch({
        search: "",
        sortBy: "name",
        sortOrder: "asc",
    });
    return <HydrateClient>
        <CandidatesView />
    </HydrateClient>
}