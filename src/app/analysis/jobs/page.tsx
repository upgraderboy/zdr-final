import JobDashboardView from "@/modules/analysis/jobs/views/job-dashboard-view"
import { trpc } from "@/trpc/server"

export const dynamic = "force-dynamic";
export default function JobsAnalysis() {
    void trpc.job.getAllJobs.prefetch();
    return (
        <div>
            <h1>Jobs Analysis</h1>
            <JobDashboardView />
        </div>
    )
}
