export interface Job {
    id: string
    title: string
    description: string
    contractType: "Internship" | "Apprenticeship" | "Volunteer" | "Freelance" | "Employee permanent contract" | "Employee short-term contract" | "External Consultant"
    experienceLevel: "Entry Level" | "Mid Level" | "Senior Level"
    softSkills: string[]
    hardSkills: string[]
    salaryRange?: string
    genderPreference: "Male" | "Female" | "All"
    jobType: "Remote" | "On Site" | "Hybrid"
    stateName?: string
    countryName?: string
    companyName?: string
    ageCategory: string[]
    isDisabilityAllowed: boolean
    companyId: string
    createdAt: Date
    updatedAt: Date
  }
  
  export interface Resume {
    id: string
    title?: string
    firstName?: string
    lastName?: string
    jobTitle?: string
    summary?: string
    photoUrl?: string
    isDefault: boolean
    experienceLevel: "Entry Level" | "Mid Level" | "Senior Level"
    contractType: "Internship" | "Apprenticeship" | "Volunteer" | "Freelance" | "Employee permanent contract" | "Employee short-term contract" | "External Consultant"
    skillType: "TECH" | "NON-TECH"
    createdAt: Date
  }
  
  export interface JobApplication {
    id: string
    jobId: string
    candidateId: string
    resumeId: string
    applicationStatus: "PENDING" | "SHORTLISTED" | "HIRED" | "REJECTED"
    appliedAt: Date
  }
  
  export interface JobWithApplication extends Job {
    application?: JobApplication
    appliedWithResume?: Resume
  }
  