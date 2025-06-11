"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Calendar, CheckCircle, GraduationCap, Mail, MapPin, Phone, User } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Skeleton } from "@/components/ui/skeleton"
export const ProfileSection = ({ candidateId }: { candidateId: string }) => {
    return (
        <Suspense fallback={<ProfileSectionSkeleton />}>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <ProfileSectionSuspense candidateId={candidateId} />
            </ErrorBoundary>
        </Suspense>
    )
}

const ProfileSectionSkeleton = () => {
    return (
        <>
            <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left sidebar skeleton */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <Skeleton className="h-32 w-32 rounded-full" />
              </div>
              <Skeleton className="h-8 w-48 mx-auto mb-2" />
              <Skeleton className="h-6 w-36 mx-auto" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <Skeleton className="h-px w-full my-4" />
                <div className="space-y-3">
                  <Skeleton className="h-6 w-24" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-6 w-16 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content area skeleton */}
        <div className="lg:col-span-2 space-y-8">
          {/* Summary section skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>

          {/* Work Experience section skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[1, 2].map((i) => (
                  <div key={i} className="relative pl-8 pb-8 border-l-2 border-muted last:border-0 last:pb-0">
                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-muted"></div>
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                      <Skeleton className="h-4 w-full mt-2 mb-1" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Education section skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[1, 2].map((i) => (
                  <div key={i} className="relative pl-8 pb-8 border-l-2 border-muted last:border-0 last:pb-0">
                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-muted"></div>
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-64" />
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
        </>
    )
}
export default function ProfileSectionSuspense({ candidateId }: { candidateId: string }) {
  console.log(candidateId)
    const [candidateData] = trpc.candidates.getCandidate.useSuspenseQuery({
      candidateId
    });
    const { resumeData } = candidateData;

    return (
        <>
            <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left sidebar with personal info */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <Avatar className="h-32 w-32 border-4" style={{ borderColor: resumeData?.colorHex || "#4f46e5" }}>
                  <AvatarImage
                    src={resumeData?.photoUrl || "/placeholder.svg?height=200&width=200"}
                    alt={resumeData?.firstName || ""}
                  />
                  <AvatarFallback className="text-4xl">
                    {resumeData?.firstName?.[0]}
                    {resumeData?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                {resumeData?.firstName} {resumeData?.lastName}
                {candidateData.isVerified && <CheckCircle className="h-5 w-5 text-green-500" />}
              </CardTitle>
              <CardDescription className="text-lg font-medium mt-1">{resumeData?.jobTitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(resumeData?.city || resumeData?.country) && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span>{[resumeData?.city, resumeData?.country].filter(Boolean).join(", ")}</span>
                  </div>
                )}

                {resumeData?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <a href={`mailto:${resumeData?.email}`} className="hover:underline break-all">
                      {resumeData?.email}
                    </a>
                  </div>
                )}

                {resumeData?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <a href={`tel:${resumeData?.phone}`} className="hover:underline">
                      {resumeData?.phone}
                    </a>
                  </div>
                )}

                <Separator className="my-4" />

                {resumeData?.hardSkills && resumeData?.hardSkills.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {resumeData?.hardSkills?.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Summary section */}
          {resumeData?.summary && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{resumeData?.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Work Experience section */}
          {resumeData?.workExperiences && resumeData?.workExperiences?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {resumeData?.workExperiences?.map((experience, index) => (
                    <div
                      key={index}
                      className="relative pl-8 pb-8 border-l-2 border-muted last:border-0 last:pb-0"
                    >
                      <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary"></div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{experience.position}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-muted-foreground">
                          <span className="font-medium">{experience.company}</span>
                          <span className="hidden sm:inline">•</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {experience.startDate && formatDate(new Date(experience.startDate))} -{" "}
                              {experience.endDate ? formatDate(new Date(experience.endDate)) : "Present"}
                            </span>
                          </div>
                        </div>
                        {experience.description && (
                          <p className="mt-2 text-muted-foreground">{experience.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education section */}
          {resumeData?.educations && resumeData?.educations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {resumeData.educations.map((education, index) => (
                    <div
                      key={index}
                      className="relative pl-8 pb-8 border-l-2 border-muted last:border-0 last:pb-0"
                    >
                      <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary"></div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{education.degree}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-muted-foreground">
                          <span className="font-medium">{education.school}</span>
                          <span className="hidden sm:inline">•</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {education.startDate && formatDate(new Date(education.startDate))} -{" "}
                              {education.endDate ? formatDate(new Date(education.endDate)) : "Present"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>


        </>
    )
}