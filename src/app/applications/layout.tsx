import { HomeLayout } from "@/components/HomeLayout";
import { auth } from "@clerk/nextjs/server";
interface HomeLayoutProps {
    children: React.ReactNode;
}

const Layout = async ({ children }: HomeLayoutProps) => {
    const { sessionClaims, userId } = await auth();
    return (
        <>
            <HomeLayout role={sessionClaims?.metadata.role} userId={userId || undefined}>
                {children}
            </HomeLayout>
        </>
    )
}
export default Layout;
