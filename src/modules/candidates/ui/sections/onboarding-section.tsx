"use client";

// import useUnloadWarning from "@/hooks/useUnloadWarning";

import { cn, mapToResumeValues } from "@/lib/utils";
import { ResumeValues } from "@/lib/validation";
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useAuth } from "@clerk/nextjs";


import ResumePreviewSection from "@/modules/resumes/ui/components/ResumePreviewSection";
import PersonalInfoForm from "@/modules/resumes/ui/PersonalInfoForm";
import SkillsForm from "@/modules/resumes/ui/SkillsForm";
import WorkExperienceForm from "@/modules/resumes/ui/WorkExperienceForm";
import EducationForm from "@/modules/resumes/ui/EducationForm";
import useAutoSaveResume from "@/lib/useOnBoardingSave";
import Footer from "@/modules/resumes/ui/components/Footer";
import useUnloadWarning from "@/hooks/useUnloadWarning";








export const OnboardingSection = () => {
    return (
        <Suspense fallback={<OnboardingSectionSkeleton />}>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <OnboardingSectionSuspense />
            </ErrorBoundary>
        </Suspense>
    )
}

const OnboardingSectionSkeleton = () => {
    return (
        <>
            <div className="border-y">
                {/* TODO: Add profile form */}
            </div>
        </>
    )
}
export const OnboardingSectionSuspense = () => {
    const { userId } = useAuth();
    const [resume] = trpc.candidates.getDefaultResume.useSuspenseQuery();
    const [resumeData, setResumeData] = useState<ResumeValues>(mapToResumeValues(resume));
    const [showSmResumePreview, setShowSmResumePreview] = useState(false);
    console.log("resumeData", resumeData)
    const { isSaving, hasUnsavedChanges } = useAutoSaveResume(resumeData);
    console.log("hasUnsavedChanges: ", hasUnsavedChanges, isSaving)
    useUnloadWarning(hasUnsavedChanges);
    if (!userId) {
      return null;
    }
    return (
        <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6">
      <div className="w-full h-full flex grow flex-col">
      <header className="space-y-1.5 border-b px-3 py-5 text-center">
        <h1 className="text-2xl font-bold">Design your resume</h1>
        <p className="text-sm text-muted-foreground">
          Follow the steps below to create your resume. Your progress will be
          saved automatically.
        </p>
      </header>
      <main className="relative grow">
        <div className="absolute bottom-0 top-0 flex w-full mb-20">
          <div
            className={cn(
              "w-full space-y-6 p-3 md:block md:w-1/2",
              showSmResumePreview && "hidden",
            )}
          >
            {/* <Breadcrumbs currentStep={currentStep} setCurrentStep={setStep} /> */}
            <PersonalInfoForm
              resumeData={resumeData}
              setResumeData={setResumeData}
            />
            <SkillsForm
              resumeData={resumeData}
              setResumeData={setResumeData}
            />
            <WorkExperienceForm
              resumeData={resumeData}
              setResumeData={setResumeData}
            />
            <EducationForm
              resumeData={resumeData}
              setResumeData={setResumeData}
            />
          </div>
          <div className="grow md:border-r" />
          <ResumePreviewSection
            resumeData={resumeData}
            setResumeData={setResumeData}
            className={cn(showSmResumePreview && "flex")}
          />
        </div>
      </main>
      <Footer
        // currentStep={currentStep}
        // setCurrentStep={setStep}
        showSmResumePreview={showSmResumePreview}
        setShowSmResumePreview={setShowSmResumePreview}

      />
    </div>
    </main>
    )
}