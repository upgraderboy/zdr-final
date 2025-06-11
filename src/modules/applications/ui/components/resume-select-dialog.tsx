"use client"

import { useState } from "react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, User, Briefcase, Calendar } from "lucide-react"
import { trpc } from "@/trpc/client"

interface ResumeSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: string
  currentResumeId?: string
  onResumeSelect: (resumeId: string) => void
  isLoading?: boolean
}

export function ResumeSelectionDialog({
  open,
  onOpenChange,
  currentResumeId,
  onResumeSelect,
  isLoading = false,
}: ResumeSelectionDialogProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(currentResumeId || null);
  const [resumes] = trpc.resume.getList.useSuspenseQuery();
  // const utils = trpc.useUtils();
  // This would be your tRPC call to get resumes
  // const { data: resumes } = useSuspenseQuery({
  //   queryKey: ["resumes"],
  //   queryFn: async () => {
  //     // Replace with your actual tRPC call
  //     // return trpc.resume.getMyResumes.query()

  //     // Mock data for demonstration
  //     return [
  //       {
  //         id: "resume-1",
  //         title: "Software Engineer Resume",
  //         firstName: "John",
  //         lastName: "Doe",
  //         jobTitle: "Full Stack Developer",
  //         summary: "Experienced developer with 5+ years in React and Node.js",
  //         photoUrl: "/placeholder.svg?height=40&width=40",
  //         isDefault: true,
  //         experienceLevel: "Mid Level" as const,
  //         contractType: "Full-Time" as const,
  //         skillType: "TECH" as const,
  //         createdAt: new Date("2024-01-15"),
  //       },
  //       {
  //         id: "resume-2",
  //         title: "Frontend Specialist Resume",
  //         firstName: "John",
  //         lastName: "Doe",
  //         jobTitle: "Frontend Developer",
  //         summary: "Specialized in React, TypeScript, and modern frontend technologies",
  //         photoUrl: "/placeholder.svg?height=40&width=40",
  //         isDefault: false,
  //         experienceLevel: "Senior Level" as const,
  //         contractType: "Full-Time" as const,
  //         skillType: "TECH" as const,
  //         createdAt: new Date("2024-02-10"),
  //       },
  //       {
  //         id: "resume-3",
  //         title: "Backend Developer Resume",
  //         firstName: "John",
  //         lastName: "Doe",
  //         jobTitle: "Backend Developer",
  //         summary: "Expert in Node.js, databases, and cloud architecture",
  //         photoUrl: "/placeholder.svg?height=40&width=40",
  //         isDefault: false,
  //         experienceLevel: "Senior Level" as const,
  //         contractType: "Full-Time" as const,
  //         skillType: "TECH" as const,
  //         createdAt: new Date("2024-01-25"),
  //       },
  //     ] as Resume[]
  //   },
  // })

  const handleSelectResume = () => {
    if (selectedResumeId) {
      onResumeSelect(selectedResumeId);
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Resume for Application</DialogTitle>
          <DialogDescription>Choose which resume you&apos;d like to use for this job application.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {resumes.map((resume) => {
            const isSelected = selectedResumeId === resume.id
            const isCurrentlyUsed = currentResumeId === resume.id

            return (
              <Card
                key={resume.id}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected ? "ring-2 ring-primary" : ""
                } ${isCurrentlyUsed ? "border-green-500 border-2" : ""}`}
                onClick={() => setSelectedResumeId(resume.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={resume.photoUrl || "/placeholder.svg"}
                          alt={`${resume.firstName} ${resume.lastName}`}
                        />
                        <AvatarFallback>
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {resume.title || `${resume.firstName} ${resume.lastName} Resume`}
                          {resume.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                          {isCurrentlyUsed && (
                            <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Currently Used
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{resume.jobTitle}</p>
                      </div>
                    </div>
                    {isSelected && <CheckCircle className="h-6 w-6 text-primary" />}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {resume.summary && <p className="text-sm text-muted-foreground line-clamp-2">{resume.summary}</p>}

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {resume.experienceLevel}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {resume.contractType}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {resume.skillType}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {resume.createdAt.toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSelectResume} disabled={!selectedResumeId || isLoading}>
            {isLoading ? "Applying..." : "Apply with Selected Resume"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}