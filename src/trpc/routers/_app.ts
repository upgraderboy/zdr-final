import { candidatesRouter } from '@/modules/candidates/server/procedure';
import { createTRPCRouter } from '../init';
import { resumeRouter } from '@/modules/resumes/server/procedure';
import { companyRouter } from '@/modules/companies/server/procedure';
import { jobRouter } from '@/modules/jobs/server/procedure';
import { analysisRouter } from '@/modules/analysis/server/procedure';
import '@/app/globals.css';
import { favoritesRouter } from '@/modules/favorites/server/procedure';
import { applicationRouter } from '@/modules/applications/server/procedure';
export const appRouter = createTRPCRouter({
    candidates: candidatesRouter,
    companies: companyRouter,
    resume: resumeRouter,
    job: jobRouter,
    applications: applicationRouter,
    analysis: analysisRouter,
    favorites: favoritesRouter,
});

export type AppRouter = typeof appRouter;