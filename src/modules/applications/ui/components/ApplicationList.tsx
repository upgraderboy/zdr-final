"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import type { JobWithApplication } from "./types"
import { JobCard } from "./ApplicationCard"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"


export default function ApplicationListSection() {
    return (
        <>
            <Suspense fallback={<JobsListSkeleton />}>
                <ErrorBoundary fallback={<JobsListSkeleton />}>
                    <ApplicationListSuspense />
                </ErrorBoundary>
            </Suspense>
        </>
    )
}
export function ApplicationListSuspense() {
    //   const queryClient = useQueryClient()
    const [applications] = trpc.applications.getApplicationsByCandidate.useSuspenseQuery();
    const removeApplicationMutation = trpc.applications.removeApplication.useMutation({
        onSuccess: (data) => {
            utils.applications.getApplicationsByCandidate.invalidate();
            toast(data.message)
        },
        onError: (err) => {
            toast(err.message)
        }
    })
    const createApplicationMutation = trpc.applications.createApplication.useMutation({
        onSuccess: () => {
            utils.applications.getApplicationsByCandidate.invalidate();
            toast("Your Resume updated!");
        }
    })
    const utils = trpc.useUtils();

    const handleApply = async (jobId: string, resumeId: string) => {
        try {
            console.log("resumeId", resumeId)
            createApplicationMutation.mutate({ jobId, resumeId })
        } catch (error) {
            console.error("Failed to apply:", error)
            toast("Failed to update!")
            throw error
        }
    }

    const handleRemoveApplication = async (jobId: string) => {
        try {
            removeApplicationMutation.mutate({ jobId });
        } catch (error) {
            console.error("Failed to remove application:", error)
            toast("Failed to remove application!")
            throw error
        }
    }

    if (!applications || applications.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No jobs found. Check back later for new opportunities!</AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Available Jobs ({applications.length})</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-1">
                {/* 
          Maps each job in the list to a JobCard component, 
          providing the job details, apply, and remove application callbacks.
        */}
                {applications.map((application: JobWithApplication) => (
                    <JobCard key={application.id} job={application} onApply={handleApply} onRemoveApplication={handleRemoveApplication} />
                ))}
            </div>
        </div>
    )
}

export function JobsListSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-4 p-6 border rounded-lg">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-20 w-full" />
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-10 flex-1" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
