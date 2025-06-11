"use client"

import { GetAllJobsOutput } from "@/types"

import { useUser } from "@clerk/nextjs"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { JobDetailCard } from "../ui/components/JobDetailCard"
import JobAction from "./JobAction"
type JobCardProps = {
    job: GetAllJobsOutput[number]; // 👈 single company
};
export function JobCard({ job }: JobCardProps) {
    const { user } = useUser();
    const [showDetail, setShowDetail] = useState(false);
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="w-full flex items-center justify-between p-4 bg-gray-100 outline rounded-2xl cursor-pointer group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center" onClick={() => setShowDetail(!showDetail)}>
                            <div className="w-5 h-5 bg-white/20" />
                        </div>
                        <div onClick={() => setShowDetail(!showDetail)}>
                            <h3 className="text-sm font-medium text-gray-900">{job.title}</h3>
                            <p className="text-xs text-gray-500">{job.contractType}</p>
                        </div>
                    </div>
                    <div>
                        {
                            user?.publicMetadata.role === "CANDIDATE" && (
                                <JobAction job={job} />
                            )
                        }
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent>
            <DialogTitle></DialogTitle>
                <JobDetailCard job={job} />
            </DialogContent>
        </Dialog>
    )
}
