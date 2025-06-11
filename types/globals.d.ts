export {}
// Create a type for the roles
export type Roles = 'CANDIDATE' | 'COMPANY'
declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean
      role?: Roles
      isSubscribed?: boolean | null
      plan?: "FREE" | "MONTHLY" | "YEARLY"
    }
  }
  interface SessionClaims extends CustomJwtSessionClaims {}
}

import { Prisma } from "@prisma/client";
import { ResumeValues } from "@/lib/validation"
import { InferSelectModel } from "drizzle-orm"

export interface EditorFormProps {
  resumeData: ResumeValues;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeValues>>;
}

export type ResumeServerData = InferSelectModel<typeof resumes> & {
  workExperiences: InferSelectModel<typeof workExperiences>[];
  educations: InferSelectModel<typeof educations>[];
};