import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';

describe('Projects API', () => {
  let testProjectId: number | undefined;
  let testPhotoId: number | undefined;
  let testCategoryId: number | undefined;

  beforeAll(async () => {
    // Use timestamp to ensure unique test data
    const timestamp = Date.now();
    const categorySlug = `test-cat-proj-${timestamp}`;
    
    // Create a test photo category first
    const category = await db.createPhotoCategory({
      name: `Test Category Projects ${timestamp}`,
      slug: categorySlug,
      description: 'Test category for projects',
      sortOrder: 0,
      isVisible: 1,
    });
    testCategoryId = category.id;

    // Create a test photo
    const photo = await db.createPhoto({
      src: `https://example.com/test-project-${timestamp}.jpg`,
      alt: `Test Photo for Projects ${timestamp}`,
      category: categorySlug,
      location: 'Test Location',
      date: new Date().toISOString(),
      description: 'Test photo description',
      isVisible: 1,
      sortOrder: 0,
    });
    testPhotoId = photo.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testProjectId) {
      try {
        await db.deleteProject(testProjectId);
      } catch (e) {
        console.error('Failed to delete test project:', e);
      }
    }
    if (testPhotoId) {
      try {
        await db.deletePhoto(testPhotoId);
      } catch (e) {
        console.error('Failed to delete test photo:', e);
      }
    }
    if (testCategoryId) {
      try {
        await db.deletePhotoCategory(testCategoryId);
      } catch (e) {
        console.error('Failed to delete test category:', e);
      }
    }
  });

  describe('Project CRUD Operations', () => {
    beforeAll(async () => {
      // Create test project for this describe block
      const timestamp = Date.now();
      const caller = appRouter.createCaller({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin' },
      } as any);

      const project = await caller.projects.create({
        title: `Test Project ${timestamp}`,
        slug: `test-project-${timestamp}`,
        description: 'This is a test project',
        coverImage: 'https://example.com/cover.jpg',
        isVisible: 1,
        sortOrder: 0,
      });
      testProjectId = project.id;
    });

    it('should create a new project', async () => {
      expect(testProjectId).toBeDefined();
      expect(testProjectId).toBeGreaterThan(0);
    });

    it('should get all projects (admin)', async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin' },
      } as any);

      const projects = await caller.projects.listAll();
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBeGreaterThan(0);
    });

    it('should get visible projects (public)', async () => {
      const caller = appRouter.createCaller({} as any);

      const projects = await caller.projects.list();
      expect(Array.isArray(projects)).toBe(true);
      // All returned projects should be visible
      projects.forEach(project => {
        expect(project.isVisible).toBe(1);
      });
    });

    it('should get project by slug', async () => {
      if (!testProjectId) {
        throw new Error('Test project not created');
      }

      const caller = appRouter.createCaller({} as any);
      const allProjects = await caller.projects.list();
      const testProject = allProjects.find(p => p.id === testProjectId);
      
      if (!testProject) {
        throw new Error('Test project not found in list');
      }

      const project = await caller.projects.getBySlug({ slug: testProject.slug });
      expect(project).toBeDefined();
      expect(project.id).toBe(testProjectId);
    });

    it('should update a project', async () => {
      if (!testProjectId) {
        throw new Error('Test project not created');
      }

      const caller = appRouter.createCaller({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin' },
      } as any);

      const updated = await caller.projects.update({
        id: testProjectId,
        title: 'Updated Test Project',
        description: 'Updated description',
      });

      expect(updated).toBeDefined();
      expect(updated.title).toBe('Updated Test Project');
      expect(updated.description).toBe('Updated description');
    });
  });

  describe('Project-Photo Association', () => {
    it('should add photo to project', async () => {
      if (!testProjectId || !testPhotoId) {
        throw new Error('Test project or photo not created');
      }

      const caller = appRouter.createCaller({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin' },
      } as any);

      const result = await caller.projects.addPhoto({
        photoId: testPhotoId,
        projectId: testProjectId,
      });

      expect(result).toBeDefined();
    });

    it('should get photos for a project', async () => {
      if (!testProjectId) {
        throw new Error('Test project not created');
      }

      const photos = await db.getPhotosByProjectId(testProjectId);
      expect(Array.isArray(photos)).toBe(true);
      expect(photos.length).toBeGreaterThan(0);
      expect(photos[0].id).toBe(testPhotoId);
    });

    it('should set photos for a project', async () => {
      if (!testProjectId || !testPhotoId) {
        throw new Error('Test project or photo not created');
      }

      const caller = appRouter.createCaller({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin' },
      } as any);

      const result = await caller.projects.setPhotos({
        projectId: testProjectId,
        photoIds: [testPhotoId],
      });

      expect(result.success).toBe(true);

      const photos = await db.getPhotosByProjectId(testProjectId);
      expect(photos.length).toBe(1);
      expect(photos[0].id).toBe(testPhotoId);
    });

    it('should remove photo from project', async () => {
      if (!testProjectId || !testPhotoId) {
        throw new Error('Test project or photo not created');
      }

      const caller = appRouter.createCaller({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin' },
      } as any);

      const result = await caller.projects.removePhoto({
        photoId: testPhotoId,
        projectId: testProjectId,
      });

      expect(result).toBeDefined();

      const photos = await db.getPhotosByProjectId(testProjectId);
      expect(photos.length).toBe(0);
    });
  });

  describe('Authorization', () => {
    it('should deny non-admin access to listAll', async () => {
      const caller = appRouter.createCaller({
        user: { id: 2, name: 'Regular User', email: 'user@example.com', role: 'user' },
      } as any);

      await expect(caller.projects.listAll()).rejects.toThrow('Unauthorized');
    });

    it('should deny non-admin access to create', async () => {
      const caller = appRouter.createCaller({
        user: { id: 2, name: 'Regular User', email: 'user@example.com', role: 'user' },
      } as any);

      await expect(caller.projects.create({
        title: 'Unauthorized Project',
        slug: 'unauthorized',
        isVisible: 1,
        sortOrder: 0,
      })).rejects.toThrow('Unauthorized');
    });

    it('should deny non-admin access to update', async () => {
      if (!testProjectId) {
        throw new Error('Test project not created');
      }

      const caller = appRouter.createCaller({
        user: { id: 2, name: 'Regular User', email: 'user@example.com', role: 'user' },
      } as any);

      await expect(caller.projects.update({
        id: testProjectId,
        title: 'Hacked Title',
      })).rejects.toThrow('Unauthorized');
    });

    it('should deny non-admin access to delete', async () => {
      if (!testProjectId) {
        throw new Error('Test project not created');
      }

      const caller = appRouter.createCaller({
        user: { id: 2, name: 'Regular User', email: 'user@example.com', role: 'user' },
      } as any);

      await expect(caller.projects.delete({
        id: testProjectId,
      })).rejects.toThrow('Unauthorized');
    });
  });
});
