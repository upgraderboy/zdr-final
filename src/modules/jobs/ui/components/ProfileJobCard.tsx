import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit2, MoreVertical } from "lucide-react";
import { GetAllJobsOutput } from "@/types";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function ProfileJobCard({ job }: { job: GetAllJobsOutput[number] }){
  const utils = trpc.useUtils();
  const { mutate: changeJobStatus } = trpc.job.changeJobStatus.useMutation({
    onSuccess: () => {
      utils.job.getAllJobsByCompany.invalidate({ companyId: job.companyId });
      toast.success("Job status changed successfully");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  })
  const { mutate: deleteJob } = trpc.job.deleteJob.useMutation({
    onSuccess: () => {
      utils.job.getAllJobsByCompany.invalidate({ companyId: job.companyId });
      toast.success("Job deleted successfully");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  })
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-semibold">
                <span className="text-gray-500">Job Offer ({job.title}) </span>
              <Badge className="ml-2 p-2 text-xs bg-[#ff5722] text-white">{job.isPublished ? "Published" : "Draft"}</Badge>
              </h2>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                <Link href={`/jobs/${job.id}/update`}>
                  <Edit2 className="h-4 w-4" />
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => changeJobStatus({ jobId: job.id, status: "ACTIVE" })}>Activate</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeJobStatus({ jobId: job.id, status: "INACTIVE" })}>Suspend</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => deleteJob({ jobId: job.id })}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
          </Card>
    )
}