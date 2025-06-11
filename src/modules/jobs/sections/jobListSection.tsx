import ProfileJobCardList from "@/modules/jobs/ui/ProfileJobCardList";
export default function JobListSection({ companyId }: { companyId: string }){
    return (
        <>
        <div className="w-full container px-4 space-y-2 mx-auto">
            <ProfileJobCardList companyId={companyId} />
        </div>
        </>
    )
}