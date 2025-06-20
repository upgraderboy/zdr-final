import CandidateDashboardView from "@/modules/analysis/candidates/views/candidate-dashboard-view"
import { trpc } from "@/trpc/server"

export const dynamic = "force-dynamic"
export default async function AnalysisPage() {
    void trpc.analysis.candidateAnalysis.prefetch()
    return <div>
        <CandidateDashboardView />
    </div>
}