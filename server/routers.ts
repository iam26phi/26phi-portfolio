import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage.js";
import { applyWatermarkFromSettings } from "./watermark.js";

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
        category: z.string(),
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
        category: z.string().optional(),
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
        category: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        
        // Decode base64
        const base64Data = input.file.split(',')[1];
        let buffer = Buffer.from(base64Data, 'base64');
        
        // Apply watermark if configured
        try {
          buffer = await applyWatermarkFromSettings(buffer) as any;
        } catch (error) {
          console.error('Watermark application failed:', error);
          // Continue with original image if watermark fails
        }
        
        // Generate unique filename
        const timestamp = Date.now();
        const ext = input.filename.split('.').pop();
        const key = `portfolio/${input.category.toLowerCase()}/${timestamp}-${input.filename}`;
        
        // Upload to S3 with cache headers (1 year cache for immutable images)
        const result = await storagePut(key, buffer, `image/${ext}`, "public, max-age=31536000, immutable");
        
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
        
        // Upload to S3 with cache headers (1 year cache for immutable images)
        const result = await storagePut(key, buffer, `image/${ext}`, "public, max-age=31536000, immutable");
        
        return {
          success: true,
          url: result.url,
          key: result.key,
        };
      }),
  }),

  settings: router({
    // Get a specific setting
    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return await db.getSiteSetting(input.key);
      }),

    // Update a setting (admin only)
    update: protectedProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return await db.upsertSiteSetting(input.key, input.value);
      }),

    // Upload hero background image
    uploadHeroImage: protectedProcedure
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
        const key = `hero/${timestamp}-${input.filename}`;
        
        // Upload to S3 with cache headers
        const result = await storagePut(key, buffer, `image/${ext}`, "public, max-age=31536000, immutable");
        
        // Save to settings
        await db.upsertSiteSetting('hero_background_image', result.url);
        
        return {
          success: true,
          url: result.url,
          key: result.key,
        };
      }),

    // Upload watermark image
    uploadWatermark: protectedProcedure
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
        const key = `watermark/${timestamp}-${input.filename}`;
        
        // Upload to S3 with cache headers
        const result = await storagePut(key, buffer, `image/${ext}`, "public, max-age=31536000, immutable");
        
        // Save to settings
        await db.upsertSiteSetting('watermark_image', result.url);
        
        return {
          success: true,
          url: result.url,
          key: result.key,
        };
      }),

    // Get watermark settings
    getWatermarkSettings: publicProcedure
      .query(async () => {
        const watermarkImage = await db.getSiteSetting('watermark_image');
        const watermarkPosition = await db.getSiteSetting('watermark_position');
        const watermarkOpacity = await db.getSiteSetting('watermark_opacity');
        const watermarkScale = await db.getSiteSetting('watermark_scale');
        
        return {
          watermarkImage: watermarkImage?.settingValue || null,
          position: watermarkPosition?.settingValue || 'bottom-right',
          opacity: watermarkOpacity?.settingValue ? parseFloat(watermarkOpacity.settingValue) : 0.7,
          scale: watermarkScale?.settingValue ? parseFloat(watermarkScale.settingValue) : 0.15,
        };
      }),

    // Update watermark settings
    updateWatermarkSettings: protectedProcedure
      .input(z.object({
        position: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']),
        opacity: z.number().min(0).max(1),
        scale: z.number().min(0.05).max(0.5),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        
        await db.upsertSiteSetting('watermark_position', input.position);
        await db.upsertSiteSetting('watermark_opacity', input.opacity.toString());
        await db.upsertSiteSetting('watermark_scale', input.scale.toString());
        
        return {
          success: true,
        };
      }),
  }),

  about: router({
    // Public endpoint: get about content
    get: publicProcedure.query(async () => {
      const setting = await db.getSiteSetting('about_content');
      return setting?.settingValue ? JSON.parse(setting.settingValue) : null;
    }),

    // Admin endpoint: update about content
    update: protectedProcedure
      .input(z.object({
        intro: z.string(),
        timeline: z.array(z.object({
          year: z.string(),
          title: z.string(),
          description: z.string(),
        })),
        stats: z.array(z.object({
          icon: z.string(),
          value: z.string(),
          label: z.string(),
        })),
        equipment: z.array(z.object({
          category: z.string(),
          items: z.array(z.string()),
        })),
        faqs: z.array(z.object({
          question: z.string(),
          answer: z.string(),
        })),
        contact: z.object({
          email: z.string(),
          location: z.string(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        
        await db.upsertSiteSetting('about_content', JSON.stringify(input));
        
        return {
          success: true,
        };
      }),
  }),

  photoCategories: router({
    // Public endpoint: get all categories for filtering
    list: publicProcedure.query(async () => {
      return await db.listPhotoCategories();
    }),

    // Admin endpoints: manage categories
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return await db.createPhotoCategory(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        slug: z.string().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        const { id, ...updates } = input;
        return await db.updatePhotoCategory(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return await db.deletePhotoCategory(input.id);
      }),
  }),

  projects: router({
    // Public endpoints: get visible projects
    list: publicProcedure.query(async () => {
      return await db.getVisibleProjects();
    }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const project = await db.getProjectBySlug(input.slug);
        if (!project) {
          throw new Error('Project not found');
        }
        // Also get photos for this project
        const photos = await db.getPhotosByProjectId(project.id);
        return { ...project, photos };
      }),

    // Admin endpoints: manage all projects
    listAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      return await db.getAllProjects();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        const project = await db.getProjectById(input.id);
        if (!project) {
          throw new Error('Project not found');
        }
        // Also get photos for this project
        const photos = await db.getPhotosByProjectId(project.id);
        return { ...project, photos };
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        coverImage: z.string().optional(),
        isVisible: z.number().default(1),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return await db.createProject(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        coverImage: z.string().optional(),
        isVisible: z.number().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        const { id, ...updates } = input;
        return await db.updateProject(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return await db.deleteProject(input.id);
      }),

    // Photo-Project association endpoints
    addPhoto: protectedProcedure
      .input(z.object({
        photoId: z.number(),
        projectId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return await db.addPhotoToProject(input.photoId, input.projectId);
      }),

    removePhoto: protectedProcedure
      .input(z.object({
        photoId: z.number(),
        projectId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return await db.removePhotoFromProject(input.photoId, input.projectId);
      }),

    setPhotos: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        photoIds: z.array(z.number()),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        // Set photos for this project
        const { projectId, photoIds } = input;
        
        // Get current associations
        const currentPhotos = await db.getPhotosByProjectId(projectId);
        const currentPhotoIds = currentPhotos.map(p => p.id);
        
        // Remove photos that are no longer in the list
        for (const photoId of currentPhotoIds) {
          if (!photoIds.includes(photoId)) {
            await db.removePhotoFromProject(photoId, projectId);
          }
        }
        
        // Add new photos
        for (const photoId of photoIds) {
          if (!currentPhotoIds.includes(photoId)) {
            await db.addPhotoToProject(photoId, projectId);
          }
        }
        
        return { success: true };
      }),

    uploadCoverImage: protectedProcedure
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
        const key = `projects/${timestamp}-${input.filename}`;
        
        // Upload to S3 with cache headers
        const result = await storagePut(key, buffer, `image/${ext}`, "public, max-age=31536000, immutable");
        
        return {
          success: true,
          url: result.url,
          key: result.key,
        };
      }),
  }),

  changelogs: router({
    // Public endpoints: get visible changelogs
    list: publicProcedure.query(async () => {
      return await db.getVisibleChangelogs();
    }),

    // Admin endpoints: manage all changelogs
    listAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      return await db.getAllChangelogs();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return await db.getChangelogById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        version: z.string(),
        date: z.string(), // ISO date string
        description: z.string(),
        type: z.enum(['feature', 'improvement', 'bugfix', 'design']).default('feature'),
        isVisible: z.number().default(1),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        const result = await db.createChangelog({
          ...input,
          date: new Date(input.date),
        });
        return result;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        version: z.string().optional(),
        date: z.string().optional(), // ISO date string
        description: z.string().optional(),
        type: z.enum(['feature', 'improvement', 'bugfix', 'design']).optional(),
        isVisible: z.number().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        const { id, date, ...rest } = input;
        const updates: any = { ...rest };
        if (date) {
          updates.date = new Date(date);
        }
        return await db.updateChangelog(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return await db.deleteChangelog(input.id);
      }),
  }),

  // Contact submissions router
  contact: router({
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email address"),
        shootingType: z.string().min(1, "Shooting type is required"),
        budget: z.string().min(1, "Budget is required"),
        message: z.string().min(10, "Message must be at least 10 characters"),
      }))
      .mutation(async ({ input }) => {
        const submission = await db.createContactSubmission(input);
        
        // Send notification to owner
        try {
          const { notifyOwner } = await import('./_core/notification');
          
          const shootingTypeLabels: Record<string, string> = {
            portrait: '人像攝影',
            wedding: '婚禮紀錄',
            commercial: '商業攝影',
            event: '活動紀錄',
            product: '商品攝影',
            other: '其他',
          };
          
          const shootingTypeLabel = shootingTypeLabels[input.shootingType] || input.shootingType;
          
          await notifyOwner({
            title: `新的聯絡表單提交：${input.name}`,
            content: `收到來自 ${input.name} 的聯絡請求\n\n` +
              `📧 Email: ${input.email}\n` +
              `📷 拍攝類型: ${shootingTypeLabel}\n` +
              `💰 預算範圍: ${input.budget}\n\n` +
              `訊息內容:\n${input.message}\n\n` +
              `請前往後台管理頁面查看詳細資訊並回覆。`,
          });
        } catch (error) {
          console.error('Failed to send notification:', error);
          // Don't fail the submission if notification fails
        }
        
        return submission;
      }),
    
    listAll: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return await db.getAllContactSubmissions();
      }),
    
    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input: id, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return await db.getContactSubmissionById(id);
      }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['new', 'read', 'replied', 'archived']),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return await db.updateContactSubmissionStatus(input.id, input.status);
      }),
    
    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input: id, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return await db.deleteContactSubmission(id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
