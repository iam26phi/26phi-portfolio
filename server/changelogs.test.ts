import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';

describe('Changelogs API', () => {
  let testChangelogId: number | undefined;

  describe('Changelog CRUD Operations', () => {
    it('should create a new changelog', async () => {
      const timestamp = Date.now();
      const caller = appRouter.createCaller({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin' },
      } as any);

      const result = await caller.changelogs.create({
        version: `v1.0.0-test-${timestamp}`,
        date: new Date().toISOString(),
        description: 'Test changelog entry',
        type: 'feature',
        isVisible: 1,
        sortOrder: 0,
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.id).toBeGreaterThan(0);
      testChangelogId = result.id;
    });

    it('should get all changelogs (admin)', async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin' },
      } as any);

      const changelogs = await caller.changelogs.listAll();
      expect(Array.isArray(changelogs)).toBe(true);
      expect(changelogs.length).toBeGreaterThan(0);
    });

    it('should get visible changelogs (public)', async () => {
      const caller = appRouter.createCaller({} as any);

      const changelogs = await caller.changelogs.list();
      expect(Array.isArray(changelogs)).toBe(true);
      // All returned changelogs should be visible
      changelogs.forEach(changelog => {
        expect(changelog.isVisible).toBe(1);
      });
    });

    it('should get changelog by id', async () => {
      if (!testChangelogId) {
        throw new Error('Test changelog not created');
      }

      const caller = appRouter.createCaller({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin' },
      } as any);

      const changelog = await caller.changelogs.getById({ id: testChangelogId });
      expect(changelog).toBeDefined();
      expect(changelog?.id).toBe(testChangelogId);
    });

    it('should update a changelog', async () => {
      if (!testChangelogId) {
        throw new Error('Test changelog not created');
      }

      const caller = appRouter.createCaller({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin' },
      } as any);

      const result = await caller.changelogs.update({
        id: testChangelogId,
        description: 'Updated test changelog entry',
        type: 'improvement',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);

      // Verify the update
      const updated = await caller.changelogs.getById({ id: testChangelogId });
      expect(updated?.description).toBe('Updated test changelog entry');
      expect(updated?.type).toBe('improvement');
    });

    it('should delete a changelog', async () => {
      if (!testChangelogId) {
        throw new Error('Test changelog not created');
      }

      const caller = appRouter.createCaller({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin' },
      } as any);

      const result = await caller.changelogs.delete({ id: testChangelogId });
      expect(result).toBeDefined();
      expect(result.success).toBe(true);

      // Verify deletion
      const deleted = await caller.changelogs.getById({ id: testChangelogId });
      expect(deleted).toBeNull();
    });
  });

  describe('Authorization', () => {
    beforeAll(async () => {
      // Create a test changelog for authorization tests
      const timestamp = Date.now();
      const result = await db.createChangelog({
        version: `v1.0.0-auth-test-${timestamp}`,
        date: new Date(),
        description: 'Authorization test changelog',
        type: 'feature',
        isVisible: 1,
        sortOrder: 0,
      });
      testChangelogId = result.id;
    });

    afterAll(async () => {
      // Clean up test changelog
      if (testChangelogId) {
        try {
          await db.deleteChangelog(testChangelogId);
        } catch (e) {
          console.error('Failed to delete test changelog:', e);
        }
      }
    });

    it('should deny non-admin access to listAll', async () => {
      const caller = appRouter.createCaller({
        user: { id: 2, name: 'Regular User', email: 'user@example.com', role: 'user' },
      } as any);

      await expect(caller.changelogs.listAll()).rejects.toThrow('Unauthorized');
    });

    it('should deny non-admin access to create', async () => {
      const caller = appRouter.createCaller({
        user: { id: 2, name: 'Regular User', email: 'user@example.com', role: 'user' },
      } as any);

      await expect(caller.changelogs.create({
        version: 'v1.0.0-unauthorized',
        date: new Date().toISOString(),
        description: 'Unauthorized changelog',
        type: 'feature',
        isVisible: 1,
        sortOrder: 0,
      })).rejects.toThrow('Unauthorized');
    });

    it('should deny non-admin access to update', async () => {
      if (!testChangelogId) {
        throw new Error('Test changelog not created');
      }

      const caller = appRouter.createCaller({
        user: { id: 2, name: 'Regular User', email: 'user@example.com', role: 'user' },
      } as any);

      await expect(caller.changelogs.update({
        id: testChangelogId,
        description: 'Hacked description',
      })).rejects.toThrow('Unauthorized');
    });

    it('should deny non-admin access to delete', async () => {
      if (!testChangelogId) {
        throw new Error('Test changelog not created');
      }

      const caller = appRouter.createCaller({
        user: { id: 2, name: 'Regular User', email: 'user@example.com', role: 'user' },
      } as any);

      await expect(caller.changelogs.delete({
        id: testChangelogId,
      })).rejects.toThrow('Unauthorized');
    });

    it('should allow public access to visible changelogs', async () => {
      const caller = appRouter.createCaller({} as any);

      const changelogs = await caller.changelogs.list();
      expect(Array.isArray(changelogs)).toBe(true);
      // Should not throw error for public access
    });
  });

  describe('Changelog Types', () => {
    it('should support feature type', async () => {
      const timestamp = Date.now();
      const caller = appRouter.createCaller({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin' },
      } as any);

      const result = await caller.changelogs.create({
        version: `v1.0.0-feature-${timestamp}`,
        date: new Date().toISOString(),
        description: 'Test feature changelog',
        type: 'feature',
        isVisible: 1,
        sortOrder: 0,
      });

      expect(result.success).toBe(true);
      
      // Clean up
      if (result.id && !isNaN(result.id)) {
        await caller.changelogs.delete({ id: result.id });
      }
    });
  });
});
