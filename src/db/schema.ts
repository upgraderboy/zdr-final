import { relations } from "drizzle-orm";
import { pgTable, text, uuid, timestamp, pgEnum, primaryKey, varchar, boolean, integer, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const subscriptionPeriodEnum = pgEnum("subscription_period", ["FREE", "MONTHLY", "YEARLY"]);
export const disabilityEnum = pgEnum("disability", ["Yes", "No"]);
export const genderEnum = pgEnum("gender", ["Male", "Female", "Other"]);
export const experienceLevelEnum = pgEnum("experience_level", ["Entry Level", "Mid Level", "Senior Level"]);
export const skillTypeEnum = pgEnum("skill_type", ["TECH", "NON-TECH"])
export const contractTypeEnum = pgEnum("contract_type", ["Internship", "Apprenticeship", "Volunteer", "Freelance", "Employee permanent contract", "Employee short-term contract", "External Consultant"]);
export const positionGenderEnum = pgEnum("gender_preference", ["Male", "Female", "All"]);
export const ageCategoryEnum = pgEnum("age_category", ["up to 20", "21-30", "31-40", "41-50", "51-60", "60 and up"]);
export const applicationStatusEnum = pgEnum("application_status", ["PENDING", "SHORTLISTED", "HIRED", "REJECTED"]);
export const domainTypeEnum = pgEnum("domain_type", ["TECH", "NON-TECH"]);
export const jobTypeEnum = pgEnum("job_type", ["Remote", "On Site", "Hybrid"]);
export const candidates = pgTable("candidates", {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: varchar("clerk_id", { length: 255 }).unique().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    imageUrl: varchar("image_url", { length: 255 }),
    isVerified: boolean("is_verified").default(false),
    email: varchar("email", { length: 255 }).unique().notNull(),
    defaultResumeId: uuid("default_resume_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});




export const resumes = pgTable("resumes", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => candidates.id, {
        onDelete: "cascade",
    }),
    title: text("title"),
    description: text("description"),
    photoUrl: text("photo_url"),

    colorHex: varchar("color_hex", { length: 7 }).default("#000000"),
    borderStyle: text("border_style").default("squircle"),
    summary: text("summary"),
    firstName: text("first_name"),
    lastName: text("last_name"),
    jobTitle: text("job_title"),
    city: text("city"),
    country: text("country"),
    phone: text("phone"),
    email: text("email"),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    category: text("category").default("TECH"),
    softSkills: text("soft_skills").array(),
    hardSkills: text("hard_skills").array(),
    isDefault: boolean("is_default").default(false), // optional toggle
    disability: disabilityEnum("disability").default("No"),
    gender: genderEnum("gender").default("Male"),
    experienceLevel: experienceLevelEnum("experience_level").default("Entry Level"),
    contractType: contractTypeEnum("contract_type").default("Internship"),
    age: integer("age"),
    skillType: skillTypeEnum("skill_type").default("TECH"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
});

// WorkExperience table
export const workExperiences = pgTable("work_experiences", {
    id: uuid("id").primaryKey().defaultRandom(),
    position: text("position"),
    company: text("company"),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    description: text("description"),
    resumeId: uuid("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
});

// Education table
export const educations = pgTable("educations", {
    id: uuid("id").primaryKey().defaultRandom(),
    degree: text("degree"),
    school: text("school"),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    resumeId: uuid("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
});

export const companies = pgTable("companies", {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: varchar("clerk_id", { length: 255 }).unique().notNull(),
    name: varchar("name", { length: 255 }),
    logoUrl: text("logo_url"),
    isVerified: boolean("is_verified").default(false),
    email: varchar("email", { length: 255 }).unique().notNull(),
    firstName: varchar("first_name", { length: 255 }),
    lastName: varchar("last_name", { length: 255 }),
    companyName: varchar("company_name", { length: 255 }).notNull(),
    sectorName: varchar("sector_name", { length: 255 }),
    phoneNumber: varchar("phone_number", { length: 255 }),
    websiteUrl: varchar("website_url", { length: 255 }),
    gender: varchar("gender", { length: 255 }),
    presentation: text("presentation"),
    countryName: varchar("country_name", { length: 255 }),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    stateName: varchar("state_name", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    customerId: varchar("customer_id", { length: 256 }),
    plan: subscriptionPeriodEnum("plan").default("FREE"),
    });

// export const candidateRelations = relations(candidates, ({ one, many }) => ({
//     resumes: one(resumes, {
//         fields: [candidates.id],
//         references: [resumes.userId],
//     }),
//     workExperiences: many(workExperiences),
//     educations: many(educations),
// }));








export const jobs = pgTable("jobs", {
    id: uuid("id").defaultRandom().primaryKey(),

    title: varchar("title", { length: 256 }).notNull(),
    description: text("description").notNull(),
    // location: varchar("location", { length: 128 }).notNull(),
    contractType: contractTypeEnum("contract_type").default("Internship").notNull(), // e.g., Full-Time, Part-Time, Internship
    experienceLevel: experienceLevelEnum("experience_level").default("Entry Level").notNull(), // e.g., Junior, Mid, Senior
    softSkills: text("soft_skills").array(),
    hardSkills: text("hard_skills").array(),
    salaryRange: varchar("salary_range", { length: 128 }), // Optional e.g., "₹5 LPA - ₹10 LPA"
    // skillsRequired: json("skills_required").$type<string[]>().default(sql`'[]'::json`).notNull(), // comma separated or JSON string
    genderPreference: positionGenderEnum("gender_preference").default("All").notNull(),
    // applicationDeadline: date("application_deadline"),
    // isRemote: boolean("is_remote").default(false).notNull(),
    jobType: jobTypeEnum("job_type").default("On Site").notNull(),
    stateName: varchar("state_name", { length: 128 }),
    countryName: varchar("country_name", { length: 128 }),
    companyName: varchar("company_name", { length: 128 }),
    domainType: domainTypeEnum("domain_type").default("TECH").notNull(),
    ageCategory: ageCategoryEnum("age_category").default("up to 20").array().notNull(),
    isDisabilityAllowed: boolean("is_disability_allowed").default(false).notNull(),
    isPublished: boolean("is_published").default(true).notNull(),
    companyId: uuid("company_id")
        .references(() => companies.id, { onDelete: "cascade" })
        .notNull(),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// export const jobRelations = relations(jobs, ({ one, many }) => ({
//     company: one(companies, {
//         fields: [jobs.companyId],
//         references: [companies.id],
//     }),
//     applications: many(jobApplications),
//     favorites: many(jobFavorites),
// }));

export const jobFavorites = pgTable("job_favorites", {
    id: uuid("id").defaultRandom().primaryKey(),

    candidateId: uuid("candidate_id")
        .references(() => candidates.id, { onDelete: "cascade" })
        .notNull(),

    jobId: uuid("job_id")
        .references(() => jobs.id, { onDelete: "cascade" })
        .notNull(),

    savedAt: timestamp("saved_at", { withTimezone: true }).defaultNow().notNull(),
});
export const favoriteCandidates = pgTable(
    "favorite_candidates",
    {
        candidateId: uuid("candidate_id")
            .references(() => candidates.id, { onDelete: "cascade" })
            .notNull(),
        companyId: uuid("company_id")
            .references(() => companies.id, { onDelete: "cascade" })
            .notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.companyId, table.candidateId] }),
    ]
);
// export const candidateRelations = relations(candidates, ({ many, one }) => ({
//     resumes: many(resumes),
//     defaultResume: one(resumes, {
//         fields: [candidates.defaultResumeId],
//         references: [resumes.id],
//     }),
//     jobFavorites: many(jobFavorites),
// }));

export const jobApplications = pgTable("job_applications", {
    id: uuid("id").defaultRandom().primaryKey(),

    jobId: uuid("job_id")
        .references(() => jobs.id, { onDelete: "cascade" })
        .notNull(),

    candidateId: uuid("candidate_id")
        .references(() => candidates.id, { onDelete: "cascade" })
        .notNull(),

    resumeId: uuid("resume_id")
        .references(() => resumes.id, { onDelete: "cascade" })
        .notNull(),

    applicationStatus: applicationStatusEnum("application_status").default("PENDING").notNull(), // applied, shortlisted, hired, rejected
    appliedAt: timestamp("applied_at", { withTimezone: true }).defaultNow().notNull(),
});
export const companySubscription = pgTable("company_subscription", {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
    period: subscriptionPeriodEnum("period").default("FREE"),
    startDate: timestamp("start_date", { withTimezone: true }).defaultNow().notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    subscriptionStatus: varchar("subscription_status", { length: 64 }).default("ACTIVE"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
})



export const companySchema = createUpdateSchema(companies, {
    logoUrl: z.string().url().or(
        z.string().refine((val) => val.startsWith('data:image/'), {
          message: 'Invalid base64 image string',
        })
      ),
    websiteUrl: z.string().min(1),
    companyName: z.string().min(1),
    sectorName: z.string(),
    countryName: z.string(),
    stateName: z.string().optional(),
    phoneNumber: z.string(),
    email: z.string(),
    gender: z.string(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    presentation: z.string(),
    lat: z.number(),
    lng: z.number(),
})
export const jobInsertSchema = createInsertSchema(jobs, {
    companyId: z.string().optional(),
    title: z.string().min(1),
    description: z.string().min(1),
    domainType: z.enum(["TECH", "NON-TECH"]),
    contractType: z.enum(["Internship", "Apprenticeship", "Volunteer", "Freelance", "Employee permanent contract", "Employee short-term contract", "External Consultant"]),
    experienceLevel: z.enum(["Entry Level", "Mid Level", "Senior Level"]),
    ageCategory: z.array(z.enum(["up to 20", "21-30", "31-40", "41-50", "51-60", "60 and up"]))
        .min(1, "At least one age category is required"),
    isDisabilityAllowed: z.boolean().optional(),
    genderPreference: z.enum(["Male", "Female", "All"]).optional(),
    softSkills: z.array(z.string()).optional(),
    hardSkills: z.array(z.string()).optional(),
    salaryRange: z.string().optional(),
    // isRemote: z.boolean().optional(),
    // disabilityChoice: z.string().optional(),
})
export const jobSelectSchema = createSelectSchema(jobs)
export const jobUpdateSchema = jobInsertSchema.extend({
    id: z.string()
})




// Stripe table for company monthly and yearly subscription
export const candidateRelations = relations(candidates, ({ one, many }) => ({
    resumes: many(resumes),
    defaultResume: one(resumes, {
        fields: [candidates.defaultResumeId],
        references: [resumes.id],
    }),
}));
export const workExperienceRelations = relations(workExperiences, ({ one }) => ({
    resume: one(resumes, {
        fields: [workExperiences.resumeId],
        references: [resumes.id],
    }),
}));

export const educationRelations = relations(educations, ({ one }) => ({
    resume: one(resumes, {
        fields: [educations.resumeId],
        references: [resumes.id],
    }),
}));

export const resumeRelations = relations(resumes, ({ one, many }) => ({
    candidate: one(candidates, {
        fields: [resumes.userId],
        references: [candidates.id],
    }),
    workExperiences: many(workExperiences),
    educations: many(educations),
}));
export const favoriteCandidateRelations = relations(favoriteCandidates, ({ one }) => ({
    company: one(companies, {
        fields: [favoriteCandidates.companyId],
        references: [companies.id],
    }),
    candidate: one(candidates, {
        fields: [favoriteCandidates.candidateId],
        references: [candidates.id],
    }),
}));
export const jobFavoriteRelations = relations(jobFavorites, ({ one }) => ({
    job: one(jobs, {
        fields: [jobFavorites.jobId],
        references: [jobs.id],
    }),
    candidate: one(candidates, {
        fields: [jobFavorites.candidateId],
        references: [candidates.id],
    }),
}));
export const jobApplicationRelations = relations(jobApplications, ({ one }) => ({
    job: one(jobs, {
        fields: [jobApplications.jobId],
        references: [jobs.id],
    }),
    candidate: one(candidates, {
        fields: [jobApplications.candidateId],
        references: [candidates.id],
    }),
}));
export const companySubscriptionRelations = relations(companySubscription, ({ one }) => ({
    company: one(companies, {
        fields: [companySubscription.companyId],
        references: [companies.id],
    }),
}))
