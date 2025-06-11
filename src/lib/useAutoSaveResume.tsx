import useDebounce from "@/hooks/useDebounce";
import { fileReplacer } from "@/lib/utils";
import { ResumeValues } from "@/lib/validation";
import { trpc } from "@/trpc/client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function useAutoSaveResume(resumeData: ResumeValues) {
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();
  const debouncedResumeData = useDebounce(resumeData, 1500);
  const [resumeId, setResumeId] = useState(resumeData.id);
  console.log(resumeId)
  const [lastSavedData, setLastSavedData] = useState(structuredClone(resumeData));
  const [isSaving, setIsSaving] = useState(false);
  const [isError, setIsError] = useState(false);
  
  // tRPC mutation hook
    const saveResumeMutation = trpc.resume.save.useMutation({
        onSuccess: ({ updatedResume }) => {
          setResumeId(updatedResume?.id);
          setLastSavedData(debouncedResumeData);
          utils.resume.getOne.invalidate({ id: updatedResume?.id });
          utils.candidates.getDefaultResume.invalidate();
          utils.resume.getList.invalidate();
          if (searchParams.get("resumeId") !== updatedResume?.id) {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set("resumeId", updatedResume?.id || '');
            window.history.replaceState(null, "", `?${newSearchParams.toString()}`);
          }
        },
        onError: (error) => {
          console.log("error", error.message)
          setIsError(true);
          toast("Something went wrong");
        },
      });
  
    useEffect(() => {
      setIsError(false);
    }, [debouncedResumeData]);
  
    useEffect(() => {
      async function save() {
        try {
          setIsSaving(true);
          setIsError(false);
  
          const newData = structuredClone(debouncedResumeData);
  
          saveResumeMutation.mutate({
            ...newData,
            ...(JSON.stringify(lastSavedData.photoUrl, fileReplacer) ===
              JSON.stringify(newData.photoUrl, fileReplacer) && {
              photoUrl: newData.photoUrl,
              lat: Number(newData.lat),
              lng: Number(newData.lng)
            }),
            id: resumeId
          });
        } catch (error) {
          setIsError(true);
          console.error(error);
        } finally {
          setIsSaving(false);
        }
      }
  
      const hasUnsavedChanges =
        JSON.stringify(debouncedResumeData, fileReplacer) !==
        JSON.stringify(lastSavedData, fileReplacer);
  
      if (hasUnsavedChanges && debouncedResumeData && !isSaving && !isError) {
        save();
      }
    }, [
      debouncedResumeData,
      isSaving,
      lastSavedData,
      isError,
      resumeId,
      searchParams,
      setResumeId,
    ]);
  
    return {
      isSaving,
      hasUnsavedChanges:
        JSON.stringify(resumeData) !== JSON.stringify(lastSavedData),
    };
  }