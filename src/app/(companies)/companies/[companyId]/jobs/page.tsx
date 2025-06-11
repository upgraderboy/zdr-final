import JobListView from "@/modules/jobs/views/jobs-view";
import { HydrateClient } from "@/trpc/server";

import { trpc } from "@/trpc/server";
type Params = Promise<{ companyId: string }>
type Props = {
    params: Params;
};
export default async function JobList({ params }: Props) {
    // void trpc.resume.getList.prefetch();
    void trpc.job.getAllJobsByCompany.prefetch({ companyId: (await params).companyId });
    return <HydrateClient>
        <JobListView />
    </HydrateClient>
}
