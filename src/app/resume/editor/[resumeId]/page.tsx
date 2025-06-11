import { Metadata } from "next";
import { HydrateClient, trpc } from "@/trpc/server";
import EditorView from "@/modules/resumes/views/EditorView";

interface PageProps {
  params: Promise<{ resumeId: string }>;
}

export const metadata: Metadata = {
  title: "Design your resume",
};

export default async function Page({ params }: PageProps) {
  const { resumeId } = await params;
  void trpc.resume.getOne.prefetch({ id: resumeId });
  return (
    <HydrateClient>
        <EditorView resumeId={resumeId} />
    </HydrateClient>
  )
}