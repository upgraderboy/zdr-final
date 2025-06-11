import { db } from "@/db";
import { companies, educations, jobs, resumes, workExperiences } from "@/db/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/trpc/init";
import { desc, eq, getTableColumns } from "drizzle-orm";
import { ResumeServerData } from "../../../../types/globals";
import { groupBy } from "lodash";





// Inferred types for selected data
type Company = typeof companies.$inferSelect;
type Job = typeof jobs.$inferSelect;

type CompanyWithJobs = Company & {
    jobs: Job[];
};
export const analysisRouter = createTRPCRouter({
    candidateAnalysis: publicProcedure.query(async () => {
        
            // Fetch resumes with their related work experiences and educations
            // console.log("userId: ", userId)
            // console.log("-------------------Error------------------")
            const userResumes = await db
              .select({
                ...getTableColumns(resumes),
                workExperiences: getTableColumns(workExperiences),
                educations: getTableColumns(educations),
              })
              .from(resumes)
              .leftJoin(workExperiences, eq(resumes.id, workExperiences.resumeId))
              .leftJoin(educations, eq(resumes.id, educations.resumeId))
              .orderBy(desc(resumes.createdAt));
              console.log("-------------------Error------------------")
            // console.log("userResumes: ", userResumes)
            // Group the results to create the ResumeServerData structure
            const groupedResumes = groupBy(userResumes, 'id');
            console.log("groupedResumes: ", groupedResumes)
            return Object.values(groupedResumes).map(resumeGroup => ({
              ...resumeGroup[0],
              workExperiences: resumeGroup
                .filter(item => item.workExperiences !== null)
                .map(item => item.workExperiences),
              educations: resumeGroup
                .filter(item => item.educations !== null)
                .map(item => item.educations),
            })) as ResumeServerData[];
    }),
    companyAnalysis: protectedProcedure.query(async () => {
        const data = await db
            .select({
                company: companies,
                job: jobs,
            })
            .from(companies)
            .leftJoin(jobs, eq(companies.id, jobs.companyId));
        const companyMap = new Map<string, CompanyWithJobs>();

        for (const row of data) {
            const companyId = row.company.id;

            if (!companyMap.has(companyId)) {
                companyMap.set(companyId, {
                    ...row.company,
                    jobs: [],
                });
            }

            if (row.job) {
                companyMap.get(companyId)?.jobs.push(row.job);
            }
        }

        const companiesWithJobs: CompanyWithJobs[] = Array.from(companyMap.values());
        console.log("data: ", companiesWithJobs)
        return companiesWithJobs;
    })
});
