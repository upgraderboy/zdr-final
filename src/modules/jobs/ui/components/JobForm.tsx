"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Textarea } from "@/components/ui/textarea"

import { z } from "zod"

import { trpc } from "@/trpc/client"
import { jobInsertSchema } from "@/db/schema"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ageOptions } from "@/types"
import LoadingButton from "@/modules/resumes/ui/components/LoadingButton"
import { useRouter } from "next/navigation"
import { useState } from "react"
interface JobFormProps {
  initialData?: z.infer<typeof jobInsertSchema> & { id?: string }; // id optional for new record
}
export default function JobForm({ initialData }: JobFormProps) {
  console.log(initialData)
  const isEdit = !!initialData?.id;
  const [softSkillsInput, setSoftSkillsInput] = useState(
        (initialData?.softSkills || []).join(", ")
      );
      const [hardSkillsInput, setHardSkillsInput] = useState(
        (initialData?.hardSkills || []).join(", ")
      );
  console.log(isEdit)
  const utils = trpc.useUtils();
  const router = useRouter();
  const createJob = trpc.job.createJob.useMutation({
    onSuccess: () => {
      utils.job.getAllJobs.invalidate(); // refetch after create
      toast("Job successfully created!");
      router.push("/jobs")
    },
  });

  const handleSkillsChange = (
    rawValue: string,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    fieldName: "softSkills" | "hardSkills"
  ) => {
    setInput(rawValue);
    form.setValue(fieldName, rawValue.split(",").map((s) => s.trim()).filter(Boolean));
  };
  const updateJob = trpc.job.updateJob.useMutation({
    onSuccess: () => {
      utils.job.invalidate(); // refetch after update
      toast("Job successfully updated!");
      router.push("/jobs")
    },
  });
  const form = useForm<z.infer<typeof jobInsertSchema>>({
    resolver: zodResolver(jobInsertSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      contractType: "Internship",
      experienceLevel: "Entry Level",
      ageCategory: [],
      isDisabilityAllowed: false,
      genderPreference: "All",
      domainType: "TECH",
      softSkills: [],
      hardSkills: [],
      salaryRange: "",
      companyId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  const onSubmit = async (values: z.infer<typeof jobInsertSchema>) => {
    if (isEdit && initialData?.id) {
      await updateJob.mutateAsync({ ...values, id: initialData.id });
      
    } else {
      await createJob.mutateAsync(values);
      
    }
  };
  console.log(JSON.stringify(form.formState.errors));
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* Name Position */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name Position *</FormLabel>
              <FormControl>
                <Input placeholder="Name Position" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Job Offer */}
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Job Offer</FormLabel>
            <FormControl>
              <Textarea placeholder="Write max 300 mots" className="h-32" {...field} value={field.value || ""} />
            </FormControl>
          </FormItem>
        )} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Contract Type */}
          <FormField control={form.control} name="contractType" render={({ field }) => (
            <FormItem>
              <FormLabel>Search Contract Type *</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apprenticeship">Apprenticeship</SelectItem>
                    <SelectItem value="Volunteer">Volunteer</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                    <SelectItem value="Employee permanent contract">Employee permanent contract</SelectItem>
                    <SelectItem value="Employee short-term contract">Employee short-term contract</SelectItem>
                    <SelectItem value="External Consultant">External Consultant</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Gender Preference */}
          <FormField control={form.control} name="genderPreference" render={({ field }) => (
            <FormItem>
              <FormLabel>Gender Preference *</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value || "All"}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Gender Preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Disability Choice */}
        <FormField
          control={form.control}
          name="isDisabilityAllowed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Disability Choice *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(val) => field.onChange(val === "true")}
                  value={field.value === true ? "true" : "false"}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="yes" />
                    <FormLabel htmlFor="yes">Yes</FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="no" />
                    <FormLabel htmlFor="no">No</FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Job Domain - TECH or NON-TECH */}
        <FormField control={form.control} name="domainType" render={({ field }) => (
          <FormItem>
            <FormLabel>Job Domain *</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} value={field.value || "TECH"}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Job Domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TECH">TECH</SelectItem>
                  <SelectItem value="NON-TECH">NON-TECH</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        {/* Age Category */}
        <FormField control={form.control} name="ageCategory" render={({ field }) => (
          <FormItem>
            <FormLabel>Age Category *</FormLabel>
            <FormControl>
              <div className="grid grid-cols-3 gap-4">
                {ageOptions.map((age) => (
                  <div key={age} className="flex items-center space-x-2">
                    <Checkbox id={age} checked={field.value?.includes(age)} onCheckedChange={(checked) => {
                      if (checked) {
                        field.onChange([...field.value, age])
                      } else {
                        field.onChange(field.value?.filter((item) => item !== age))
                      }
                    }} />
                    <FormLabel htmlFor={age}>{age}</FormLabel>
                  </div>
                ))}
              </div>
            </FormControl>
          </FormItem>
        )} />

        {/* Experience */}
        <FormField control={form.control} name="experienceLevel" render={({ field }) => (
          <FormItem>
            <FormLabel>Experience *</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Experience Level" />
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
        )} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
        {/* Put 3 choices - On Site, Remote, Hybrid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField control={form.control} name="jobType" render={({ field }) => (
          <FormItem>
            <FormLabel>Job Type *</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} value={field.value || "On Site"}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="On Site">On Site</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        {/* Add Salary */}
        <FormField
          control={form.control}
          name="salaryRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary</FormLabel>
              <FormControl>
                <Input {...field} type="number" placeholder="e.g. 50000" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        {/* Annual Salary */}
        {/* <FormField control={form.control} name="annualSalary" render={({ field }) => (
          <FormItem>
            <FormLabel>Annual Salary *</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30k-50k">$30,000 - $50,000</SelectItem>
                  <SelectItem value="50k-70k">$50,000 - $70,000</SelectItem>
                  <SelectItem value="70k-90k">$70,000 - $90,000</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} /> */}

        {/* Monthly Salary */}
        {/* <FormField control={form.control} name="monthlySalary" render={({ field }) => (
          <FormItem>
            <FormLabel>Monthly Salary *</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-[50%]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2k-3k">$2,000 - $3,000</SelectItem>
                  <SelectItem value="3k-4k">$3,000 - $4,000</SelectItem>
                  <SelectItem value="4k-5k">$4,000 - $5,000</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} /> */}

        {/* Hard Skills */}
        {/* <FormField control={form.control} name="hardSkill" render={({ field }) => (
          <FormItem>
            <FormLabel>Hard Skills *</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="programming">Programming</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} /> */}

        {/* Soft Skills */}
        {/* <FormField control={form.control} name="softSkill" render={({ field }) => (
          <FormItem>
            <FormLabel>Soft Skills *</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="leadership">Leadership</SelectItem>
                  <SelectItem value="teamwork">Teamwork</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} /> */}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <LoadingButton loading={createJob.isPending || updateJob.isPending} disabled={createJob.isPending || updateJob.isPending} onClick={form.handleSubmit(onSubmit)}>Submit</LoadingButton>
        </div>

      </form>
    </Form>
  )
}
