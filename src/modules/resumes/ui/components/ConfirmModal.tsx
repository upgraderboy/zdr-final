import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
interface ConfirmationDialogProps {
    resumeId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    action: string;
    actionVariant: "default" | "destructive";
    mutate: ({ id }: { id: string }) => void;
    isPending: boolean;
}
import LoadingButton from "./LoadingButton";
import { Button } from "@/components/ui/button";
export default function ConfirmationDialog({
    resumeId,
    open,
    onOpenChange,
    title,
    description,
    action,
    actionVariant,
    mutate,
    isPending
}: ConfirmationDialogProps) {
    async function handleAction() {
        try {
          await mutate({ id: resumeId });
          onOpenChange(false);
        } catch (error) {
          console.error(error)
          // Optionally show error toast
        }
      }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <LoadingButton
                        variant={actionVariant}
                        onClick={handleAction}
                        loading={isPending}
                    >
                        {action}
                    </LoadingButton>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}