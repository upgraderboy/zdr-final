import { z } from "zod"

export const applicationStatusEnum = z.enum(["PENDING", "SHORTLISTED", "HIRED", "REJECTED"])

export const contractTypeEnum = z.enum(["Internship", "Apprenticeship", "Volunteer", "Freelance", "Employee permanent contract", "Employee short-term contract", "External Consultant"])

export const experienceLevelEnum = z.enum(["Entry Level", "Mid Level", "Senior Level", "Executive"])

export const genderEnum = z.enum(["Male", "Female", "Other"])

export const ageCategoryEnum = z.enum(["up to 20", "21-30", "31-40", "41-50", "51-60", "60 and up"])

export const positionGenderEnum = z.enum(["Male", "Female", "All"])
export type ApplicationStatus = z.infer<typeof applicationStatusEnum>
export type ContractType = z.infer<typeof contractTypeEnum>
export type ExperienceLevel = z.infer<typeof experienceLevelEnum>
export type Gender = z.infer<typeof genderEnum>
export type AgeCategory = z.infer<typeof ageCategoryEnum>
export type GenderPreference = z.infer<typeof positionGenderEnum>


export interface Company {
    id: string
    name: string
    email: string
    companyName: string
    logoUrl?: string
  }
  
  export interface Candidate {
    id: string
    name: string
    email: string
    imageUrl?: string
    isVerified: boolean
  }
  
  export interface Resume {
    id: string
    userId: string
    title: string
    firstName: string
    lastName: string
    jobTitle: string
    city: string
    country: string
    phone: string
    email: string
    summary: string
    softSkills: string[]
    hardSkills: string[]
    experienceLevel: ExperienceLevel
    gender: Gender
    age: number
  }
  
  export interface Job {
    id: string
    title: string
    description: string
    contractType: ContractType
    experienceLevel: ExperienceLevel
    softSkills: string[]
    hardSkills: string[]
    salaryRange?: string
    genderPreference: GenderPreference
    jobType: "Remote" | "On Site" | "Hybrid"
    stateName?: string
    countryName?: string
    companyName: string
    ageCategory: AgeCategory[]
    isDisabilityAllowed: boolean
    isPublished: boolean
    companyId: string
    createdAt: Date | string // Can be either Date or string
  }
  
  export interface JobApplication {
    id: string
    jobId: string
    candidateId: string
    resumeId: string
    applicationStatus: ApplicationStatus
    appliedAt: Date | string // Can be either Date or string
  }