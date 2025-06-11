import JobLayout from "@/modules/jobs/layouts/form-layout";
interface HomeLayoutProps {
    children: React.ReactNode;
}

const JobPageLayout = async ({ children }: HomeLayoutProps) => {
    return (
        <>
            <JobLayout>
                {children}
            </JobLayout>
        </>
    )
}

export default JobPageLayout;