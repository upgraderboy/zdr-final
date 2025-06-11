import { ResumeSection } from "@/modules/candidates/ui/sections/ResumeSection";
import ProfileSection from "../ui/sections/profile-section";

export function CandidateProfileView() {
    return <div>
        <ProfileSection />
        <ResumeSection />
    </div>
}