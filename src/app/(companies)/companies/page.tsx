import CompanyListView from "@/modules/companies/views/company-list-view";
import { HydrateClient } from "@/trpc/server";
export const dynamic = "force-dynamic";
import { trpc } from "@/trpc/server";
export default async function ProfilePage() {
    // void trpc.resume.getList.prefetch();
    void trpc.companies.getAllCompanies.prefetch({
        search: "",
        sortBy: "createdAt",
        sortOrder: "desc",
    });
    return <HydrateClient>
        <CompanyListView />
    </HydrateClient>
}