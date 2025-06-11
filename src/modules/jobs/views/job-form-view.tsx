import { JobFormSection } from "../sections/jobFormSection";

export function JobFormView({ jobId }: { jobId?: string }) {

  return (
    <>
      <JobFormSection jobId={jobId} />
    </>
  )
}