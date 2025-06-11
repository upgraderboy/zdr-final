import { GetAllJobsOutput } from "@/types"
import { trpc } from "@/trpc/client"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useState } from "react"
import JobApplicationModal from "@/modules/resumes/ui/components/ResumeSelectModal"
import { useFavoriteJobs } from "@/hooks/useFavJobs"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
export default function JobAction({ job }: { job: GetAllJobsOutput[number] }) {
  const utils = trpc.useUtils();
  const { data: status } = trpc.job.checkApplied.useQuery({ jobId: job.id });
  const { mutate: toggleApplication } = trpc.job.toggleJobApplication.useMutation({
    onSuccess: (data) => {
      toast(data.message);
      utils.applications.getApplicationsByCandidate.invalidate();
      utils.job.checkApplied.invalidate({ jobId: job.id });
    },
    onError: (err) => {
      toast(err.message);
    }
  })
  console.log(status)
  const { isFavorite, toggleFavorite } = useFavoriteJobs();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <JobApplicationModal jobId={job.id} isOpen={showModal} onClose={() => setShowModal(false)} />
      <span className="text-xs text-gray-500">{job.experienceLevel}</span>
      {
        (
          <div className="flex items-center gap-2">
            <Button variant="default" className={cn("ml-auto", {
              "bg-primary text-white": !status,
              "bg-gray-400 cursor-not-allowed": status === "PENDING",
              "bg-blue-400 cursor-not-allowed": status === "SHORTLISTED",
              "bg-green-400 cursor-not-allowed": status === "HIRED",
            })} onClick={(e) => {
              e.stopPropagation();
              toggleApplication({ jobId: job.id })
            }}>
              {!status ? "Apply" : status === "PENDING" ? "Pending" : status === "SHORTLISTED" ? "Shortlisted" : status === "HIRED" ? "Hired" : "Applied"}
            </Button>
            <Heart
              className={`w-4 h-4 cursor-pointer ${
                isFavorite(job.id) ? "fill-red-500 text-red-500" : "fill-gray-500 text-gray-500"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(job.id);
              }}
            />
          </div>
        )
      }
    </div>
  )
}