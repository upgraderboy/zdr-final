import { z } from "zod";

export const optionalString = z.string().trim().optional().or(z.literal(""));
export const optionalNumber = z.number().optional();

export const generalInfoSchema = z.object({
  title: optionalString,
  description: optionalString,
});

export type GeneralInfoValues = z.infer<typeof generalInfoSchema>;
export const experienceLevelEnum = z.enum(["Entry Level", "Mid Level", "Senior Level"]);
export const contractTypeEnum = z.enum(["Internship", "Apprenticeship", "Volunteer", "Freelance", "Employee permanent contract", "Employee short-term contract", "External Consultant"]);
export const genderEnum = z.enum(["Male", "Female", "Other"]);
export const disabilityEnum = z.enum(["Yes", "No"]);
export const skillTypeEnum = z.enum(["TECH", "NON-TECH"]);

export const personalInfoSchema = z.object({
  photoUrl: z.string().optional(),
  firstName: optionalString,
  lastName: optionalString,
  jobTitle: optionalString,
  summary: optionalString,
  age: z.coerce.number().min(0).optional(),
  city: optionalString,
  country: optionalString,
  phone: optionalString,
  email: optionalString,
  lat: optionalNumber,
  lng: optionalNumber,
  experienceLevel: experienceLevelEnum.optional(),
  contractType: contractTypeEnum.optional(),
  gender: genderEnum.optional(),
  disability: disabilityEnum.optional(),
  skillType: skillTypeEnum.optional(),
});

export type PersonalInfoValues = z.infer<typeof personalInfoSchema>;


const workExperienceItemSchema = z
  .object({
    position: z.string().min(1, {
      message: "Required"
    }),
    company: z.string().min(1, {
      message: "Required"
    }),
    startDate: z.string().min(1, {
      message: "Required"
    }),
    endDate: z.string().min(1, {
      message: "Required"
    }),
    description: z.string().min(1, {
      message: "Required"
    }),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true; // skip if either is missing
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

export const workExperienceSchema = z.object({
  workExperiences: z.array(workExperienceItemSchema),
});
export type WorkExperience = NonNullable<
  z.infer<typeof workExperienceSchema>["workExperiences"]
>[number];
// Assuming optionalString = z.string().optional() or similar
const educationItemSchema = z
  .object({
    degree: z.string().min(1, {
      message: "Required"
    }),
    school: z.string().min(1, {
      message: "Required"
    }),
    startDate: z.string().min(1, {
      message: "Required"
    }),
    endDate: z.string().min(1, {
      message: "Required"
    }),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true; // skip validation if either is missing
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date must be after start date",
      path: ["endDate"], // shows error under endDate
    }
  );

export const educationSchema = z.object({
  educations: z.array(educationItemSchema),
});

export type EducationValues = z.infer<typeof educationSchema>;
export type WorkExperienceValues = z.infer<typeof workExperienceSchema>;
export const skillsSchema = z.object({
  softSkills: z.array(z.string().trim()).optional(),
  hardSkills: z.array(z.string().trim()).optional(),
});

export type SkillsValues = z.infer<typeof skillsSchema>;

export const summarySchema = z.object({
  summary: optionalString,
});

export type SummaryValues = z.infer<typeof summarySchema>;

export const resumeSchema = z.object({
  id: z.string().optional(),
  ...generalInfoSchema.shape,
  ...personalInfoSchema.shape,
  ...workExperienceSchema.shape,
  ...educationSchema.shape,
  ...skillsSchema.shape,
  ...summarySchema.shape,
  colorHex: optionalString,
  borderStyle: optionalString,
  experienceLevel: z.enum(["Entry Level", "Mid Level", "Senior Level"]).optional(),
  contractType: z.enum(["Internship", "Apprenticeship", "Volunteer", "Freelance", "Employee permanent contract", "Employee short-term contract", "External Consultant"]).optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  disability: z.enum(["Yes", "No"]).optional(),
});

export type ResumeValues = Omit<z.infer<typeof resumeSchema>, "photoUrl"> & {
  id?: string;
  photoUrl?: string | undefined;
};

export const generateWorkExperienceSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Required")
    .min(20, "Must be at least 20 characters"),
});

export type GenerateWorkExperienceInput = z.infer<
  typeof generateWorkExperienceSchema
>;

export const generateSummarySchema = z.object({
  jobTitle: optionalString,
  ...workExperienceSchema.shape,
  ...educationSchema.shape,
  ...skillsSchema.shape,
});

export type GenerateSummaryInput = z.infer<typeof generateSummarySchema>;

export const generateSkillsSchema = z.object({
  skills: z
    .array(z.string().trim())
    .min(1, "Required")
    .max(10, "Must be at most 10 skills"),
});

export type GenerateSkillsInput = z.infer<typeof generateSkillsSchema>;