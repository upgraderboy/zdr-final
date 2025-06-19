import { createTRPCRouter } from "@/trpc/init";
import { candidateProcedure, companyProcedure } from "@/trpc/init";
import { db } from "@/db";
import { jobApplications, jobs, resumes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { JobWithApplication } from "../ui/components/types";
import { TRPCError } from "@trpc/server";
export const applicationRouter = createTRPCRouter({
  getApplicationsByCandidate: candidateProcedure.query(async ({ ctx }) => {


    const applications = await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.candidateId, ctx.user.id))
      .leftJoin(jobs, eq(jobApplications.jobId, jobs.id))
      .leftJoin(resumes, eq(jobApplications.resumeId, resumes.id));

    const result = applications.map((row) => {
      const job = row.jobs;
      const application = row.job_applications;
      const resume = row.resumes;

      if (!job || !application || !resume) return null;

      return {
        ...job,
        application: {
          id: application.id,
          jobId: application.jobId,
          candidateId: application.candidateId,
          resumeId: application.resumeId,
          applicationStatus: application.applicationStatus,
          appliedAt: application.appliedAt,
        },
        appliedWithResume: {
          id: resume.id,
          title: resume.title ?? undefined,
          firstName: resume.firstName ?? undefined,
          lastName: resume.lastName ?? undefined,
          jobTitle: resume.jobTitle ?? undefined,
          summary: resume.summary ?? undefined,
          photoUrl: resume.photoUrl ?? undefined,
          isDefault: resume.isDefault,
          experienceLevel: resume.experienceLevel,
          contractType: resume.contractType,
          skillType: resume.skillType,
          createdAt: resume.createdAt,
        },
      };
    }).filter(Boolean); // Filter out nulls in case of any missing data

    return result as JobWithApplication[];
  }),
  // getJobApplicationsByJobId: companyProcedure.query(async ({ ctx }) => {
  //     const applications = await db
  //         .select({ application: jobApplications })
  //         .from(jobApplications)
  //         .where(eq(jobApplications.jobId, ctx.user.id)).leftJoin(jobs, eq(jobApplications.jobId, jobs.id));
  //     return applications.map((item) => item.application);
  // }),
  // getJobApplicationsByResumeId: candidateProcedure.query(async ({ ctx }) => {
  //     const applications = await db
  //         .select({ application: jobApplications })
  //         .from(jobApplications)
  //         .where(eq(jobApplications.resumeId, ctx.user.id));
  //     return applications.map((item) => item.application);
  // }),
  createApplication: candidateProcedure.input(z.object({ jobId: z.string(), resumeId: z.string() })).mutation(async ({ ctx, input }) => {
    const { jobId, resumeId } = input;
    const candidateId = ctx.user.id;
    // check if candidate already applied to the job, if yes then update the resumeId
    const existing = await db
      .select()
      .from(jobApplications)
      .where(and(eq(jobApplications.jobId, jobId), eq(jobApplications.candidateId, candidateId)));
    if (existing.length > 0) {
      await db
        .update(jobApplications)
        .set({ resumeId })
        .where(and(eq(jobApplications.jobId, jobId), eq(jobApplications.candidateId, candidateId)));
      return true;
    } else {
      await db.insert(jobApplications).values({ jobId, resumeId, candidateId });
    }
    return true;
  }),
  removeApplication: candidateProcedure.input(z.object({ jobId: z.string() })).mutation(async ({ ctx, input }) => {
    const { jobId } = input;
    const id = ctx.user.id;
    const existing = await db
      .select()
      .from(jobApplications)
      .where(
        and(
          eq(jobApplications.jobId, jobId),
          eq(jobApplications.candidateId, id)
        )
      );

    if (existing.length > 0) {
      const application = existing[0];

      if (application.applicationStatus !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can only remove pending applications",
        });
      }

      await db
        .delete(jobApplications)
        .where(
          and(
            eq(jobApplications.jobId, jobId),
            eq(jobApplications.candidateId, id)
          )
        );

      return { message: "Application Removed Successfully!" };
    }
    return { message: "Application not found" };
  }),
  getCompanyJobs: companyProcedure.query(async ({ ctx }) => {
    const jobList = await db.select().from(jobs).where(eq(jobs.companyId, ctx.user.id));
    const jobsWithStats = await Promise.all(jobList.map(async (job) => {
      const applications = await db.select().from(jobApplications).where(eq(jobApplications.jobId, job.id)).leftJoin(resumes, eq(jobApplications.resumeId, resumes.id));
      const applicationsCount = applications.length;
      const pendingCount = applications.filter((app) => app.job_applications.applicationStatus === "PENDING").length;
      const shortlistedCount = applications.filter((app) => app.job_applications.applicationStatus === "SHORTLISTED").length;
      const hiredCount = applications.filter((app) => app.job_applications.applicationStatus === "HIRED").length;
      const rejectedCount = applications.filter((app) => app.job_applications.applicationStatus === "REJECTED").length;

      return {
        ...job,
        softSkills: job.softSkills ?? [],
        hardSkills: job.hardSkills ?? [],
        salaryRange: job.salaryRange ?? undefined,
        jobType: job.jobType ?? "On Site",
        stateName: job.stateName ?? "",
        countryName: job.countryName ?? "",
        companyName: job.companyName ?? "",
        ageCategory: job.ageCategory ?? [],
        isDisabilityAllowed: job.isDisabilityAllowed ?? false,
        isPublished: job.isPublished ?? false,
        companyId: job.companyId,
        createdAt: job.createdAt.toISOString(), // Convert to string for serialization
        applicationsCount,
        pendingCount,
        shortlistedCount,
        hiredCount,
        rejectedCount,
      };
    }));
    return jobsWithStats;
  }),
  getJobApplications: companyProcedure.input(z.object({ jobId: z.string() })).query(async ({ input }) => {
    const applications = await db.select().from(jobApplications).where(eq(jobApplications.jobId, input.jobId)).leftJoin(resumes, eq(jobApplications.resumeId, resumes.id));

    return applications.map((app) => {
      const candidate = applications.find((c) => c.job_applications.candidateId === app.job_applications.candidateId)
      const resume = applications.find((r) => r.job_applications.resumeId === app.job_applications.resumeId)

      return {
        ...app,
        applicationStatus: app.job_applications.applicationStatus || "PENDING",
        appliedAt: app.job_applications.appliedAt.toISOString(), // Convert to string for serialization
        candidate,
        resume,
      }
    })
  }),
  updateApplicationStatus: companyProcedure
    .input(
      z.object({
        applicationId: z.string(),
        status: z.enum(["PENDING", "SHORTLISTED", "HIRED", "REJECTED"]),
      }),
    )
    .mutation(async ({ input }) => {
      const application = await db.select().from(jobApplications).where(eq(jobApplications.id, input.applicationId));
      if (application.length === 0) {
        return { success: false, message: "Application not found" }
      }
      await db.update(jobApplications).set({ applicationStatus: input.status }).where(eq(jobApplications.id, input.applicationId));
      return { success: true, message: "Application status updated successfully" }
    })
});