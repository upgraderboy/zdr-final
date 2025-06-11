"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Building2, Clock, DollarSign, Users, CheckCircle, FileText, Briefcase } from "lucide-react"
import { ResumeSelectionDialog } from "./resume-select-dialog"
import type { JobWithApplication } from "./types"

interface JobCardProps {
  job: JobWithApplication
  onApply: (jobId: string, resumeId: string) => Promise<void>
  onRemoveApplication: (jobId: string) => Promise<void>
}

export function JobCard({ job, onApply, onRemoveApplication }: JobCardProps) {
  const [showResumeDialog, setShowResumeDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isApplied = !!job.application
  const applicationStatus = job.application?.applicationStatus

  const handleApplyClick = () => {
    if (isApplied) {
      handleRemoveApplication()
    } else {
      setShowResumeDialog(true)
    }
  }

  const handleRemoveApplication = async () => {
    setIsLoading(true)
    try {
      await onRemoveApplication(job.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResumeSelect = async (resumeId: string) => {
    setIsLoading(true)
    try {
      await onApply(job.id, resumeId)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "SHORTLISTED":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "HIRED":
        return "bg-green-100 text-green-800 border-green-200"
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <>
      <Card className="w-full hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl font-semibold light:text-gray-900 mb-2">{job.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-2 text-sm light:text-gray-600">
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span>{job.companyName}</span>
                </div>
                {(job.stateName || job.countryName) && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{[job.stateName, job.countryName].filter(Boolean).join(", ")}</span>
                  </div>
                )}
                {job.isRemote && (
                  <Badge variant="secondary" className="text-xs">
                    Remote
                  </Badge>
                )}
              </div>
            </div>

            {isApplied && applicationStatus && (
              <Badge variant="outline" className={`${getStatusColor(applicationStatus)} font-medium`}>
                <CheckCircle className="h-3 w-3 mr-1" />
                {applicationStatus}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="light:text-gray-700 text-sm line-clamp-3">{job.description}</p>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              <Briefcase className="h-3 w-3 mr-1" />
              {job.contractType}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {job.experienceLevel}
            </Badge>
            {job.salaryRange && (
              <Badge variant="outline" className="text-xs">
                <DollarSign className="h-3 w-3 mr-1" />
                {job.salaryRange}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(job.createdAt).toLocaleDateString()}
            </Badge>
          </div>

          {(job.hardSkills?.length > 0 || job.softSkills?.length > 0) && (
            <div className="space-y-2">
              <Separator />
              <div className="space-y-2">
                {job.hardSkills?.length > 0 && (
                  <div>
                    <p className="light:text-gray-600 text-xs font-medium mb-1">Technical Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {job.hardSkills.slice(0, 5).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.hardSkills.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{job.hardSkills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {job.softSkills?.length > 0 && (
                  <div>
                    <p className="light:text-gray-600 text-xs font-medium mb-1">Soft Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {job.softSkills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.softSkills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.softSkills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {isApplied && job.appliedWithResume && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-green-800">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Applied with:</span>
                <span>
                  {job.appliedWithResume.title ||
                    `${job.appliedWithResume.firstName} ${job.appliedWithResume.lastName} Resume`}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              onClick={handleApplyClick}
              disabled={isLoading}
              variant={isApplied ? "destructive" : "default"}
              className="flex-1"
            >
              {isLoading ? "Processing..." : isApplied ? "Remove Application" : "Apply Now"}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowResumeDialog(true)}
              disabled={isLoading}
              className="flex-1 sm:flex-initial"
            >
              <FileText className="h-4 w-4 mr-2" />
              Select Resume
            </Button>
          </div>
        </CardContent>
      </Card>

      <ResumeSelectionDialog
        open={showResumeDialog}
        onOpenChange={setShowResumeDialog}
        jobId={job.id}
        currentResumeId={job.application?.resumeId}
        onResumeSelect={handleResumeSelect}
        isLoading={isLoading}
      />
    </>
  )
}
