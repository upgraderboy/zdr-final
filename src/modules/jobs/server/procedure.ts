import { db } from "@/db";
import { jobs, jobInsertSchema, jobUpdateSchema, jobApplications, jobFavorites, candidates } from "@/db/schema";
import { candidateProcedure, companyProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq, ilike, asc, desc } from "drizzle-orm";
import { z } from "zod";

export const jobRouter = createTRPCRouter({
  getAllJobs: protectedProcedure.input(
    z.object({
      search: z.string().optional(),
      sortBy: z.enum(["title", "createdAt"]).default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
    }).optional()
  ).query(async ({ input }) => {
    const { search = "", sortBy = "createdAt", sortOrder = "desc" } = input || {};
  
    const sortField = {
      title: jobs.title,
      createdAt: jobs.createdAt,
    }[sortBy];
  
    const orderClause = sortOrder === "asc" ? asc(sortField) : desc(sortField);
  
    const job = await db
      .select()
      .from(jobs)
      .where(
        and(
          ilike(jobs.title, `%${search}%`),
          eq(jobs.isPublished, true)
        )
      )
      .orderBy(orderClause);
  
    if (!job) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
    }
  
    return job;
  }),
  createJob: companyProcedure
    .input(jobInsertSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = ctx.user;
      const job = await db.insert(jobs).values({
        ...input,
        hardSkills: input.hardSkills
        ?.map((s) => s.trim())
        .filter((s) => s.length > 0),
      softSkills: input.softSkills
        ?.map((s) => s.trim())
        .filter((s) => s.length > 0),
        companyId: id,
      });
      return job;
    }),
  updateJob: companyProcedure
    .input(jobUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = ctx.user;
      const job = await db.update(jobs).set({
        ...input,
        hardSkills: input.hardSkills
        ?.map((s) => s.trim())
        .filter((s) => s.length > 0),
      softSkills: input.softSkills
        ?.map((s) => s.trim())
        .filter((s) => s.length > 0),
      }).where(eq(jobs.companyId, id));
      return job;
    }),
  getJob: companyProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = ctx.user;
      const { jobId } = input;
      const job = await db.select().from(jobs).where(and(eq(jobs.id, jobId), eq(jobs.companyId, id))).then(res => res[0]);
      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }
      console.log(job);
      return job;
    }),
  getAllJobsByCompany: companyProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ input }) => {
      const { companyId } = input;
      const job = await db.select().from(jobs).where(and(eq(jobs.companyId, companyId))).then(res => res);
      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }
      console.log(job);
      return job;
    }),
  deleteJob: companyProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = ctx.user;
      const { jobId } = input;
      const job = await db.delete(jobs).where(and(eq(jobs.id, jobId), eq(jobs.companyId, id)));
      return job;
    }),

  applyJob: candidateProcedure
    .input(z.object({ jobId: z.string(), resumeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = ctx.user;
      const { jobId, resumeId } = input;
      const existing = await db.select().from(jobApplications).where(and(eq(jobApplications.jobId, jobId), eq(jobApplications.candidateId, id))).then(res => res[0]);
      if (existing) {
        await db.delete(jobApplications).where(and(eq(jobApplications.jobId, jobId), eq(jobApplications.candidateId, id)));
        return { success: true, action: "removed", message: "Job removed from your applications!" };
      }
      await db.insert(jobApplications).values({
        jobId,
        candidateId: id,
        resumeId,
      });
      return { success: true, action: "applied", message: "Job applied successfully!" };
    }),
  getJobApplications: candidateProcedure
    .query(async ({ ctx }) => {
      const { id } = ctx.user;
      const job = await db.select().from(jobApplications).where(and(eq(jobApplications.candidateId, id))).then(res => res);
      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }
      console.log(job);
      return job;
    }),
    getFavoriteJobIds: candidateProcedure.query(async ({ ctx }) => {
      const { id } = ctx.user;
    
      const favorites = await db
        .select({ jobId: jobFavorites.jobId })
        .from(jobFavorites)
        .innerJoin(jobs, eq(jobFavorites.jobId, jobs.id))
        .where(
          and(
            eq(jobFavorites.candidateId, id),
            eq(jobs.isPublished, true)
          )
        );
    
      return favorites.map((f) => f.jobId);
    }),
  
    isFavoriteJob: candidateProcedure.input(z.object({ jobId: z.string() })).query(async ({ ctx, input }) => {
      const candidateId = ctx.user.id;

      const fav = await db.select().from(jobFavorites).innerJoin(jobs, eq(jobFavorites.jobId, jobs.id)).where(and(
        eq(jobFavorites.jobId, input.jobId),
        eq(jobFavorites.candidateId, candidateId),
        eq(jobs.isPublished, true)
      ));
      console.log("favorite jobs", fav);
      return { isFavorite: fav.length > 0 };
    }),
  
    toggleFavoriteJob: candidateProcedure.input(z.object({ jobId: z.string() })).mutation(async ({ ctx, input }) => {
      const { id } = ctx.user;
      const { jobId } = input;
      // Check if favorite exists
      const existing = await db
        .select()
        .from(jobFavorites)
        .where(and(
          eq(jobFavorites.jobId, jobId),
          eq(jobFavorites.candidateId, id)
        ))
        .limit(1)

      if (existing.length > 0) {
        // Remove from favorites
        await db
          .delete(jobFavorites)
          .where(and(
            eq(jobFavorites.jobId, jobId),
            eq(jobFavorites.candidateId, id)
          ))
        return { isFavorite: false }
      } else {
        // Add to favorites
        await db.insert(jobFavorites).values({
          jobId,
          candidateId: id
        })
        return { isFavorite: true }
      }
    }),
  getJobApplicationsByJobId: candidateProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = ctx.user;
      const { jobId } = input;
      const job = await db.select().from(jobApplications).where(and(eq(jobApplications.candidateId, id), eq(jobApplications.jobId, jobId))).then(res => res);
      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }
      // console.log(job);
      return job;
    }),
  changeJobStatus: companyProcedure
    .input(z.object({ jobId: z.string(), status: z.enum(["ACTIVE", "INACTIVE"]) }))
    .mutation(async ({ ctx, input }) => {
      const { id } = ctx.user;
      const { jobId, status } = input;
      const job = await db.update(jobs).set({ isPublished: status === "ACTIVE" }).where(and(eq(jobs.id, jobId), eq(jobs.companyId, id)));
      return job;
    }),
    toggleJobApplication: candidateProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = ctx.user;
      const { jobId } = input;
  
      if (!ctx.user.defaultResumeId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Default resume not found",
        });
      }
  
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
      } else {
        await db.insert(jobApplications).values({
          jobId,
          candidateId: id,
          resumeId: ctx.user.defaultResumeId,
        });
  
        return { message: "Application Added Successfully!" };
      }
    }),
  applyOrRemove: candidateProcedure
    .input(z.object({
      jobId: z.string(),
      // resumeId: z.string(), // candidate selects which resume to use
    }))
    .mutation(async ({ ctx, input }) => {
      const { jobId } = input;
      const candidateId = ctx.user.id;
      const existing = await db.select().from(jobApplications).where(and(
        eq(jobApplications.jobId, jobId),
        eq(jobApplications.candidateId, candidateId)
      ));
      // console.log("existing", existing);
      if (existing.length > 0) {
        // remove the application
        console.log("getting error", existing);
        await db.delete(jobApplications).where(eq(jobApplications.id, existing[0].id));
        return { applied: false };
      } else {
        // create new application
        const data = await db.select().from(candidates).where(eq(candidates.id, candidateId)).then(res => res[0]);
        const resumeId = data.defaultResumeId;
        if (!resumeId) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Resume not found" });
        }
        await db.insert(jobApplications).values({
          jobId,
          resumeId,
          candidateId
        });
        return { applied: true };
      }
    }),
  getJobApplicationsByCandidateId: candidateProcedure
    .query(async ({ ctx }) => {
      const { id } = ctx.user;
      const job = await db.select().from(jobApplications).where(and(eq(jobApplications.candidateId, id))).then(res => res);
      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }
      console.log(job);
      return job;
    }),
  checkApplied: candidateProcedure
    .input(z.object({
      jobId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { id } = ctx.user;
      const application = await db.select().from(jobApplications).where(and(eq(jobApplications.jobId, input.jobId), eq(jobApplications.candidateId, id))).then(res => res[0]);
      console.log(application);
      return application?.applicationStatus ?? null;
    })
});




