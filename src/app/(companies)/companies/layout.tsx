import { HomeLayout } from "@/components/HomeLayout";
import { auth } from "@clerk/nextjs/server";

export default async function CompaniesLayout({ children }: { children: React.ReactNode }) {
    const { sessionClaims, userId } = await auth();
    return <HomeLayout role={sessionClaims?.metadata.role} userId={userId || undefined}>{children}</HomeLayout>;
}
