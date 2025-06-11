"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, MapPin, Calendar } from "lucide-react"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import { Job } from "./schema"
import { ApplicationStatus } from "./schema"
import { useRouter } from "next/navigation"

interface JobApplicationsDialogProps {
  job: Job
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JobApplicationsDialog({ job, open, onOpenChange }: JobApplicationsDialogProps) {
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, ApplicationStatus>>({})
  const utils = trpc.useUtils()
  const { data: applications } = trpc.applications.getJobApplications.useQuery({ jobId: job.id })
  const router = useRouter();
  const updateStatusMutation = trpc.applications.updateApplicationStatus.useMutation({
    onSuccess: () => {
      utils.applications.getJobApplications.invalidate()
      utils.applications.getCompanyJobs.invalidate()
      toast("Application status updated successfully")
    },
    onError: () => {
      toast("Failed to update application status")
    },
  })

  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    setSelectedStatuses((prev) => ({ ...prev, [applicationId]: newStatus }))
    await updateStatusMutation.mutateAsync({
      applicationId,
      status: newStatus,
    })
  }

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "SHORTLISTED":
        return "bg-blue-100 text-blue-800"
      case "HIRED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleViewProfile = (candidateId: string) => {
    // In a real app, this would navigate to the candidate profile
    router.push(`/candidates/${candidateId}`)
    console.log("View profile for candidate:", candidateId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Applications for {job.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {applications?.map((application) => (
            <Card key={application?.job_applications?.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={application.candidate?.resumes?.photoUrl || "/placeholder.svg"} />
                      <AvatarFallback>
                        {application.candidate?.resumes?.firstName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {application.candidate?.resumes?.firstName}
                        {application.candidate?.resumes?.lastName}
                        {/* {application.candidate?.resumes?.isVerified && <CheckCircle className="h-4 w-4 text-green-500" />} */}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{application.resume?.resumes?.title}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(application.job_applications?.applicationStatus)}>
                    {application.job_applications?.applicationStatus}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Resume Summary */}
                <div>
                  <h4 className="font-medium mb-2">Resume: {application.resume?.resumes?.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{application.resume?.resumes?.summary}</p>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{application.resume?.resumes?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{application.resume?.resumes?.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {application.resume?.resumes?.city}, {application.resume?.resumes?.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h5 className="font-medium mb-2">Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {application.resume?.resumes?.hardSkills?.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={() => handleViewProfile(application?.job_applications?.candidateId)}>
                    <User className="h-4 w-4 mr-2" />
                    View Full Profile
                  </Button>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">Status:</span>
                    <Select
                      value={selectedStatuses[application?.job_applications?.id] || application?.job_applications?.applicationStatus}
                      onValueChange={(value) => handleStatusChange(application?.job_applications?.id, value as ApplicationStatus)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                        <SelectItem value="HIRED">Hired</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {applications?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No applications received yet for this job.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
