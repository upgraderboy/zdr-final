"use client";

// import useUnloadWarning from "@/hooks/useUnloadWarning";

import { cn, mapToResumeValues } from "@/lib/utils";
import { resumeSchema, ResumeValues } from "@/lib/validation";
import { useEffect, useState } from "react";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useAuth } from "@clerk/nextjs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import ResumePreviewSection from "./components/ResumePreviewSection";
// import useAutoSaveResume from "@/lib/useAutoSaveResume";
import Footer from "@/modules/resumes/ui/components/Footer";
// import useUnloadWarning from "@/hooks/useUnloadWarning";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

interface ResumeEditorProps {
  resumeId: string;
}
import { LocationPicker } from "@/modules/resumes/ui/LocationPicker";
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { GripHorizontal } from "lucide-react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectTrigger } from "@radix-ui/react-select";
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import ImageUpload from "@/components/image-upload";






export const ResumeEditorSection = ({ resumeId }: ResumeEditorProps) => {
    return (
        <Suspense fallback={<ResumeEditorSectionSkeleton />}>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <ResumeEditorSectionSuspense resumeId={resumeId} />
            </ErrorBoundary>
        </Suspense>
    )
}

const ResumeEditorSectionSkeleton = () => {
    return (
        <>
            <div className="border-y">
                {/* TODO: Add profile form */}
            </div>
        </>
    )
}
export const ResumeEditorSectionSuspense = ({ resumeId }: ResumeEditorProps) => {
    const { userId } = useAuth();
    const router = useRouter();
    const [resume] = trpc.resume.getOne.useSuspenseQuery({ id: resumeId });
    const [resumeData, setResumeData] = useState<ResumeValues>(mapToResumeValues(resume));
    const [showSmResumePreview, setShowSmResumePreview] = useState(false);
    const form = useForm<ResumeValues>({
        resolver: zodResolver(resumeSchema),
        defaultValues: resumeData,
      });
      // console.log("hasUnsavedChanges: ", hasUnsavedChanges, isSaving)
      const { fields, append, remove, move } = useFieldArray({
        control: form.control,
        name: "workExperiences",
      });
    
      const {
        fields: educationFields,
        append: appendEducation,
        remove: removeEducation,
        move: moveEducation,
      } = useFieldArray({
        control: form.control,
        name: "educations",
      });
      const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
      );
    
      const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
          const oldIndex = fields.findIndex(f => f.id === active.id);
          const newIndex = fields.findIndex(f => f.id === over.id);
          move(oldIndex, newIndex);
        }
      };
    const watchedWorkExperiences = useWatch({ control: form.control, name: "workExperiences" });
    const watchedEducations = useWatch({ control: form.control, name: "educations" });
      const handleEducationDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
          const oldIndex = educationFields.findIndex((field) => field.id === active.id);
          const newIndex = educationFields.findIndex((field) => field.id === over.id);
          moveEducation(oldIndex, newIndex);
        }
      };
      // useUnloadWarning(hasUnsavedChanges);
      useEffect(() => {
        const subscription = form.watch((values) => {
          setResumeData((prev) => {
            // Ensure softSkills and hardSkills contain only strings
            const cleanSoftSkills =
              (values.softSkills || []).filter((s): s is string => !!s?.trim());
            const cleanHardSkills =
              (values.hardSkills || []).filter((s): s is string => !!s?.trim());
    
            const newData: ResumeValues = {
              ...prev,
              ...values,
              softSkills: cleanSoftSkills,
              hardSkills: cleanHardSkills,
              workExperiences: watchedWorkExperiences ?? [],
              educations: watchedEducations ?? []
            };
    
            return JSON.stringify(prev) !== JSON.stringify(newData) ? newData : prev;
          });
        });
    
        return () => subscription.unsubscribe?.();
      }, [form, setResumeData, watchedWorkExperiences, watchedEducations]);

      const { mutate: SaveResume } = trpc.resume.save.useMutation({
        onSuccess: () => {
          toast("Resume saved successfully");
          router.push("/onboarding");
        },
        onError: () => {
          toast("Resume save failed");
        },
      });
      // const { isSaving, hasUnsavedChanges } = useAutoSaveResume(resumeData);
      // console.log("hasUnsavedChanges: ", hasUnsavedChanges, isSaving)
      // useUnloadWarning(hasUnsavedChanges);
      // const { mutate: SaveResume } = trpc.resume.save.useMutation({
      //   onSuccess: ()=>{
      //     toast("Resume saved successfully")
      //     router.push("/resume")
      //   },
      //   onError: ()=>{
      //     toast("Resume saved failed")
      //   }
      // })
      const [softSkillsInput, setSoftSkillsInput] = useState((resumeData.softSkills || []).join(", "));
      const [hardSkillsInput, setHardSkillsInput] = useState((resumeData.hardSkills || []).join(", "));
      if (!userId) {
        return null;
      }
    
      // Convert comma-separated input into string[]
      const handleSkillsChange = (
        rawValue: string,
        setInput: React.Dispatch<React.SetStateAction<string>>,
        fieldName: "softSkills" | "hardSkills"
      ) => {
        setInput(rawValue);
        const parsed = rawValue
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        form.setValue(fieldName, parsed);
      };
    

    return (
      <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6">
      <div className="w-full h-full flex grow flex-col">
        <header className="space-y-1.5 border-b px-3 py-5 text-center">
          <h1 className="text-2xl font-bold">Design your resume</h1>
          <p className="text-sm text-muted-foreground">
            Follow the steps below to create your resume. Your progress will be
            saved automatically.
          </p>
        </header>
        <main className="relative grow">
          <div className="absolute bottom-0 top-0 flex w-full">
            <div
              className={cn(
                "w-full space-y-6 p-3 md:block md:w-1/2",
                showSmResumePreview && "hidden",
              )}
            >
              {/* <Breadcrumbs currentStep={currentStep} setCurrentStep={setStep} /> */}

              <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit((data) => SaveResume(data))}>
                  {/* Photo */}
                  <FormField name="photoUrl" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photo</FormLabel>
                      <ImageUpload
                        value={field.value ? [field.value] : []}
                        onChange={(url) => field.onChange(url)}
                        onRemove={() => field.onChange("")}
                      />
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Name & Title */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField name="firstName" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="lastName" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Job Title, Age */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField name="jobTitle" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="age" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* City, Country */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField name="city" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="country" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Location Picker */}
                  <Controller name="lat" control={form.control} render={({ field: latField }) => (
                    <Controller name="lng" control={form.control} render={({ field: lngField }) => (
                      <LocationPicker
                        className="w-full"
                        apiKey={process.env.GOOGLE_MAPS_API_KEY!}
                        value={{ lat: latField.value || 0, lng: lngField.value || 0 }}
                        onValueChange={(val) => {
                          latField.onChange(val?.lat);
                          lngField.onChange(val?.lng);
                        }}
                      />
                    )} />
                  )} />

                  {/* Summary */}
                  <FormField name="summary" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Summary</FormLabel>
                      <FormControl><Textarea {...field} /></FormControl>
                      <FormDescription>Write a short summary about yourself.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Phone, Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField name="phone" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <PhoneInput {...field} defaultCountry="TR" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="email" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Selects */}
                  <FormField
                    control={form.control}
                    name="skillType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skill Type</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select skill type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TECH">TECH</SelectItem>
                              <SelectItem value="NON-TECH">NON-TECH</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="disability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Disability</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select disability" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Gender - ["Male", "Female", "Other"] */}
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Experience Level - ["Entry Level", "Mid Level", "Senior Level"] */}
                    <FormField
                      control={form.control}
                      name="experienceLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience Level</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select experience level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Entry Level">Entry Level</SelectItem>
                                <SelectItem value="Mid Level">Mid Level</SelectItem>
                                <SelectItem value="Senior Level">Senior Level</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Job Type - ["Full-Time", "Part-Time", "Internship"] */}
                    <FormField
                      control={form.control}
                      name="contractType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contract Type</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select contract type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Internship">Internship</SelectItem>
                                <SelectItem value="Apprenticeship">Apprenticeship</SelectItem>
                                <SelectItem value="Volunteer">Volunteer</SelectItem>
                                <SelectItem value="Freelance">Freelance</SelectItem>
                                <SelectItem value="Employee permanent contract">Employee permanent contract</SelectItem>
                                <SelectItem value="Employee short-term contract">Employee short-term contract</SelectItem>
                                <SelectItem value="External Consultant">External Consultant</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="mx-auto max-w-xl space-y-6">
                    <div className="space-y-1.5 text-center">
                      <h2 className="text-2xl font-semibold">Skills</h2>
                      <p className="text-sm text-muted-foreground">Separate skills by commas.</p>
                    </div>

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
                              onChange={(e) => handleSkillsChange(e.target.value, setHardSkillsInput, "hardSkills")}
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
                              onChange={(e) => handleSkillsChange(e.target.value, setSoftSkillsInput, "softSkills")}
                            />
                          </FormControl>
                          <FormDescription>e.g. personal or interpersonal skills</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="mx-auto max-w-xl space-y-6">
                    <div className="space-y-1.5 text-center">
                      <h2 className="text-2xl font-semibold">Work Experience</h2>
                      <p className="text-sm text-muted-foreground">Add as many as you like</p>
                    </div>

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                      modifiers={[restrictToVerticalAxis]}
                    >
                      <SortableContext items={fields} strategy={verticalListSortingStrategy}>
                        {fields.map((field, index) => (
                          <div key={field.id} className="space-y-3 border p-3 rounded-md bg-white">
                            {/* Position */}
                            <FormField
                              control={form.control}
                              name={`workExperiences.${index}.position`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Job Title</FormLabel>
                                  <FormControl><Input {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Company */}
                            <FormField
                              control={form.control}
                              name={`workExperiences.${index}.company`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company</FormLabel>
                                  <FormControl><Input {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-3">
                              <FormField
                                control={form.control}
                                name={`workExperiences.${index}.startDate`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Start Date</FormLabel>
                                    <FormControl><Input type="date" {...field} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`workExperiences.${index}.endDate`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>End Date</FormLabel>
                                    <FormControl><Input type="date" {...field} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Description */}
                            <FormField
                              control={form.control}
                              name={`workExperiences.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl><Textarea {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <Button type="button" variant="destructive" onClick={() => remove(index)}>Remove</Button>
                          </div>
                        ))}
                      </SortableContext>
                    </DndContext>

                    <Button type="button" onClick={() => append({ position: "", company: "", startDate: "", endDate: "", description: "" })}>
                      Add Work Experience
                    </Button>
                  </div>
                  <div className="mx-auto max-w-xl space-y-6">
                    <div className="space-y-1.5 text-center">
                      <h2 className="text-2xl font-semibold">Education</h2>
                      <p className="text-sm text-muted-foreground">
                        Add as many educations as you like.
                      </p>
                    </div>

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleEducationDragEnd}
                      modifiers={[restrictToVerticalAxis]}
                    >
                      <SortableContext items={educationFields} strategy={verticalListSortingStrategy}>
                        {educationFields.map((field, index) => (
                          <div
                            key={field.id}
                            className="space-y-3 rounded-md border bg-background p-3"
                          >
                            <div className="flex justify-between gap-2">
                              <span className="font-semibold">Education {index + 1}</span>
                              <GripHorizontal className="size-5 cursor-grab text-muted-foreground" />
                            </div>

                            {/* Degree */}
                            <FormField
                              control={form.control}
                              name={`educations.${index}.degree`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Degree</FormLabel>
                                  <FormControl><Input {...field} autoFocus /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* School */}
                            <FormField
                              control={form.control}
                              name={`educations.${index}.school`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>School</FormLabel>
                                  <FormControl><Input {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-3">
                              <FormField
                                control={form.control}
                                name={`educations.${index}.startDate`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Start date</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} value={field.value?.slice(0, 10)} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`educations.${index}.endDate`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>End date</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} value={field.value?.slice(0, 10)} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <Button
                              variant="destructive"
                              type="button"
                              onClick={() => removeEducation(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </SortableContext>
                    </DndContext>

                    <Button
                      type="button"
                      onClick={() =>
                        appendEducation({
                          degree: "",
                          school: "",
                          startDate: "",
                          endDate: "",
                        })
                      }
                    >
                      Add education
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button type="submit">Submit</Button>
                  </div>
                </form>
              </Form>
              {/* <SkillsForm
                resumeData={resumeData}
                setResumeData={setResumeData}
              /> */}
              {/* <WorkExperienceForm
                resumeData={resumeData}
                setResumeData={setResumeData}
              /> */}
            </div>
            <div className="grow md:border-r" />
            <ResumePreviewSection
              resumeData={resumeData}
              setResumeData={setResumeData}
              className={cn(showSmResumePreview && "flex")}
            />
          </div>
        </main>
      <Footer
        // currentStep={currentStep}
        // setCurrentStep={setStep}
        showSmResumePreview={showSmResumePreview}
        setShowSmResumePreview={setShowSmResumePreview}
        // isSaving={isSaving}
      />
    </div>
    </main>
    )
}