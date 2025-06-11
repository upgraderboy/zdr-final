"use client";

import { Metadata } from "next";

import ResumeItem from "./ResumeItem";

import { ResumeServerData } from "../../../../../types/globals";
import { useAuth } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Your resumes",
};

export default function ResumeList({
    resumes
}: {
    resumes: ResumeServerData[]
}) {
  const { userId } = useAuth();

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
  );
}