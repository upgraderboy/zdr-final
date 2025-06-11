import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { cache } from 'react';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { candidates, companies } from '@/db/schema';
import { eq } from 'drizzle-orm';




export const createTRPCContext = cache(async () => {
  const user = await auth();
  const role = user.sessionClaims?.metadata.role;
  return { clerkUserId: user.userId, role };
});

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;


export const protectedProcedure = t.procedure.use(async (opts)=>{
    const { ctx } = opts;
    if(!ctx.clerkUserId) {
        throw new TRPCError({
            code: "UNAUTHORIZED"
        })
    }

    return opts.next({
        ctx: {
            ...ctx
        }
    });

});
export const candidateProcedure = t.procedure.use(async (opts)=>{
    const { ctx } = opts;
    console.log(ctx)
    if(!ctx.clerkUserId) {
        throw new TRPCError({   
            code: "UNAUTHORIZED"
        })
    }
    const [user] = await db.select().from(candidates).where(eq(candidates.clerkId, ctx.clerkUserId));
    console.log(user)
    if(!user || ctx.role !== "CANDIDATE") {
        throw new TRPCError({
            code: "UNAUTHORIZED"
        })
    }

    return opts.next({
        ctx: {
            ...ctx,
            user
        }
    });

});
export const companyProcedure = t.procedure.use(async (opts)=>{
    const { ctx } = opts;
    console.log(ctx)
    if(!ctx.clerkUserId) {
        throw new TRPCError({
            code: "UNAUTHORIZED"
        })
    }
    const [user] = await db.select().from(companies).where(eq(companies.clerkId, ctx.clerkUserId));
    console.log(user)
    if(!user || ctx.role !== "COMPANY") {
        throw new TRPCError({
            code: "UNAUTHORIZED"
        })
    }

    return opts.next({
        ctx: {
            ...ctx,
            user
        }
    });

});
export const publicProcedure = t.procedure.use(async (opts)=>{


    return opts.next();

});