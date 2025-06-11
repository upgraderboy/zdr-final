import { candidateProcedure, companyProcedure } from "@/trpc/init";
import { createTRPCRouter } from "@/trpc/init";
import { db } from "@/db";
import { jobs, candidates, resumes, workExperiences, educations, favoriteCandidates } from "@/db/schema";
import { and, asc, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { jobFavorites } from "@/db/schema";
import { z } from "zod";
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
export const favoritesRouter = createTRPCRouter({
  getFavoriteCandidateIds: companyProcedure.query(async ({ ctx }) => {
    const { id } = ctx.user;

    const favorites = await db
      .select({ candidateId: favoriteCandidates.candidateId })
      .from(favoriteCandidates)
      .innerJoin(candidates, eq(favoriteCandidates.candidateId, candidates.id))
      .where(
        and(
          eq(favoriteCandidates.companyId, id),
        )
      );

    return favorites.map((f) => f.candidateId);
  }),
  toggleFavoriteCandidate: companyProcedure.input(z.object({ candidateId: z.string() })).mutation(async ({ ctx, input }) => {
    const { id } = ctx.user;
    const { candidateId } = input;
    // Check if favorite exists
    const existing = await db
      .select()
      .from(favoriteCandidates)
      .innerJoin(candidates, eq(favoriteCandidates.candidateId, candidates.id))
      .where(and(
        eq(favoriteCandidates.candidateId, candidateId),
        eq(favoriteCandidates.companyId, id)
      ))
      .limit(1)

    if (existing.length > 0) {
      // Remove from favorites
      await db
        .delete(favoriteCandidates)
        .where(and(
          eq(favoriteCandidates.candidateId, candidateId),
          eq(favoriteCandidates.companyId, id)
        ))
      return { isFavorite: false }
    } else {
      // Add to favorites
      await db.insert(favoriteCandidates).values({
        candidateId,
        companyId: id
      })
      return { isFavorite: true }
    }
  }),
  getFavoriteJobs: candidateProcedure.input(z.object({
    search: z.string().optional(),
    sortBy: z.enum(["title", "createdAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }).optional()).query(async ({ ctx, input }) => {
    const { search, sortBy = "createdAt", sortOrder = "desc" } = input || {};
    console.log(search, sortBy, sortOrder);
    const candidateId = ctx.user.id;
    const favoriteJobs = await db
      .select({ job: jobs }) // sirf job object
      .from(jobFavorites)
      .innerJoin(jobs, eq(jobFavorites.jobId, jobs.id))
      .where(eq(jobFavorites.candidateId, candidateId))
      .orderBy(sortOrder === "asc" ? asc(jobs.createdAt) : desc(jobs.createdAt));
    console.log("favoriteJobs", favoriteJobs)
    return favoriteJobs.map((item) => item.job);
  }),
  getFavoriteCandidates: companyProcedure
    .input(
      z.object({
        search: z.string().optional(),
        sortBy: z.enum(["name", "email", "createdAt"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const companyId = ctx.user.id;
      const { search, sortBy = "createdAt", sortOrder = "desc" } = input || {};

      // Step 1: Get all favorite entries where company's jobs were favorited by candidates
      const favoriteEntries = await db
        .select({
          candidateId: favoriteCandidates.candidateId,
        })
        .from(favoriteCandidates)
        .innerJoin(candidates, eq(favoriteCandidates.candidateId, candidates.id))
        .where(eq(favoriteCandidates.companyId, companyId));

      const candidateIds = favoriteEntries.map((entry) => entry.candidateId);
      if (!candidateIds.length) return [];

      // Step 2: Prepare sort logic
      const sortField = {
        name: candidates.name,
        email: candidates.email,
        createdAt: candidates.createdAt,
      }[sortBy];
      const orderClause = sortOrder === "asc" ? asc(sortField) : desc(sortField);

      // Step 3: Query candidate info + resume
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
          and(
            inArray(candidates.id, candidateIds),
            search
              ? or(
                ilike(candidates.name, `%${search}%`),
                ilike(candidates.email, `%${search}%`)
              )
              : undefined
          )
        )
        .orderBy(orderClause);

      if (!result.length) return [];

      // Step 4: Format result by candidate
      const candidateMap = new Map<string, CandidateWithResume>();

      for (const row of result) {
        const candidateId = row.candidate.id;

        if (!candidateMap.has(candidateId)) {
          candidateMap.set(candidateId, {
            ...row.candidate,
            resumeData: row.resume
              ? {
                ...row.resume,
                workExperiences: [],
                educations: [],
              }
              : null,
          });
        }

        const candidateEntry = candidateMap.get(candidateId)!;

        if (row.workExperiences?.id) {
          candidateEntry.resumeData?.workExperiences.push(row.workExperiences);
        }

        if (row.educations?.id) {
          candidateEntry.resumeData?.educations.push(row.educations);
        }
      }

      const favCandidates: CandidateWithResume[] = Array.from(candidateMap.values());
      return favCandidates;
    })
})