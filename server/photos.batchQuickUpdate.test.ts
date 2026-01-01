import { describe, it, expect, beforeAll, afterAll } from 'vitest';
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

describe('photos.batchQuickUpdate API', () => {
  const adminCaller = appRouter.createCaller(mockAdminContext);
  const nonAdminCaller = appRouter.createCaller(mockUserContext);
  let testPhotoIds: number[] = [];

  beforeAll(async () => {

    // Create test photos
    for (let i = 0; i < 5; i++) {
      const photo = await db.createPhoto({
        src: `https://example.com/batch-test-${i}.jpg`,
        alt: `Batch Test Photo ${i}`,
        displayTitle: `Test Photo ${i}`,
        category: 'test',
        isVisible: 1,
        featured: 0,
        sortOrder: i,
      });
      testPhotoIds.push(photo.id);
    }
  });

  afterAll(async () => {
    // Clean up test photos
    await Promise.all(testPhotoIds.map(id => db.deletePhoto(id)));
  });

  describe('Authorization', () => {
    it('should allow admin to batch quick update', async () => {
      const result = await adminCaller.photos.batchQuickUpdate({
        ids: [testPhotoIds[0]],
        field: 'displayTitle',
        value: 'Updated Title',
      });

      expect(result.succeeded).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.total).toBe(1);
    });

    it('should reject non-admin users', async () => {
      await expect(
        nonAdminCaller.photos.batchQuickUpdate({
          ids: [testPhotoIds[0]],
          field: 'displayTitle',
          value: 'Hacked Title',
        })
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('Batch Title Updates', () => {
    it('should update multiple photos with replace mode', async () => {
      const result = await adminCaller.photos.batchQuickUpdate({
        ids: [testPhotoIds[0], testPhotoIds[1]],
        field: 'displayTitle',
        value: 'New Title',
        mode: 'replace',
      });

      expect(result.succeeded).toBe(2);
      expect(result.failed).toBe(0);

      const photo1 = await db.getPhotoById(testPhotoIds[0]);
      const photo2 = await db.getPhotoById(testPhotoIds[1]);
      expect(photo1?.displayTitle).toBe('New Title');
      expect(photo2?.displayTitle).toBe('New Title');
    });

    it('should update multiple photos with prefix mode', async () => {
      // Reset titles first
      await db.updatePhoto(testPhotoIds[2], { displayTitle: 'Original' });
      await db.updatePhoto(testPhotoIds[3], { displayTitle: 'Original' });

      const result = await adminCaller.photos.batchQuickUpdate({
        ids: [testPhotoIds[2], testPhotoIds[3]],
        field: 'displayTitle',
        value: 'PREFIX_',
        mode: 'prefix',
      });

      expect(result.succeeded).toBe(2);
      expect(result.failed).toBe(0);

      const photo1 = await db.getPhotoById(testPhotoIds[2]);
      const photo2 = await db.getPhotoById(testPhotoIds[3]);
      expect(photo1?.displayTitle).toBe('PREFIX_Original');
      expect(photo2?.displayTitle).toBe('PREFIX_Original');
    });

    it('should update multiple photos with suffix mode', async () => {
      // Reset titles first
      await db.updatePhoto(testPhotoIds[2], { displayTitle: 'Original' });
      await db.updatePhoto(testPhotoIds[3], { displayTitle: 'Original' });

      const result = await adminCaller.photos.batchQuickUpdate({
        ids: [testPhotoIds[2], testPhotoIds[3]],
        field: 'displayTitle',
        value: '_SUFFIX',
        mode: 'suffix',
      });

      expect(result.succeeded).toBe(2);
      expect(result.failed).toBe(0);

      const photo1 = await db.getPhotoById(testPhotoIds[2]);
      const photo2 = await db.getPhotoById(testPhotoIds[3]);
      expect(photo1?.displayTitle).toBe('Original_SUFFIX');
      expect(photo2?.displayTitle).toBe('Original_SUFFIX');
    });
  });

  describe('Batch Visibility Updates', () => {
    it('should update multiple photos to visible', async () => {
      // Set to hidden first
      await db.updatePhoto(testPhotoIds[0], { isVisible: 0 });
      await db.updatePhoto(testPhotoIds[1], { isVisible: 0 });

      const result = await adminCaller.photos.batchQuickUpdate({
        ids: [testPhotoIds[0], testPhotoIds[1]],
        field: 'isVisible',
        value: 1,
      });

      expect(result.succeeded).toBe(2);
      expect(result.failed).toBe(0);

      const photo1 = await db.getPhotoById(testPhotoIds[0]);
      const photo2 = await db.getPhotoById(testPhotoIds[1]);
      expect(photo1?.isVisible).toBe(1);
      expect(photo2?.isVisible).toBe(1);
    });

    it('should update multiple photos to hidden', async () => {
      const result = await adminCaller.photos.batchQuickUpdate({
        ids: [testPhotoIds[0], testPhotoIds[1]],
        field: 'isVisible',
        value: 0,
      });

      expect(result.succeeded).toBe(2);
      expect(result.failed).toBe(0);

      const photo1 = await db.getPhotoById(testPhotoIds[0]);
      const photo2 = await db.getPhotoById(testPhotoIds[1]);
      expect(photo1?.isVisible).toBe(0);
      expect(photo2?.isVisible).toBe(0);
    });
  });

  describe('Batch Featured Updates', () => {
    it('should update multiple photos to featured', async () => {
      const result = await adminCaller.photos.batchQuickUpdate({
        ids: [testPhotoIds[2], testPhotoIds[3]],
        field: 'featured',
        value: 1,
      });

      expect(result.succeeded).toBe(2);
      expect(result.failed).toBe(0);

      const photo1 = await db.getPhotoById(testPhotoIds[2]);
      const photo2 = await db.getPhotoById(testPhotoIds[3]);
      expect(photo1?.featured).toBe(1);
      expect(photo2?.featured).toBe(1);
    });

    it('should update multiple photos to non-featured', async () => {
      const result = await adminCaller.photos.batchQuickUpdate({
        ids: [testPhotoIds[2], testPhotoIds[3]],
        field: 'featured',
        value: 0,
      });

      expect(result.succeeded).toBe(2);
      expect(result.failed).toBe(0);

      const photo1 = await db.getPhotoById(testPhotoIds[2]);
      const photo2 = await db.getPhotoById(testPhotoIds[3]);
      expect(photo1?.featured).toBe(0);
      expect(photo2?.featured).toBe(0);
    });
  });

  describe('Input Validation', () => {
    it('should reject invalid isVisible value (not 0 or 1)', async () => {
      await expect(
        adminCaller.photos.batchQuickUpdate({
          ids: [testPhotoIds[0]],
          field: 'isVisible',
          value: 2,
        })
      ).rejects.toThrow();
    });

    it('should reject invalid featured value (not 0 or 1)', async () => {
      await expect(
        adminCaller.photos.batchQuickUpdate({
          ids: [testPhotoIds[0]],
          field: 'featured',
          value: 5,
        })
      ).rejects.toThrow();
    });

    it('should reject non-string value for displayTitle', async () => {
      await expect(
        adminCaller.photos.batchQuickUpdate({
          ids: [testPhotoIds[0]],
          field: 'displayTitle',
          value: 123 as any,
        })
      ).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty photo array', async () => {
      const result = await adminCaller.photos.batchQuickUpdate({
        ids: [],
        field: 'displayTitle',
        value: 'Test',
      });

      expect(result.succeeded).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should handle non-existent photo IDs', async () => {
      const result = await adminCaller.photos.batchQuickUpdate({
        ids: [999999, 999998],
        field: 'displayTitle',
        value: 'Test',
      });

      // Non-existent IDs will be silently ignored by updatePhoto
      expect(result.total).toBe(2);
    });

    it('should handle mixed valid and invalid IDs', async () => {
      const result = await adminCaller.photos.batchQuickUpdate({
        ids: [testPhotoIds[0], 999999],
        field: 'displayTitle',
        value: 'Mixed Test',
      });

      expect(result.total).toBe(2);
      // Valid photo should be updated
      const photo = await db.getPhotoById(testPhotoIds[0]);
      expect(photo?.displayTitle).toBe('Mixed Test');
    });

    it('should handle empty string for displayTitle', async () => {
      const result = await adminCaller.photos.batchQuickUpdate({
        ids: [testPhotoIds[4]],
        field: 'displayTitle',
        value: '',
      });

      expect(result.succeeded).toBe(1);
      const photo = await db.getPhotoById(testPhotoIds[4]);
      expect(photo?.displayTitle).toBe('');
    });

    it('should handle very long displayTitle', async () => {
      const longTitle = 'A'.repeat(200); // Reduce to reasonable length
      const result = await adminCaller.photos.batchQuickUpdate({
        ids: [testPhotoIds[4]],
        field: 'displayTitle',
        value: longTitle,
      });

      expect(result.succeeded).toBe(1);
      const photo = await db.getPhotoById(testPhotoIds[4]);
      expect(photo?.displayTitle).toBe(longTitle);
    });

    it('should handle special characters in displayTitle', async () => {
      const specialTitle = '特殊字符 !@#$%^&*() 測試 <script>alert("xss")</script>';
      const result = await adminCaller.photos.batchQuickUpdate({
        ids: [testPhotoIds[4]],
        field: 'displayTitle',
        value: specialTitle,
      });

      expect(result.succeeded).toBe(1);
      const photo = await db.getPhotoById(testPhotoIds[4]);
      expect(photo?.displayTitle).toBe(specialTitle);
    });
  });

  describe('Performance', () => {
    it('should update large batch quickly (< 5 seconds for 5 photos)', async () => {
      const startTime = Date.now();
      
      const result = await adminCaller.photos.batchQuickUpdate({
        ids: testPhotoIds,
        field: 'displayTitle',
        value: 'Performance Test',
      });

      const duration = Date.now() - startTime;

      expect(result.succeeded).toBe(5);
      expect(duration).toBeLessThan(5000);
    });
  });
});
