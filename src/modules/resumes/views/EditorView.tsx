"use client";
import { ResumeEditorSection } from "@/modules/resumes/ui/ResumeEditor";

export default function EditorView({ resumeId }: { resumeId: string }) {
  return <ResumeEditorSection resumeId={resumeId} />;
}