export type ContractType = "Internship" | "Apprenticeship" | "Volunteer" | "Freelance" | "Employee permanent contract" | "Employee short-term contract" | "External Consultant"
export type ExperienceLevel = "Entry Level" | "Mid Level" | "Senior Level"
export type GenderPreference = "Male" | "Female" | "All"
export type AgeCategory = "up to 20" | "21-30" | "31-40" | "41-50" | "51-60" | "60 and up"
export type DomainType = "TECH" | "NON-TECH" | "FINANCE" | "HEALTHCARE" | "MARKETING" | "EDUCATION"
export type JobType = "Remote" | "On Site" | "Hybrid"

export interface JobData {
  id: string
  title: string
  description: string
  contractType: ContractType
  experienceLevel: ExperienceLevel
  softSkills: string[]
  hardSkills: string[]
  salaryRange: string | null
  genderPreference: GenderPreference
  jobType: JobType
  stateName: string | null
  countryName: string | null
  companyName: string | null
  ageCategory: AgeCategory[]
  isDisabilityAllowed: boolean
  isPublished: boolean
  domainType: DomainType
  createdAt: string
}

export interface AnalyticsFilters {
  contractType?: ContractType[]
  experienceLevel?: ExperienceLevel[]
  genderPreference?: GenderPreference[]
  jobType?: JobType[]
  isDisabilityAllowed?: boolean[]
  domainType?: DomainType[]
  salaryRange?: string[]
}

export interface SummaryStats {
  totalJobs: number
  totalCompanies: number
  remoteJobs: number
  disabilityFriendlyJobs: number
  averageSalary: string
}
