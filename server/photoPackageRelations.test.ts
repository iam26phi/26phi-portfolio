import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db.js';

describe('Photo-Package Relations', () => {
  let testPhotoId: number;
  let testPackageId1: number;
  let testPackageId2: number;

  beforeAll(async () => {
    // Create test photo
    const photo = await db.createPhoto({
      src: '/test/photo-package-relation.jpg',
      alt: 'Test Photo for Package Relation',
      category: 'portrait',
      isVisible: 1,
      sortOrder: 999,
      location: '',
      date: '',
      description: '',
    });
    testPhotoId = photo.id;

    // Create test packages
    const pkg1 = await db.createBookingPackage({
      name: 'Test Package 1',
      price: 1000,
      duration: 60,
      description: 'Test package 1 description',
      isActive: 1,
      sortOrder: 999,
    });
    testPackageId1 = pkg1.id;

    const pkg2 = await db.createBookingPackage({
      name: 'Test Package 2',
      price: 2000,
      duration: 120,
      description: 'Test package 2 description',
      isActive: 1,
      sortOrder: 1000,
    });
    testPackageId2 = pkg2.id;
  });

  it('should associate photo with packages', async () => {
    await db.updatePhotoPackages(testPhotoId, [testPackageId1, testPackageId2]);
    
    const packageIds = await db.getPhotoPackages(testPhotoId);
    expect(packageIds).toHaveLength(2);
    expect(packageIds).toContain(testPackageId1);
    expect(packageIds).toContain(testPackageId2);
  });

  it('should get photos associated with a package', async () => {
    const photos = await db.getPackagePhotos(testPackageId1);
    expect(photos.length).toBeGreaterThan(0);
    
    const testPhoto = photos.find(p => p.id === testPhotoId);
    expect(testPhoto).toBeDefined();
    expect(testPhoto?.alt).toBe('Test Photo for Package Relation');
  });

  it('should update photo-package associations (remove one)', async () => {
    // Remove testPackageId2, keep only testPackageId1
    await db.updatePhotoPackages(testPhotoId, [testPackageId1]);
    
    const packageIds = await db.getPhotoPackages(testPhotoId);
    expect(packageIds).toHaveLength(1);
    expect(packageIds).toContain(testPackageId1);
    expect(packageIds).not.toContain(testPackageId2);
  });

  it('should clear all photo-package associations', async () => {
    await db.updatePhotoPackages(testPhotoId, []);
    
    const packageIds = await db.getPhotoPackages(testPhotoId);
    expect(packageIds).toHaveLength(0);
  });

  it('should handle multiple photos for one package', async () => {
    // Create another test photo
    const photo2 = await db.createPhoto({
      src: '/test/photo-package-relation-2.jpg',
      alt: 'Test Photo 2 for Package Relation',
      category: 'portrait',
      isVisible: 1,
      sortOrder: 1000,
      location: '',
      date: '',
      description: '',
    });

    // Associate both photos with testPackageId1
    await db.updatePhotoPackages(testPhotoId, [testPackageId1]);
    await db.updatePhotoPackages(photo2.id, [testPackageId1]);

    const photos = await db.getPackagePhotos(testPackageId1);
    expect(photos.length).toBeGreaterThanOrEqual(2);
    
    const photoIds = photos.map(p => p.id);
    expect(photoIds).toContain(testPhotoId);
    expect(photoIds).toContain(photo2.id);

    // Cleanup
    await db.deletePhoto({ id: photo2.id });
  });

  it('should return empty array for package with no photos', async () => {
    const photos = await db.getPackagePhotos(testPackageId2);
    expect(photos).toEqual([]);
  });

  it('should return empty array for non-existent photo', async () => {
    const packageIds = await db.getPhotoPackages(999999);
    expect(packageIds).toEqual([]);
  });

  it('should handle duplicate package IDs gracefully', async () => {
    // Try to associate with duplicate IDs
    await db.updatePhotoPackages(testPhotoId, [testPackageId1, testPackageId1, testPackageId2]);
    
    const packageIds = await db.getPhotoPackages(testPhotoId);
    // Should only have unique package IDs
    expect(packageIds).toHaveLength(2);
    expect(packageIds).toContain(testPackageId1);
    expect(packageIds).toContain(testPackageId2);
  });
});
