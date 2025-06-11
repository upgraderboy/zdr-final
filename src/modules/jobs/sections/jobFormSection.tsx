"use client"
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import JobForm from "../ui/components/JobForm";

export const JobFormSection = ({ jobId }: { jobId?: string }) => {
    return (
        <Suspense fallback={<JobFormSectionSkeleton />}>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <JobFormSectionSuspense jobId={jobId} />
            </ErrorBoundary>
        </Suspense>
    )
}

const JobFormSectionSkeleton = () => {
    return (
        <>
            <div className="border-y">
                {/* TODO: Add profile form */}
                Loading...
            </div>
        </>
    )
}
export const JobFormSectionSuspense = ({ jobId }: { jobId?: string }) => {
    // Fetch job data inside form if jobId exists
  const { data: jobData } = trpc.job.getJob.useQuery({ jobId: jobId || "" }, {
    enabled: !!jobId, // Only fetch if jobId exists
  });
  // 👇 Ensure types align with JobFormProps
  const formattedJobData = jobData
    ? {
        ...jobData,
        softSkills: jobData.softSkills ?? [], // convert `null` to empty array
        hardSkills: jobData.hardSkills ?? [], // convert `null` to empty array
        salaryRange: jobData.salaryRange ?? "", // convert `null` to empty string
        ageCategory: jobData.ageCategory ?? [], // convert `null` to empty array
        isPublished: jobData.isPublished ?? false, // convert `null` to false
        genderPreference: jobData.genderPreference ?? "All", // convert `null` to "All"
        isDisabilityAllowed: jobData.isDisabilityAllowed ?? false, // convert `null` to false
        createdAt: jobData.createdAt ?? new Date(), // convert `null` to current date
        updatedAt: jobData.updatedAt ?? new Date(), // convert `null` to current date
      }
    : undefined;
    return (
        <JobForm initialData={formattedJobData || undefined} />
    )
}