import { candidateProcedure, createTRPCRouter } from "@/trpc/init";
import { generalInfoSchema, resumeSchema } from "@/lib/validation";
import { eq, and, getTableColumns, desc, exists } from "drizzle-orm";
import { db } from "@/db";
import { resumes, educations, workExperiences, candidates, jobApplications } from "@/db/schema";

import { z } from "zod";
import { groupBy } from "lodash";
import { ResumeServerData } from "../../../../types/globals";
import { TRPCError } from "@trpc/server";
export const resumeRouter = createTRPCRouter({
  getOne: candidateProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const { id } = input;
    const userId = ctx.user.id;
    if (!userId) throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated"
    });
    // 🧠 1. Get Resume Data
    const resume = await db
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
      .then(res => res[0]); // Get first (and only) resume

    if (!resume) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Resume not found" });
    }

    // ✅ 2. Get workExperiences
    const workExperiencesList = await db
      .select()
      .from(workExperiences)
      .where(eq(workExperiences.resumeId, id));

    // ✅ 3. Get educations
    const educationList = await db
      .select()
      .from(educations)
      .where(eq(educations.resumeId, id));
    // console.log("resume: ", resume)
    // 🧩 4. Construct the final resume object
    const finalResume: ResumeServerData = {
      ...resume,
      workExperiences: workExperiencesList,
      educations: educationList,
    };
    console.log(finalResume)
    return finalResume;
  }),
  create: candidateProcedure.input(generalInfoSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;
    if (!userId) throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated"
    });

    const [newResume] = await db
      .insert(resumes)
      .values({
        ...input,
        userId,
        createdAt: new Date(),
      })
      .returning();
    return newResume;
  }),
  save: candidateProcedure.input(resumeSchema).mutation(async ({ ctx, input }) => {
    const { id, workExperiences: works, educations: edus, ...resumeValues } = input;
    console.log("photo: ", input.photoUrl);
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
    // ✅ Replace db.query.resumes.findFirst
    const existingResume = id
      ? await db
        .select()
        .from(resumes)
        .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
        .limit(1)
        .then((res) => res[0] || null)
      : null;

    if (id && !existingResume) throw new Error("Resume not found");

    // const hasCustomizations =
    //   (resumeValues.borderStyle && resumeValues.borderStyle !== existingResume?.borderStyle) ||
    //   (resumeValues.colorHex && resumeValues.colorHex !== existingResume?.colorHex);

    // Uncomment for customization control
    // if (hasCustomizations && !canUseCustomizations(subscriptionLevel)) {
    //   throw new Error("Customization not allowed");
    // }

    const resumeData = {
      ...resumeValues,
      hardSkills: resumeValues.hardSkills
        ?.map((s) => s.trim())
        .filter((s) => s.length > 0),
      softSkills: resumeValues.softSkills
        ?.map((s) => s.trim())
        .filter((s) => s.length > 0),
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

      return { updatedResume: newResume };
    }
  }),



  getList: candidateProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

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
      .where(eq(resumes.userId, userId))
      .orderBy(desc(resumes.createdAt));
    console.log("-------------------Error------------------")
    // console.log("userResumes: ", userResumes)
    // Group the results to create the ResumeServerData structure
    const groupedResumes = groupBy(userResumes, 'id');

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

  delete: candidateProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const { id } = input;
    const userId = ctx.user.id;

    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated"
      });
    }

    // Step 1: Count candidate's resumes
    const resumeCount = await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, userId));
    const [usedResume] = await db.select().from(jobApplications).where(eq(jobApplications.resumeId, id));
    if (usedResume) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You cannot delete the resume that is being used in a job application.",
      });
    }
    console.log("usedResume: ", usedResume)
    // Step 2: If more than one resume, proceed to delete
    const isDefaultResume = await db
      .select()
      .from(candidates)
      .where(and(eq(candidates.id, userId), eq(candidates.defaultResumeId, id)));
    console.log("isDefaultResume: ", isDefaultResume)
    if (isDefaultResume.length > 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You cannot delete the default resume. First Set other resume as Default!",
      });
    }
    if (resumeCount.length <= 1) {
      // Step 2: If only one resume left, throw error
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You must have at least one resume.",
      });
    }

    await db.delete(workExperiences).where(eq(workExperiences.resumeId, id));
    await db.delete(educations).where(eq(educations.resumeId, id));
    await db.delete(resumes).where(and(eq(resumes.id, id), eq(resumes.userId, userId)));

    return { id };
  }),
  setDefault: candidateProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const { id } = input;
    console.log("id: ", id)
    const userId = ctx.user.id;
    if (!userId) throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated"
    });
    console.log("Id: ", id)
    // ✅ Corrected version using candidates table only






    // Step 1: Fetch resume
    const resume = await db.select().from(resumes).where(and(eq(resumes.id, id), eq(resumes.userId, userId))).then(res => res[0]);

    if (!resume) throw new TRPCError({ code: "NOT_FOUND", message: "Resume not found" });

    // Step 2: Validate required fields
    const requiredFields: (keyof typeof resume)[] = [
      "firstName", "lastName", "jobTitle", "city", "country", "phone", "email",
      "lat", "lng", "summary", "age", "skillType", "gender", "disability", "experienceLevel", "contractType", "softSkills", "hardSkills"
    ];

    const missingField = requiredFields.find((field) => {
      const value = resume[field];
      if (Array.isArray(value)) return value.length === 0;
      return value === null || value === undefined || value === "";
    });

    if (missingField) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Please add '${missingField}' to set this resume as default.`,
      });
    }
    const result = await db
      .update(candidates)
      .set({ defaultResumeId: id })
      .where(
        and(
          eq(candidates.id, userId),
          // Optionally validate that resumeId actually exists for the user
          exists(
            db
              .select({ id: resumes.id })
              .from(resumes)
              .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
          )
        )
      );
    console.log("result: ", result)
    return { id };
  }),
  publicResume: candidateProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const { id } = input;
    // 🧠 1. Get Resume Data
    const resume = await db
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, id), eq(resumes.isDefault, true)))
      .then(res => res[0]); // Get first (and only) resume

    if (!resume) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Resume not found" });
    }

    // ✅ 2. Get workExperiences
    const workExperiencesList = await db
      .select()
      .from(workExperiences)
      .where(eq(workExperiences.resumeId, id));

    // ✅ 3. Get educations
    const educationList = await db
      .select()
      .from(educations)
      .where(eq(educations.resumeId, id));

    // 🧩 4. Construct the final resume object
    const finalResume: ResumeServerData = {
      ...resume,
      workExperiences: workExperiencesList,
      educations: educationList,
    };
    // console.log(finalResume)
    return finalResume;
  }),
});
