"use client";
import ResumePreview from "../ResumePreview";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ResumeServerData } from "../../../../../types/globals";
import { cn, mapToResumeValues } from "@/lib/utils";
import { formatDate } from "date-fns";
import { MoreVertical, Printer, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

import ConfirmationDialog from "./ConfirmModal";
import { toast } from "sonner";
import { trpc } from "@/trpc/client";


interface ResumeItemProps {
  resume: ResumeServerData;
}

export default function ResumeItem({ resume }: ResumeItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: resume.title || "Resume",
  });
  const { data } = trpc.candidates.getProfile.useQuery();
  const wasUpdated = resume.updatedAt !== resume.createdAt;
  
    
  return (
    <div className={cn("group relative rounded-lg border border-transparent bg-secondary p-3 transition-colors hover:border-border", data?.defaultResumeId === resume.id ? "border-primary hover:border-primary" : "")}>
      <div className="space-y-3">
        <Link
          href={`/resume/editor/${resume.id}`}
          className="inline-block w-full text-center"
        >
          <p className="line-clamp-1 font-semibold">
            {resume.title || "No title"}
          </p>
          {resume.description && (
            <p className="line-clamp-2 text-sm">{resume.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {wasUpdated ? "Updated" : "Created"} on{" "}
            {formatDate(resume.updatedAt, "MMM d, yyyy h:mm a")}
          </p>
        </Link>
        <Link
          href={`/resume/editor/${resume.id}`}
          className="relative inline-block w-full"
        >
            <ResumePreview
              resumeData={mapToResumeValues(resume)}
              contentRef={contentRef}
              className="overflow-hidden shadow-sm transition-shadow group-hover:shadow-lg"
            />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </Link>
      </div>
      <MoreMenu resumeId={resume.id} onPrintClick={reactToPrintFn} />
    </div>
  );
}

interface MoreMenuProps {
  resumeId: string;
  onPrintClick: () => void;
}

function MoreMenu({ resumeId, onPrintClick }: MoreMenuProps) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showSetDefaultConfirmation, setShowSetDefaultConfirmation] = useState(false);
  useEffect(() => {
    if (showDeleteConfirmation || showSetDefaultConfirmation) {
      document.body.style.pointerEvents = "auto"; // Allow clicks
    }
    return () => {
      document.body.style.pointerEvents = "auto"; // Always reset when modal closes
    };
  }, [showDeleteConfirmation, showSetDefaultConfirmation]);
    const utils = trpc.useUtils();
    const { mutateAsync: deleteResume, isPending: isPendingDelete } = trpc.resume.delete.useMutation({
        onSuccess: () => {
            toast("Your resume has been deleted!");
            utils.resume.getList.invalidate();
            setShowDeleteConfirmation(false);
        },
        onError: (error: { message: string }) => {
            toast(error.message);
            setShowDeleteConfirmation(false);
        }
    });
    
    const { mutateAsync: setDefault, isPending: isPendingSetDefault } = trpc.resume.setDefault.useMutation({
        onSuccess: () => {
            toast("Your resume has been set as default!");
            utils.resume.getList.invalidate();
            utils.candidates.getProfile.invalidate();
            setShowSetDefaultConfirmation(false);
        },
        onError: (error: { message: string }) => {
            toast(error.message);
            setShowSetDefaultConfirmation(false);
        }
    });
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0.5 top-0.5 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
        <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => setShowSetDefaultConfirmation(true)}
          >
            <Printer className="size-4" />
            Set Default Resume
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => setShowDeleteConfirmation(true)}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={onPrintClick}
          >
            <Printer className="size-4" />
            Print
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmationDialog
        resumeId={resumeId}
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
        title="Delete Resume"
        description="This will permanently delete this resume. This action cannot be undone."
        action="Delete"
        actionVariant="destructive"
        mutate={deleteResume}
        isPending={isPendingDelete}
      />
      <ConfirmationDialog
        resumeId={resumeId}
        open={showSetDefaultConfirmation}
        onOpenChange={setShowSetDefaultConfirmation}
        title="Set Default Resume"
        description="This will set this resume as the default resume."
        action="Set Default"
        actionVariant="default"
        mutate={setDefault}
        isPending={isPendingSetDefault}
      />
    </>
  );
}

