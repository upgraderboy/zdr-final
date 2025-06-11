import JobListSection from "@/modules/jobs/sections/jobListSection";
import ProfileSection from "../sections/profile-section";
export const ProfileView = ({ companyId }: { companyId: string }) => {
    console.log(companyId)
    return (
        <>
            <ProfileSection companyId={companyId} />
            <JobListSection companyId={companyId} />
        </>
    )
}