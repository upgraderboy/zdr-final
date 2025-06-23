"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Mail, MapPin, Phone, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { CandidateWithResume } from "@/modules/candidates/server/procedure";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ResumePreview from "@/modules/resumes/ui/ResumePreview";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
// import html2pdf from "html2pdf.js";
export const CandidateCard = ({ candidate }: { candidate: CandidateWithResume }) => {
    return (
        <Suspense fallback={<CandidateCardSkeleton />}>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <CandidateCardSuspense candidate={candidate} />
            </ErrorBoundary>
        </Suspense>
    )
}

const CandidateCardSkeleton = () => {

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


                </div>
            </div>
        </>
    )
}
export default function CandidateCardSuspense({ candidate }: { candidate: CandidateWithResume }) {
    const contentRef = useRef<HTMLDivElement>(null);

    const reactToPrintFn = useReactToPrint({
        contentRef,
        documentTitle: "Resume",
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="w-full p-4 hover:bg-accent transition-colors cursor-pointer h-full">
                    <Card className="flex flex-col h-full">
                        <CardHeader className="text-center pb-2 relative">
                            <div className="flex justify-center mb-4">
                                <Avatar className="h-32 w-32 border-4" style={{ borderColor: candidate.resumeData?.colorHex || "#4f46e5" }}>
                                    <AvatarImage
                                        src={candidate.resumeData?.photoUrl || "/placeholder.svg?height=200&width=200"}
                                        alt={candidate.resumeData?.firstName || ""}
                                    />
                                    <AvatarFallback className="text-4xl">
                                        {candidate.resumeData?.firstName?.[0]}
                                        {candidate.resumeData?.lastName?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <CardTitle className="text-2xl flex items-center justify-center gap-2">
                                {candidate.resumeData?.firstName} {candidate.resumeData?.lastName}
                                {candidate.isVerified && <CheckCircle className="h-5 w-5 text-green-500" />}
                            </CardTitle>
                            <CardDescription className="text-lg font-medium mt-1">{candidate.resumeData?.jobTitle}</CardDescription>
                        </CardHeader>

                        <CardContent className="flex-grow">
                            <div className="space-y-4">
                                {(candidate.resumeData?.city || candidate.resumeData?.country) && (
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                        <span>{[candidate.resumeData?.city, candidate.resumeData?.country].filter(Boolean).join(", ")}</span>
                                    </div>
                                )}

                                {candidate.resumeData?.email && (
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                        <a href={`mailto:${candidate.resumeData?.email}`} className="hover:underline break-all">
                                            {candidate.resumeData?.email}
                                        </a>
                                    </div>
                                )}

                                {candidate.resumeData?.phone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                        <a href={`tel:${candidate.resumeData?.phone}`} className="hover:underline">
                                            {candidate.resumeData?.phone}
                                        </a>
                                    </div>
                                )}

                                <Separator className="my-4" />

                                {(candidate.resumeData?.hardSkills?.length || candidate.resumeData?.softSkills?.length) && (
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Skills
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {candidate.resumeData?.hardSkills?.slice(0, 3).map((skill, index) => (
                                                <Badge key={index} variant="secondary" className="text-sm" style={{ backgroundColor: candidate.resumeData?.colorHex || undefined }}>
                                                    {skill}
                                                </Badge>
                                            ))}
                                            {candidate.resumeData?.softSkills?.slice(0, 3).map((skill, index) => (
                                                <Badge key={`soft-${index}`} variant="secondary" className="text-sm" style={{ backgroundColor: candidate.resumeData?.colorHex || undefined }}>
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
            </DialogTrigger>

            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex-row justify-between items-center gap-4">
                    <DialogTitle>Resume Preview</DialogTitle>
                    <Button variant="outline" size="icon" onClick={reactToPrintFn}>
                        <Download className="h-4 w-4" />
                    </Button>
                </DialogHeader>
                {candidate.resumeData && (
                    <ResumePreview contentRef={contentRef} resumeData={candidate.resumeData} />
                )}
            </DialogContent>
        </Dialog>
    )
}