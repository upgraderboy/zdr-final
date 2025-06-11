import { HydrateClient } from "@/trpc/server";
import { trpc } from "@/trpc/server";
import FavoriteJobsView from "@/modules/favorites/views/favorite-jobs-list-view";
import FavoriteCandidatesView from "@/modules/favorites/views/favorite-candidates-list-view";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function ProfilePage() {
    const { sessionClaims, userId } = await auth();
    if(!userId) return redirect("/");
    console.log(sessionClaims?.metadata.role)
    if(sessionClaims?.metadata.role === "CANDIDATE") {
        console.log("request reach 1")
        void trpc.favorites.getFavoriteJobs.prefetch({
            search: "",
            sortBy: "createdAt",
            sortOrder: "desc",
        });
        return <HydrateClient>
            <FavoriteJobsView />
        </HydrateClient>
    }
    if(sessionClaims?.metadata.role === "COMPANY") {
        console.log("request reach 2")
        void trpc.favorites.getFavoriteCandidates.prefetch({
            search: "",
            sortBy: "createdAt",
            sortOrder: "desc",
        });
        return <HydrateClient>
            <FavoriteCandidatesView />
        </HydrateClient>
    }
}