"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormControl, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GeneralInfoValues } from "@/lib/validation";
import { generalInfoSchema } from "@/lib/validation";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewResumeModal() {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const utils = trpc.useUtils();
    const { mutate } = trpc.resume.create.useMutation({
        onSuccess: (resumeData) => {
            setOpen(false);
            toast.success("Resume created successfully");
            utils.resume.getList.invalidate();
            form.reset();
            router.push(`/resume/editor/${resumeData.id}`);
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const form = useForm<GeneralInfoValues>({
        resolver: zodResolver(generalInfoSchema),
        defaultValues: {
            title: "",
            description: "",
        },
    });
    const onSubmit = (data: GeneralInfoValues) => {
        console.log(data);
        mutate(data);
    };
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger onClick={() => setOpen(true)} asChild>
                <Button variant="outline">New Resume</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New Resume</DialogTitle>
                    <DialogDescription>
                        Create a new resume
                    </DialogDescription>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <FormField name="title" control={form.control} render={({ field }) => (
                                <div className="space-y-2">
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                </div>
                            )} />
                            <FormField name="description" control={form.control} render={({ field }) => (
                                <div className="space-y-2">
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                </div>
                            )} />
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => form.reset()}>Cancel</Button>
                                <Button type="submit">Create</Button>
                            </div>
                        </form>
                    </Form>

                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}