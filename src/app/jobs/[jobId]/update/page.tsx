import { JobFormView } from "@/modules/jobs/views/job-form-view";
import { HydrateClient, trpc } from "@/trpc/server";
interface PageProps{
    params: Promise<{ jobId: string }>
}
export default async function JobCreatePage({ params }: PageProps) {
    void trpc.job.getJob.prefetch({ jobId: (await params).jobId });
    return (
        <HydrateClient>
            <JobFormView jobId={(await params).jobId} />
        </HydrateClient>
    )
}