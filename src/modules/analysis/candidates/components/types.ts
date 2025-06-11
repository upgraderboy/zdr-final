export type Gender = "Male" | "Female" | "Other"
export type ExperienceLevel = "Entry Level" | "Mid Level" | "Senior Level"
export type ContractType = "Internship" | "Apprenticeship" | "Volunteer" | "Freelance" | "Employee permanent contract" | "Employee short-term contract" | "External Consultant"
export type Disability = "Yes" | "No"
export type SkillType = "TECH" | "NON-TECH"
export type AgeCategory = "up to 20" | "21-30" | "31-40" | "41-50" | "51-60" | "60 and up"

export interface ResumeAnalytics {
  id: string
  firstName: string
  lastName: string
  email: string
  jobTitle: string
  city: string
  country: string
  phone: string
  category: string
  gender: Gender
  experienceLevel: ExperienceLevel
  contractType: ContractType
  disability: Disability
  skillType: SkillType
  age: number
  ageCategory: AgeCategory
  softSkills: string[]
  hardSkills: string[]
  createdAt: string
}

export interface FilterState {
  gender?: Gender[]
  experienceLevel?: ExperienceLevel[]
  contractType?: ContractType[]
  disability?: Disability[]
  skillType?: SkillType[]
  ageCategory?: AgeCategory[]
}

export interface ChartDataPoint {
  name: string
  value: number
  percentage: number
}
