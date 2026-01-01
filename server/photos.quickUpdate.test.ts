import { describe, it, expect, beforeEach } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';

// Mock context for admin user
const mockAdminContext = {
  user: {
    openId: 'test-admin',
    name: 'Test Admin',
    role: 'admin' as const,
  },
  req: {} as any,
  res: {} as any,
};

// Mock context for non-admin user
const mockUserContext = {
  user: {
    openId: 'test-user',
    name: 'Test User',
    role: 'user' as const,
  },
  req: {} as any,
  res: {} as any,
};

describe('photos.quickUpdate API', () => {
  let testPhotoId: number;

  beforeEach(async () => {
    // Create a test photo
    const photo = await db.createPhoto({
      src: 'https://test.com/photo.jpg',
      alt: 'Test Photo',
      displayTitle: 'Original Title',
      category: 'Portrait',
      location: 'Test Location',
      date: '2024-01-01',
      description: 'Test description',
      isVisible: 1,
      sortOrder: 0,
    });
    testPhotoId = photo!.id;
  });

  describe('Authorization', () => {
    it('should allow admin to quick update', async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      
      const result = await caller.photos.quickUpdate({
        id: testPhotoId,
        field: 'displayTitle',
        value: 'New Title',
      });

      expect(result).toBeDefined();
      expect(result?.displayTitle).toBe('New Title');
    });

    it('should reject non-admin users', async () => {
      const caller = appRouter.createCaller(mockUserContext);
      
      await expect(
        caller.photos.quickUpdate({
          id: testPhotoId,
          field: 'displayTitle',
          value: 'New Title',
        })
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('Field Updates', () => {
    it('should update displayTitle field', async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      
      const result = await caller.photos.quickUpdate({
        id: testPhotoId,
        field: 'displayTitle',
        value: 'Updated Title',
      });

      expect(result?.displayTitle).toBe('Updated Title');
    });

    it('should update category field', async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      
      const result = await caller.photos.quickUpdate({
        id: testPhotoId,
        field: 'category',
        value: 'Travel',
      });

      expect(result?.category).toBe('Travel');
    });

    it('should update isVisible field', async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      
      const result = await caller.photos.quickUpdate({
        id: testPhotoId,
        field: 'isVisible',
        value: 0,
      });

      expect(result?.isVisible).toBe(0);
    });

    it('should update featured field', async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      
      const result = await caller.photos.quickUpdate({
        id: testPhotoId,
        field: 'featured',
        value: 1,
      });

      expect(result?.featured).toBe(1);
    });
  });

  describe('Input Validation', () => {
    it('should reject invalid isVisible value (not 0 or 1)', async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      
      await expect(
        caller.photos.quickUpdate({
          id: testPhotoId,
          field: 'isVisible',
          value: 2,
        })
      ).rejects.toThrow();
    });

    it('should reject invalid featured value (not 0 or 1)', async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      
      await expect(
        caller.photos.quickUpdate({
          id: testPhotoId,
          field: 'featured',
          value: 5,
        })
      ).rejects.toThrow();
    });

    it('should reject non-string value for displayTitle', async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      
      await expect(
        caller.photos.quickUpdate({
          id: testPhotoId,
          field: 'displayTitle',
          value: 123 as any,
        })
      ).rejects.toThrow();
    });

    it('should reject non-string value for category', async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      
      await expect(
        caller.photos.quickUpdate({
          id: testPhotoId,
          field: 'category',
          value: 456 as any,
        })
      ).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string for displayTitle', async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      
      const result = await caller.photos.quickUpdate({
        id: testPhotoId,
        field: 'displayTitle',
        value: '',
      });

      expect(result?.displayTitle).toBe('');
    });

    it('should handle very long displayTitle', async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      const longTitle = 'A'.repeat(255);
      
      const result = await caller.photos.quickUpdate({
        id: testPhotoId,
        field: 'displayTitle',
        value: longTitle,
      });

      expect(result?.displayTitle).toBe(longTitle);
    });

    it('should handle non-existent photo ID', async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      
      const result = await caller.photos.quickUpdate({
        id: 999999,
        field: 'displayTitle',
        value: 'New Title',
      });

      // getPhotoById returns undefined for non-existent IDs
      expect(result).toBeUndefined();
    });

    it('should handle special characters in displayTitle', async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      const specialTitle = '特殊字符 & <script>alert("test")</script>';
      
      const result = await caller.photos.quickUpdate({
        id: testPhotoId,
        field: 'displayTitle',
        value: specialTitle,
      });

      expect(result?.displayTitle).toBe(specialTitle);
    });
  });

  describe('Performance', () => {
    it('should update field quickly (< 1 second)', async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      const startTime = Date.now();
      
      await caller.photos.quickUpdate({
        id: testPhotoId,
        field: 'displayTitle',
        value: 'Performance Test',
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000);
    });
  });
});
