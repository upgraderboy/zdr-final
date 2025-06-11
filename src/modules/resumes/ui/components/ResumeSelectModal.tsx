// components/JobApplicationModal.tsx
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import ResumePreview from "../ResumePreview";
import { toast } from "sonner";

const JobApplicationModal = ({ jobId, isOpen, onClose }: { jobId: string, isOpen: boolean, onClose: () => void }) => {
    const { data: jobApplications } = trpc.job.getJobApplications.useQuery();
    const existingApplication = jobApplications?.find(app => app.jobId === jobId);
    const alreadySelectedResumeId = existingApplication?.resumeId ?? null;
    const [selectedResumeId, setSelectedResumeId] = useState<string | null>(alreadySelectedResumeId);
    const { user } = useUser();

    // Fetch the resumes for the current candidate
    const { data: resumes } = trpc.resume.getList.useQuery();

    const applyToJobMutation = trpc.job.applyJob.useMutation({
        onSuccess: ({ message }) => {
            toast.success(message);
        },
        onError: (err) => toast.error(err.message),
    });

    const handleSubmit = async () => {
        if (selectedResumeId && user) {
            await applyToJobMutation.mutateAsync({
                jobId,
                resumeId: selectedResumeId,
            });
            onClose(); // Close the modal after successful application
        }
    };
    useEffect(() => {
        if (alreadySelectedResumeId) {
            setSelectedResumeId(alreadySelectedResumeId);
        }
    }, [alreadySelectedResumeId]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Select Resume to Apply</DialogTitle>
                </DialogHeader>

                <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 resume-list space-y-4">
                    {resumes?.map((resume) => (
                        <div
                            key={resume.id}
                            onClick={() => !alreadySelectedResumeId && setSelectedResumeId(resume.id)}
                            className={`resume-item p-4 border 
              ${resume.id === selectedResumeId ? 'bg-blue-100' : 'bg-white'} 
              ${resume.id === alreadySelectedResumeId ? 'border-green-500' : ''}
              cursor-pointer rounded-md relative`}
                        >
                            <ResumePreview resumeData={resume} />
                            {resume.id === alreadySelectedResumeId && (
                                <span className="absolute top-1 right-1 text-green-600 text-xs font-semibold">Already Applied</span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="modal-actions flex justify-end mt-4">
                    <Button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white"
                        disabled={!!alreadySelectedResumeId}
                    >
                        Apply
                    </Button>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default JobApplicationModal;
