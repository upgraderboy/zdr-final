import { CandidateProfileView } from "@/modules/candidates/views/candidate-profile-view";
import { HydrateClient } from "@/trpc/server";
import { trpc } from "@/trpc/server";
export const dynamic = "force-dynamic";
interface PageProps{
    params: Promise<{ candidateId: string }>
}
export default async function CompanyProfile({ params }: PageProps) {
  void trpc.candidates.getCandidate.prefetch({ candidateId: (await params).candidateId });
  return (
    <HydrateClient>
      <CandidateProfileView candidateId={(await params).candidateId} />
    </HydrateClient>
  )
}