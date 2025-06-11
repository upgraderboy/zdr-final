import ProfileSection from "../ui/sections/candidate-profile-section";

export function CandidateProfileView({ candidateId }: { candidateId: string }) {
    console.log(candidateId)
    return <div>
        <ProfileSection candidateId={candidateId} />

    </div>
}