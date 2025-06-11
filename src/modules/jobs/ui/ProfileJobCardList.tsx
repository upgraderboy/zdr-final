"use client"
import ProfileJobCard from "./components/ProfileJobCard";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
export default function ProfileJobCardList({ companyId }: { companyId: string }){
    const [profile] = trpc.job.getAllJobsByCompany.useSuspenseQuery({ companyId });
    return (
        <div className="container mx-auto flex flex-col gap-4 px-4 mt-10">
            <div className="flex justify-between px-4">
              <span className="text-2xl font-[600] text-[#ff5722]">My Job Offers</span>
              <Button variant="outline" size="icon">
                <Link href={`/jobs/create`}>
                  <PlusIcon className="h-4 w-4" />
                </Link>
              </Button>
            </div>
        <div className="container space-y-4 mx-auto">
            {
                profile?.map((job) => (
                    <ProfileJobCard key={job.id} job={job} />
                ))
            }
        </div>
        </div>
    )
}