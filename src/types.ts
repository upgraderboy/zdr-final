import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc/routers/_app";

export type GetAllCompaniesOutput = inferRouterOutputs<AppRouter>["companies"]["getAllCompanies"];
export type GetAllJobsOutput = inferRouterOutputs<AppRouter>["job"]["getAllJobs"];
export type CandidateAnalysisOutput = inferRouterOutputs<AppRouter>["analysis"]["candidateAnalysis"];
export type CompanyAnalysisOutput = inferRouterOutputs<AppRouter>["analysis"]["companyAnalysis"];
export type Resume = CandidateAnalysisOutput[number]
export type Job = GetAllJobsOutput[number]
export const ageOptions = ["up to 20", "21-30", "31-40", "41-50", "51-60", "60 and up"] as const;
export type AgeOption = typeof ageOptions[number];
export type AgeCategory = "up to 20" | "21-30" | "31-40" | "41-50" | "51-60" | "60 and up";
export type Company = GetAllCompaniesOutput[number]
