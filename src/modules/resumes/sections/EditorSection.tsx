"use client"
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useAuth } from "@clerk/nextjs";
import ResumeItem from "@/modules/resumes/ui/components/ResumeItem";

export const EditorSection = () => {
    return (
        <Suspense fallback={<EditorSectionSkeleton />}>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <EditorSectionSuspense />
            </ErrorBoundary>
        </Suspense>
    )
}

const EditorSectionSkeleton = () => {
    return (
        <>
            <div className="border-y">
                {/* TODO: Add profile form */}
            </div>
        </>
    )
}
export const EditorSectionSuspense = () => {
    const { userId } = useAuth();
    const [resumes] = trpc.resume.getList.useSuspenseQuery();

  if (!userId) {
    return null;
  }
    return (
        <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6">
      {/* <CreateResumeButton
        canCreate={canCreateResume(subscriptionLevel, totalCount)}
      /> */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Your resumes</h1>
        {/* <p>Total: {totalCount}</p> */}
      </div>
      <div className="flex w-full grid-cols-2 flex-col gap-3 sm:grid md:grid-cols-3 lg:grid-cols-4">
        {resumes.map((resume) => (
          <ResumeItem key={resume.id} resume={resume} />
        ))}
      </div>
    </main>
    )
}