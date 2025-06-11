"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Eye } from "lucide-react"
import { trpc } from "@/trpc/client"
import { JobApplicationsDialog } from "./job-applications-dialog"
import { Job } from "./schema"

export interface JobWithStats extends Job {
  applicationsCount: number
  pendingCount: number
  shortlistedCount: number
  hiredCount: number
  rejectedCount: number
}

export default function ApplicantsList() {
  const [selectedJob, setSelectedJob] = useState<JobWithStats | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [jobs] = trpc.applications.getCompanyJobs.useSuspenseQuery()

  const handleViewApplications = (job: JobWithStats) => {
    setSelectedJob(job)
    setDialogOpen(true)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Job Postings</h1>
        <p className="text-muted-foreground mt-2">Manage your job postings and review applications</p>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No jobs found. Create your first job posting!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <Card key={job?.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.isRemote ? "Remote" : `${job.stateName}, ${job.countryName}`}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={job.isPublished ? "default" : "secondary"}>
                      {job.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <Badge variant="outline">{job.contractType}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {job.hardSkills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {job.hardSkills.length > 3 && (
                    <Badge key={job.hardSkills.length} variant="secondary" className="text-xs">
                      +{job.hardSkills.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{job.applicationsCount} applications</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-yellow-600">{job.pendingCount} pending</span>
                      <span className="text-blue-600">{job.shortlistedCount} shortlisted</span>
                      <span className="text-green-600">{job.hiredCount} hired</span>
                      <span className="text-red-600">{job.rejectedCount} rejected</span>
                    </div>
                  </div>

                  <Button onClick={() => handleViewApplications(job)} variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Applications
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedJob && <JobApplicationsDialog job={selectedJob} open={dialogOpen} onOpenChange={setDialogOpen} />}
    </div>
  )
}