import JobListView from "@/modules/jobs/views/jobs-view";
import { HydrateClient } from "@/trpc/server";
export const dynamic = "force-dynamic";
import { trpc } from "@/trpc/server";
export default async function JobList() {
    // void trpc.resume.getList.prefetch();
    void trpc.job.getAllJobs.prefetch({
        search: "",
        sortBy: "title",
        sortOrder: "asc",
    });
    return <HydrateClient>
        <JobListView />
    </HydrateClient>
}
