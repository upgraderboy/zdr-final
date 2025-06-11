"use client";

// import useUnloadWarning from "@/hooks/useUnloadWarning";

import { cn, mapToResumeValues } from "@/lib/utils";
import { ResumeValues } from "@/lib/validation";
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useAuth } from "@clerk/nextjs";


import ResumePreviewSection from "./components/ResumePreviewSection";
import PersonalInfoForm from "./PersonalInfoForm";
import SkillsForm from "./SkillsForm";
import WorkExperienceForm from "./WorkExperienceForm";
import EducationForm from "./EducationForm";
// import useAutoSaveResume from "@/lib/useAutoSaveResume";
import Footer from "@/modules/resumes/ui/components/Footer";
// import useUnloadWarning from "@/hooks/useUnloadWarning";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ResumeEditorProps {
  resumeId: string;
}







export const ResumeEditorSection = ({ resumeId }: ResumeEditorProps) => {
    return (
        <Suspense fallback={<ResumeEditorSectionSkeleton />}>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <ResumeEditorSectionSuspense resumeId={resumeId} />
            </ErrorBoundary>
        </Suspense>
    )
}

const ResumeEditorSectionSkeleton = () => {
    return (
        <>
            <div className="border-y">
                {/* TODO: Add profile form */}
            </div>
        </>
    )
}
export const ResumeEditorSectionSuspense = ({ resumeId }: ResumeEditorProps) => {
    const { userId } = useAuth();
    const router = useRouter();
    const [resume] = trpc.resume.getOne.useSuspenseQuery({ id: resumeId });
    const [resumeData, setResumeData] = useState<ResumeValues>(mapToResumeValues(resume));
    const [showSmResumePreview, setShowSmResumePreview] = useState(false);
    console.log("resumeData", resumeData)
    // const { isSaving, hasUnsavedChanges } = useAutoSaveResume(resumeData);
    // console.log("hasUnsavedChanges: ", hasUnsavedChanges, isSaving)
    // useUnloadWarning(hasUnsavedChanges);
    const { mutate: SaveResume } = trpc.resume.save.useMutation({
      onSuccess: ()=>{
        toast("Resume saved successfully")
        router.push("/resume")
      },
      onError: ()=>{
        toast("Resume saved failed")
      }
    })
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
        <div className="absolute bottom-0 top-0 flex w-full">
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
        <div className="w-full flex justify-center mb-10">
          <Button
            className="mb-10"
            onClick={() => {
              SaveResume({
                ...resumeData,
                id: resumeData.id
              })
            }}
            // disabled={isSaving}
            variant="outline"
            size="sm"
          >
            Save Resume
          </Button>
        </div>
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
        // isSaving={isSaving}
      />
    </div>
    </main>
    )
}