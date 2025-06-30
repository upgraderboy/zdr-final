import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ResumeServerData } from "../../types/globals";
import { ResumeValues } from "./validation";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const formatDuration = (duration: number)=>{
  const seconds = Math.floor((duration % 60000) / 1000);
  const minutes = Math.floor(duration / 60000);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}
export const snakeCaseToTitle = (str: string)=>{
  return str.replace(/_/g, " ").replace(/\b\w/g, (char)=> char.toUpperCase());
}

export function fileReplacer(key: unknown, value: unknown) {
  return value instanceof File
    ? {
        name: value.name,
        size: value.size,
        type: value.type,
        lastModified: value.lastModified,
      }
    : value;
}

export function mapToResumeValues(data: ResumeServerData): ResumeValues {
  return {
    id: data.id,
    title: data.title || undefined,
    description: data.description || undefined,
    photoUrl: data.photoUrl || undefined,
    firstName: data.firstName || undefined,
    lastName: data.lastName || undefined,
    jobTitle: data.jobTitle || undefined,
    city: data.city || undefined,
    country: data.country || undefined,
    phone: data.phone || undefined,
    email: data.email || undefined,
    workExperiences: (data.workExperiences ?? []).map((exp) => ({
      position: exp.position,
      company: exp.company,
      startDate: exp.startDate?.toISOString().split("T")[0] ?? "",
      endDate: exp.endDate?.toISOString().split("T")[0] ?? "",
      description: exp.description ?? "",
    })),
    educations: (data.educations ?? []).map((edu) => ({
      degree: edu.degree ?? "",
      school: edu.school ?? "",
      startDate: edu.startDate?.toISOString().split("T")[0] ?? "",
      endDate: edu.endDate?.toISOString().split("T")[0] ?? "",
    })),
    hardSkills: data.hardSkills,
    softSkills: data.softSkills,
    borderStyle: data.borderStyle,
    colorHex: data.colorHex,
    summary: data.summary || undefined,
    disability: data.disability || undefined,
    gender: data.gender || undefined,
    experienceLevel: data.experienceLevel || undefined,
    contractType: data.contractType || undefined,
    age: data.age || undefined,
    skillType: data.skillType || undefined,
  };
}

// Helper function to format dates with fallback
export function formatDate(date: Date | null | undefined): string {
  if (!date) return "Present"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}
export function sanitizeResume(resume: ResumeServerData): ResumeServerData {
  return {
    ...resume,
    email: resume.email ?? undefined,
    photoUrl: resume.photoUrl ?? undefined,
    workExperiences: resume.workExperiences.map((exp) => ({
      position: exp.position,
      company: exp.company,
      startDate: exp.startDate?.toISOString().split("T")[0],
      endDate: exp.endDate?.toISOString().split("T")[0],
      description: exp.description,
    })),
    educations: resume.educations.map((edu) => ({
      degree: edu.degree,
      school: edu.school,
      startDate: edu.startDate?.toISOString().split("T")[0],
      endDate: edu.endDate?.toISOString().split("T")[0],
    })),
    // aur jitne bhi nullable fields ho unko undefined karo
    hardSkills: resume.hardSkills,
    softSkills: resume.softSkills,
    borderStyle: resume.borderStyle,
    colorHex: resume.colorHex,
    summary: resume.summary ?? undefined,
    // category: resume.category ?? undefined,
    disability: resume.disability ?? undefined,
    gender: resume.gender ?? undefined,
    experienceLevel: resume.experienceLevel ?? undefined,
    contractType: resume.contractType ?? undefined,
    age: resume.age ?? undefined,
  };
}

export function isResumeComplete(input: ResumeServerData): boolean {
  const {
    firstName, lastName, jobTitle, summary, age, city, country, phone, email,
    experienceLevel, contractType, gender, disability, skillType,
    softSkills, hardSkills, workExperiences, educations,
  } = input;

  const hasPersonalInfo = firstName && lastName && jobTitle && email && phone && city && country;

  const hasSkills = softSkills?.length > 0 && hardSkills?.length > 0;
  const hasWork = workExperiences?.length > 0;
  const hasEdu = educations?.length > 0;
  const hasMeta = experienceLevel && contractType && gender && disability && skillType;
  console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
  console.log(hasPersonalInfo, summary, age !== undefined, hasSkills, hasWork, hasEdu, hasMeta)
  return Boolean(hasPersonalInfo && summary && age !== undefined && hasSkills && hasWork && hasEdu && hasMeta);
}
