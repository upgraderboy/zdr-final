import * as z from "zod";
import { companyProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { candidates, companies, companySchema, favoriteCandidates } from "@/db/schema";
import { clerkClient } from "@clerk/nextjs/server";
import stripe from "@/lib/stripe";
import { and, eq, ilike, asc, desc } from "drizzle-orm";
import cloudinary from "@/lib/cloudinary";
export const companyRouter = createTRPCRouter({
  getAllCompanies: protectedProcedure.input(
    z.object({
      search: z.string().optional(),
      sortBy: z.enum(["companyName", "createdAt"]).default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
    }).optional()
  ).query(async ({ input }) => {
    const { search, sortBy = "createdAt", sortOrder = "desc" } = input || {};
    const companiesList = await db.select().from(companies).where(
      and(
        ilike(companies.companyName, `%${search}%`)
      )
    ).orderBy(
      sortBy === "companyName"
        ? (sortOrder === "asc" ? asc(companies.companyName) : desc(companies.companyName))
        : (sortOrder === "asc" ? asc(companies.createdAt) : desc(companies.createdAt))
    );
    // console.log(profile)
    return companiesList;
  }),
  getProfile: companyProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    const [profile] = await db
      .select()
      .from(companies)
      .where(eq(companies.clerkId, user.clerkId)); // ✅ FIXED
    console.log("profile", profile);
    return profile;
  }),
  companyProfile: companyProcedure.input(z.object({ companyId: z.string() })).query(async ({ input }) => {
    const { companyId } = input;
    const [profile] = await db.select().from(companies).where(eq(companies.id, companyId));
    // console.log(profile)
    return profile;
  }),
  onBoardingProfile: companyProcedure.input(
    companySchema
  ).mutation(async ({ input, ctx }) => {
    console.log("data input => ", input)
    let logoUrl = input.logoUrl;

    if (logoUrl.startsWith('data:image/')) {
      const uploaded = await cloudinary.uploader.upload(logoUrl, {
        folder: 'company-logos',
      });
      logoUrl = uploaded.secure_url;
    }
    console.log("logoUrl", logoUrl)
    const [company] = await db.update(companies).set({
      ...input,
      logoUrl: logoUrl,
      presentation: input.presentation,
      websiteUrl: input.websiteUrl,
      phoneNumber: input.phoneNumber,
      countryName: input.countryName,
      stateName: input.stateName,
      companyName: input.companyName,
      sectorName: input.sectorName,
      lat: input.lat,
      lng: input.lng,
      updatedAt: new Date()
    }).where(eq(companies.clerkId, ctx.user.clerkId)).returning();
    console.log(company)
    const client = await clerkClient()
    await client.users.updateUser(ctx.user.clerkId, {
      publicMetadata: {
        onboardingComplete: true,
        role: "COMPANY"
      },
    })
    return company;
  }),
  updateProfile: companyProcedure.input(
    companySchema
  ).mutation(async ({ input, ctx }) => {
    console.log("data input => ", input)
    let logoUrl = input.logoUrl;

    if (logoUrl.startsWith('data:image/')) {
      const uploaded = await cloudinary.uploader.upload(logoUrl, {
        folder: 'company-logos',
      });
      logoUrl = uploaded.secure_url;
    }
    console.log("logoUrl", logoUrl)
    const [company] = await db.update(companies).set({
      ...input,
      logoUrl: logoUrl,
      presentation: input.presentation,
      websiteUrl: input.websiteUrl,
      phoneNumber: input.phoneNumber,
      countryName: input.countryName,
      stateName: input.stateName,
      companyName: input.companyName,
      sectorName: input.sectorName,
      lat: input.lat,
      lng: input.lng,
      updatedAt: new Date()
    }).where(eq(companies.clerkId, ctx.user.clerkId)).returning();
    return company;
  }),
  toggleFavorite: companyProcedure
    .input(z.object({
      candidateId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const companyId = ctx.user.id;

      // ✅ Check if already favorited
      const existing = await db
        .select()
        .from(favoriteCandidates)
        .where(
          and(
            eq(favoriteCandidates.companyId, companyId),
            eq(favoriteCandidates.candidateId, input.candidateId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // ✅ Already exists ➔ DELETE it
        await db
          .delete(favoriteCandidates)
          .where(
            and(
              eq(favoriteCandidates.companyId, companyId),
              eq(favoriteCandidates.candidateId, input.candidateId)
            )
          );

        return { success: true, action: "removed" };
      } else {
        // ✅ Not exists ➔ INSERT it
        await db
          .insert(favoriteCandidates)
          .values({
            companyId,
            candidateId: input.candidateId,
          });

        return { success: true, action: "added" };
      }
    }),
  getFavoriteCandidates: companyProcedure.input(z.object({
    search: z.string().optional(),
    sortBy: z.enum(["name", "email", "createdAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }).optional()).query(async ({ ctx, input }) => {
    const { search, sortBy = "createdAt", sortOrder = "desc" } = input || {};
    console.log(search, sortBy, sortOrder)
    const companyId = ctx.user.id;
    const favorites = await db
      .select({ candidate: candidates }) // only candidate details
      .from(favoriteCandidates)
      .innerJoin(candidates, eq(favoriteCandidates.candidateId, candidates.id))
      .where(eq(favoriteCandidates.companyId, companyId));

    return favorites.map((item) => item.candidate);
  }),
  getBillingPortalUrl: companyProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    const [company] = await db.select().from(companies).where(eq(companies.id, user.id));
    if (!company || !company.customerId) {
      return null;
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: company.customerId,
      return_url: process.env.NEXT_PUBLIC_BASE_URL,
    });
    return session.url;
  })
});