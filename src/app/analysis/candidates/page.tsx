import CandidateDashboardView from "@/modules/analysis/candidates/views/candidate-dashboard-view"
import { trpc } from "@/trpc/server"
import { auth } from "@clerk/nextjs/server"

export const dynamic = "force-dynamic"
export default async function AnalysisPage() {
    const { sessionClaims } = await auth();
    const { role, isSubscribed } = sessionClaims?.metadata || {};
    if(role === "COMPANY" && isSubscribed) {
        void trpc.analysis.candidateAnalysis.prefetch()
        return <div>
            <CandidateDashboardView />
        </div>
    }
    return (
        <div>
            <p>Access Denied</p>
        </div>
    )
}