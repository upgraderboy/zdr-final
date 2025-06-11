import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form";
  import { Textarea } from "@/components/ui/textarea";
  import { EditorFormProps } from "../../../../types/globals";
  import { skillsSchema, SkillsValues } from "@/lib/validation";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { useEffect, useState } from "react";
  import { useForm } from "react-hook-form";
  



  export default function SkillsForm({
    resumeData,
    setResumeData,
  }: EditorFormProps) {
    const form = useForm<SkillsValues>({
      resolver: zodResolver(skillsSchema),
      defaultValues: {
        softSkills: resumeData.softSkills || [],
        hardSkills: resumeData.hardSkills || [],
      },
    });
  
    const [softSkillsInput, setSoftSkillsInput] = useState(
      (resumeData.softSkills || []).join(", ")
    );
    const [hardSkillsInput, setHardSkillsInput] = useState(
      (resumeData.hardSkills || []).join(", ")
    );
  
    const watchedSoftSkills = form.watch("softSkills");
    const watchedHardSkills = form.watch("hardSkills");
  
    useEffect(() => {
      const cleanedSoft = watchedSoftSkills?.filter(Boolean).map((s) => s.trim()).filter(Boolean) || [];
      const cleanedHard = watchedHardSkills?.filter(Boolean).map((s) => s.trim()).filter(Boolean) || [];
  
      setResumeData((prev) => ({
        ...prev,
        softSkills: cleanedSoft,
        hardSkills: cleanedHard,
      }));
    }, [watchedSoftSkills, watchedHardSkills, setResumeData]);
  
    const handleSkillsChange = (
      rawValue: string,
      setInput: React.Dispatch<React.SetStateAction<string>>,
      fieldName: "softSkills" | "hardSkills"
    ) => {
      setInput(rawValue);
      form.setValue(fieldName, rawValue.split(",").map((s) => s.trim()).filter(Boolean));
    };
  
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="space-y-1.5 text-center">
          <h2 className="text-2xl font-semibold">Skills</h2>
          <p className="text-sm text-muted-foreground">
            Separate skills by commas.
          </p>
        </div>
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="hardSkills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hard Skills</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="e.g. JavaScript, Python, UI/UX Design"
                      value={hardSkillsInput}
                      onChange={(e) =>
                        handleSkillsChange(e.target.value, setHardSkillsInput, "hardSkills")
                      }
                    />
                  </FormControl>
                  <FormDescription>e.g. technical or job-specific skills</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
  
            <FormField
              control={form.control}
              name="softSkills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Soft Skills</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="e.g. Communication, Teamwork, Adaptability"
                      value={softSkillsInput}
                      onChange={(e) =>
                        handleSkillsChange(e.target.value, setSoftSkillsInput, "softSkills")
                      }
                    />
                  </FormControl>
                  <FormDescription>e.g. personal or interpersonal skills</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    );
  }
  