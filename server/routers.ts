import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage.js";

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

    updateOrder: protectedProcedure
      .input(z.array(z.object({ id: z.number(), sortOrder: z.number() })))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        // Update sort order for multiple photos
        for (const item of input) {
          await db.updatePhoto(item.id, { sortOrder: item.sortOrder });
        }
        return { success: true };
      }),

    upload: protectedProcedure
      .input(z.object({
        file: z.string(), // base64 encoded image
        filename: z.string(),
        category: z.enum(["Portrait", "Travel", "Editorial"]),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        
        // Decode base64 and upload to S3
        const base64Data = input.file.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generate unique filename
        const timestamp = Date.now();
        const ext = input.filename.split('.').pop();
        const key = `portfolio/${input.category.toLowerCase()}/${timestamp}-${input.filename}`;
        
        // Upload to S3
        const result = await storagePut(key, buffer, `image/${ext}`);
        
        return {
          success: true,
          url: result.url,
          key: result.key,
        };
      }),
  }),

  blog: router({
    // Public endpoints: get published blog posts
    list: publicProcedure
      .input(z.object({
        status: z.enum(["draft", "published"]).optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getBlogPosts(input?.status || "published", input?.limit);
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const post = await db.getBlogPostBySlug(input.slug);
        if (post && post.status === "published") {
          // Increment view count
          await db.incrementBlogPostViews(post.id);
        }
        return post;
      }),

    // Admin endpoints: manage all blog posts
    listAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      return await db.getAllBlogPosts();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return await db.getBlogPostById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        slug: z.string(),
        content: z.string(),
        excerpt: z.string().optional(),
        coverImage: z.string().optional(),
        category: z.string().optional(),
        tags: z.string().optional(),
        status: z.enum(["draft", "published"]).default("draft"),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return await db.createBlogPost({
          ...input,
          authorId: ctx.user.id,
          publishedAt: input.status === "published" ? new Date() : null,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        slug: z.string().optional(),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        coverImage: z.string().optional(),
        category: z.string().optional(),
        tags: z.string().optional(),
        status: z.enum(["draft", "published"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        const { id, ...updates } = input;
        
        // Set publishedAt when changing from draft to published
        const currentPost = await db.getBlogPostById(id);
        if (currentPost?.status === "draft" && updates.status === "published") {
          (updates as any).publishedAt = new Date();
        }
        
        return await db.updateBlogPost(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return await db.deleteBlogPost(input.id);
      }),

    uploadCover: protectedProcedure
      .input(z.object({
        file: z.string(), // base64 encoded image
        filename: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        
        // Decode base64 and upload to S3
        const base64Data = input.file.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generate unique filename
        const timestamp = Date.now();
        const ext = input.filename.split('.').pop();
        const key = `blog/covers/${timestamp}-${input.filename}`;
        
        // Upload to S3
        const result = await storagePut(key, buffer, `image/${ext}`);
        
        return {
          success: true,
          url: result.url,
          key: result.key,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
