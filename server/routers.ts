import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  photos: router({
    // Public endpoint: get visible photos for portfolio display
    list: publicProcedure.query(async () => {
      return await db.getVisiblePhotos();
    }),

    // Admin endpoints: manage all photos
    listAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      return await db.getAllPhotos();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return await db.getPhotoById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        src: z.string(),
        alt: z.string(),
        category: z.enum(["Portrait", "Travel", "Editorial"]),
        location: z.string().optional(),
        date: z.string().optional(),
        description: z.string().optional(),
        isVisible: z.number().default(1),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return await db.createPhoto(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        src: z.string().optional(),
        alt: z.string().optional(),
        category: z.enum(["Portrait", "Travel", "Editorial"]).optional(),
        location: z.string().optional(),
        date: z.string().optional(),
        description: z.string().optional(),
        isVisible: z.number().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        const { id, ...updates } = input;
        return await db.updatePhoto(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return await db.deletePhoto(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
