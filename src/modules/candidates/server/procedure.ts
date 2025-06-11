import { db } from "@/db";
import { candidates, educations, jobFavorites, jobs, resumes, workExperiences } from "@/db/schema";
import { resumeSchema } from "@/lib/validation";
import { candidateProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { ResumeServerData } from "../../../../types/globals";
import { isResumeComplete } from "@/lib/utils";
import { clerkClient } from "@clerk/nextjs/server";

export type CandidateType = typeof candidates.$inferSelect;
export type ResumeType = typeof resumes.$inferSelect;
export type WorkExperienceType = typeof workExperiences.$inferSelect;
export type EducationType = typeof educations.$inferSelect;

export type CandidateWithResume = CandidateType & {
  resumeData: ResumeType & {
    workExperiences: WorkExperienceType[];
    educations: EducationType[];
  } | null;
};
export const candidatesRouter = createTRPCRouter({
  onboarding: candidateProcedure.input(resumeSchema).mutation(async ({ ctx, input }) => {
    const { id, workExperiences: works, educations: edus, ...resumeValues } = input;

    const userId = ctx.user.id;
    // console.log("userId: ", input)
    if (!userId) throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated"
    });
    // ✅ Replace db.query.resumes.findMany
    if (!id) {
      const resumeCount = await db
        .select()
        .from(resumes)
        .where(eq(resumes.userId, userId));
      console.log("resumeCount: ", resumeCount)
      // Uncomment for permissions
      // if (!canCreateResume(subscriptionLevel, resumeCount.length)) {
      //   throw new Error("Maximum resume count reached");
      // }
    }
    await db.update(candidates).set({
      defaultResumeId: id
    }).where(eq(candidates.id, ctx.user.id));
    // ✅ Replace db.query.resumes.findFirst
    const existingResume = id
      ? await db
        .select()
        .from(resumes)
        .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
        .limit(1)
        .then((res) => res[0] || null)
      : null;

    if (!id && !existingResume) throw new Error("Resume not found");


    const resumeData = {
      ...resumeValues,
      lat: Number(resumeValues.lat),
      lng: Number(resumeValues.lng),
      updatedAt: new Date(),
    };
    // console.log(id, existingResume)
    if (id) {
      // 🔁 Update Resume
      await db.update(resumes).set(resumeData).where(eq(resumes.id, id));

      // 🔁 Delete related
      await db.delete(workExperiences).where(eq(workExperiences.resumeId, id));
      await db.delete(educations).where(eq(educations.resumeId, id));

      // 🔁 Re-insert related
      if (works?.length) {
        // console.log(works)
        await db.insert(workExperiences).values(
          works.map((exp) => ({
            ...exp,
            resumeId: id,
            startDate: exp.startDate ? new Date(exp.startDate) : undefined,
            endDate: exp.endDate ? new Date(exp.endDate) : undefined,
          }))
        );
      }

      if (edus?.length) {
        await db.insert(educations).values(
          edus.map((edu) => ({
            ...edu,
            resumeId: id,
            startDate: edu.startDate ? new Date(edu.startDate) : undefined,
            endDate: edu.endDate ? new Date(edu.endDate) : undefined,
          }))
        );
      }
      const [resume] = await db.select().from(resumes).where(eq(resumes.id, id))
      const experiences = await db.select().from(workExperiences).where(eq(workExperiences.resumeId, id))
      const studies = await db.select().from(educations).where(eq(educations.resumeId, id))
      const resumeComplete = isResumeComplete({
        ...resume,
        workExperiences: experiences,
        educations: studies
      } as ResumeServerData);
      console.log("resumeComplete: ", resumeComplete)
      if (resumeComplete && ctx.clerkUserId) {
        const client = await clerkClient()
        await client.users.updateUser(ctx.clerkUserId, {
          publicMetadata: {
            onboardingComplete: true,
            role: "CANDIDATE"
          },
        })
      }
      return { updatedResume: existingResume };
    } else {
      // 🔁 Insert new resume
      const [newResume] = await db
        .insert(resumes)
        .values({
          ...resumeData,
          userId,
          createdAt: new Date(),
        })
        .returning();

      if (!newResume?.id) throw new Error("Failed to create resume");

      const resumeId = newResume.id;

      if (works?.length) {
        await db.insert(workExperiences).values(
          works.map((exp) => ({
            ...exp,
            resumeId,
            startDate: exp.startDate ? new Date(exp.startDate) : undefined,
            endDate: exp.endDate ? new Date(exp.endDate) : undefined,
          }))
        );
      }

      if (edus?.length) {
        await db.insert(educations).values(
          edus.map((edu) => ({
            ...edu,
            resumeId,
            startDate: edu.startDate ? new Date(edu.startDate) : undefined,
            endDate: edu.endDate ? new Date(edu.endDate) : undefined,
          }))
        );
      }
      const [resume] = await db.select().from(resumes).where(eq(resumes.id, resumeId))
      const experiences = await db.select().from(workExperiences).where(eq(workExperiences.resumeId, resumeId))
      const studies = await db.select().from(educations).where(eq(educations.resumeId, resumeId))
      const resumeComplete = isResumeComplete({
        ...resume,
        workExperiences: experiences,
        educations: studies
      } as ResumeServerData);
      console.log("resumeComplete: ", resumeComplete)
      if (resumeComplete && ctx.clerkUserId) {
        const client = await clerkClient()
        await client.users.updateUser(ctx.clerkUserId, {
          publicMetadata: {
            onboardingComplete: true,
            role: "CANDIDATE"
          },
        })
      }
      return { updatedResume: newResume };
    }
  }),
  getDefaultResume: candidateProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    // Always get the candidate from DB
    const candidate = await db
      .select()
      .from(candidates)
      .where(eq(candidates.id, userId))
      .then(res => res[0]);

    if (!candidate) {
      throw new Error("Candidate not found");
    }

    // Create a resume if default_resume_id is not set
    if (!candidate.defaultResumeId) {
      const [resume] = await db.insert(resumes).values({
        title: "Default Resume",
        description: "Your Default Resume",
        userId: candidate.id,
      }).returning();

      await db.update(candidates)
        .set({ defaultResumeId: resume.id })
        .where(eq(candidates.id, userId));

      candidate.defaultResumeId = resume.id; // Update local variable
    }
    console.log("candidate", candidate);
    // Now fetch the actual resume
    const resume = await db
      .select()
      .from(resumes)
      .where(and(
        eq(resumes.userId, userId),
        eq(resumes.id, candidate.defaultResumeId)
      ))
      .then(res => res[0]);

    if (!resume) {
      throw new Error("Default resume not found");
    }

    const experiences = await db
      .select()
      .from(workExperiences)
      .where(eq(workExperiences.resumeId, resume.id));

    const studies = await db
      .select()
      .from(educations)
      .where(eq(educations.resumeId, resume.id));

    const finalResume: ResumeServerData = {
      ...resume,
      workExperiences: experiences,
      educations: studies,
    };

    return finalResume;
  }),
  getAllCandidates: protectedProcedure.input(
    z.object({
      search: z.string().optional(),
      sortBy: z.enum(["name", "email", "createdAt"]).default("name"),
      sortOrder: z.enum(["asc", "desc"]).default("asc"),
    }).optional()).query(async ({ input }) => {
      const { search, sortBy = "name", sortOrder = "asc" } = input || {};

      // Safe sort field fallback
      const sortField = {
        name: resumes.firstName,
        email: resumes.email,
        createdAt: resumes.createdAt,
      }[sortBy];

      const orderClause = sortOrder === "asc" ? asc(sortField) : desc(sortField);

      const result = await db
        .select({
          candidate: candidates,
          resume: resumes,
          workExperiences: workExperiences,
          educations: educations,
        })
        .from(candidates)
        .leftJoin(resumes, eq(candidates.defaultResumeId, resumes.id))
        .leftJoin(workExperiences, eq(workExperiences.resumeId, resumes.id))
        .leftJoin(educations, eq(educations.resumeId, resumes.id))
        .where(
          search
            ? or(
              ilike(resumes.firstName, `%${search}%`),
              ilike(resumes.lastName, `%${search}%`),
              ilike(resumes.email, `%${search}%`)
            )
            : undefined
        )
        .orderBy(orderClause);

      if (!result.length) {
        // Instead of throwing error, return empty array
        return [];
      }

      // Format result to remove duplication
      const candidatesMap = new Map<string, CandidateWithResume>();
      const orderedIds: string[] = [];

      for (const row of result) {
        const candidateId = row.candidate.id;

        if (!candidatesMap.has(candidateId)) {
          candidatesMap.set(candidateId, {
            ...row.candidate,
            resumeData: row.resume
              ? {
                ...row.resume,
                workExperiences: [],
                educations: [],
              }
              : null,
          });
          orderedIds.push(candidateId); // ✅ track insertion order
        }

        const candidateData = candidatesMap.get(candidateId)!;

        if (row.workExperiences?.id) {
          candidateData.resumeData?.workExperiences.push(row.workExperiences);
        }

        if (row.educations?.id) {
          candidateData.resumeData?.educations.push(row.educations);
        }
      }

      const candidatesArray = orderedIds.map((id) => candidatesMap.get(id)!);
      console.log("candidatesArray: ", candidatesArray);
      return candidatesArray;
    }),
  getProfile: candidateProcedure.query(async ({ ctx }) => {

    const result = await db
      .select({
        candidate: candidates,
        resume: resumes,
        workExperiences: workExperiences,
        educations: educations,
      })
      .from(candidates)
      .leftJoin(resumes, eq(candidates.defaultResumeId, resumes.id))
      .leftJoin(workExperiences, eq(workExperiences.resumeId, resumes.id))
      .leftJoin(educations, eq(educations.resumeId, resumes.id))
      .where(eq(candidates.id, ctx.user.id));
    console.log("result: ", result)
    if (!result.length) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Candidate not found" });
    }
    // 🧹 Now format the data properly
    const candidateData = {
      ...result[0].candidate,
      resumeData: result[0].resume
        ? {
          ...result[0].resume,
          workExperiences: [] as typeof workExperiences.$inferSelect[],
          educations: [] as typeof educations.$inferSelect[],
        }
        : null,
    };
    for (const row of result) {
      if (row.workExperiences && row.workExperiences.id) {
        candidateData.resumeData?.workExperiences?.push(row.workExperiences);
      }
      if (row.educations && row.educations.id) {
        candidateData.resumeData?.educations?.push(row.educations);
      }
    }
    console.log("candidateData: ", candidateData)
    return candidateData;
  }),
  getCandidate: protectedProcedure.input(z.object({ candidateId: z.string() })).query(async ({ input }) => {
    const { candidateId } = input;
    console.log("candidateId: ", candidateId)
    const result = await db
      .select({
        candidate: candidates,
        resume: resumes,
        workExperiences: workExperiences,
        educations: educations,
      })
      .from(candidates)
      .leftJoin(resumes, eq(candidates.defaultResumeId, resumes.id))
      .leftJoin(workExperiences, eq(workExperiences.resumeId, resumes.id))
      .leftJoin(educations, eq(educations.resumeId, resumes.id))
      .where(eq(candidates.id, candidateId));
    console.log("result: ", result)
    if (!result.length) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Candidate not found" });
    }
    // 🧹 Now format the data properly
    const candidateData = {
      ...result[0].candidate,
      resumeData: result[0].resume
        ? {
          ...result[0].resume,
          workExperiences: [] as typeof workExperiences.$inferSelect[],
          educations: [] as typeof educations.$inferSelect[],
        }
        : null,
    };
    for (const row of result) {
      if (row.workExperiences && row.workExperiences.id) {
        candidateData.resumeData?.workExperiences?.push(row.workExperiences);
      }
      if (row.educations && row.educations.id) {
        candidateData.resumeData?.educations?.push(row.educations);
      }
    }
    console.log("candidateData: ", candidateData)
    return candidateData;
  }),
  updateProfile: protectedProcedure.mutation(() => {
    return {
      name: "Candidate"
    }
  }),
  toggleFavorite: candidateProcedure.input(z.object({
    jobId: z.string().uuid(),
  }))
    .mutation(async ({ ctx, input }) => {
      const candidateId = ctx.user.id; // 🧠 Assuming ctx.user.id is candidateId

      // ✅ Check if already favorited
      const existing = await db
        .select()
        .from(jobFavorites)
        .where(
          and(
            eq(jobFavorites.candidateId, candidateId),
            eq(jobFavorites.jobId, input.jobId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // ✅ Already favorited ➔ REMOVE
        await db
          .delete(jobFavorites)
          .where(
            and(
              eq(jobFavorites.candidateId, candidateId),
              eq(jobFavorites.jobId, input.jobId)
            )
          );

        return { success: true, action: "removed" };
      } else {
        // ✅ Not favorited yet ➔ ADD
        await db
          .insert(jobFavorites)
          .values({
            candidateId,
            jobId: input.jobId,
          });

        return { success: true, action: "added" };
      }
    }),
  getFavoriteJobs: candidateProcedure.input(z.object({
    search: z.string().optional(),
    sortBy: z.enum(["name", "email", "createdAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }).optional()).query(async ({ ctx, input }) => {
    const { search, sortBy = "createdAt", sortOrder = "desc" } = input || {};
    console.log(search, sortBy, sortOrder)
    const candidateId = ctx.user.id;
    const favoriteJobs = await db
      .select({ job: jobs }) // sirf job object
      .from(jobFavorites)
      .innerJoin(jobs, eq(jobFavorites.jobId, jobs.id))
      .where(eq(jobFavorites.candidateId, candidateId))
      .orderBy(sortOrder === "asc" ? asc(jobs.createdAt) : desc(jobs.createdAt));

    return favoriteJobs.map((item) => item.job);
  })
})