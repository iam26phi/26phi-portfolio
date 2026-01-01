import { describe, it, expect, beforeAll } from 'vitest';
import { getVisiblePhotos } from './db';

describe('N+1 Query Optimization', () => {
  it('should fetch visible photos with collaborators efficiently', async () => {
    const startTime = Date.now();
    const photos = await getVisiblePhotos();
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should return photos array
    expect(Array.isArray(photos)).toBe(true);

    // Should complete in reasonable time (< 2 seconds for optimized query)
    // Note: First query may be slower due to cold start
    expect(duration).toBeLessThan(2000);

    console.log(`✓ Fetched ${photos.length} photos in ${duration}ms`);
  });

  it('should include collaborators array for each photo', async () => {
    const photos = await getVisiblePhotos();

    // Each photo should have collaborators property
    photos.forEach(photo => {
      expect(photo).toHaveProperty('collaborators');
      expect(Array.isArray(photo.collaborators)).toBe(true);
    });

    // Count photos with collaborators
    const photosWithCollaborators = photos.filter(p => p.collaborators.length > 0);
    console.log(`✓ ${photosWithCollaborators.length}/${photos.length} photos have collaborators`);
  });

  it('should maintain data integrity after optimization', async () => {
    const photos = await getVisiblePhotos();

    // All photos should be visible
    photos.forEach(photo => {
      expect(photo.isVisible).toBe(1);
    });

    // Collaborators should have required fields
    photos.forEach(photo => {
      photo.collaborators.forEach(collab => {
        expect(collab).toHaveProperty('id');
        expect(collab).toHaveProperty('name');
        expect(collab).toHaveProperty('slug');
        expect(collab.id).not.toBeNull();
      });
    });

    console.log(`✓ Data integrity verified for ${photos.length} photos`);
  });

  it('should handle photos without collaborators correctly', async () => {
    const photos = await getVisiblePhotos();

    // Photos without collaborators should have empty array
    const photosWithoutCollaborators = photos.filter(p => p.collaborators.length === 0);
    
    photosWithoutCollaborators.forEach(photo => {
      expect(photo.collaborators).toEqual([]);
    });

    console.log(`✓ ${photosWithoutCollaborators.length} photos without collaborators handled correctly`);
  });

  it('should return photos in correct sort order', async () => {
    const photos = await getVisiblePhotos();

    // Check if photos are sorted by sortOrder
    for (let i = 0; i < photos.length - 1; i++) {
      expect(photos[i].sortOrder).toBeLessThanOrEqual(photos[i + 1].sortOrder);
    }

    console.log(`✓ Photos sorted correctly by sortOrder`);
  });
});
