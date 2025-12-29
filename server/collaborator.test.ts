import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';

describe('Collaborator System', () => {
  let testCollaboratorId: number;
  let testPhotoId: number;
  const timestamp = Date.now();

  beforeAll(async () => {
    
    
    // Create a test collaborator with unique slug
    const collaborator = await db.createCollaborator({
      name: 'Test Collaborator',
      slug: `test-collaborator-${timestamp}`,
      description: 'A test collaborator for unit testing',
      avatar: 'https://example.com/avatar.jpg',
      website: 'https://example.com',
      instagram: '@testuser',
      email: 'test@example.com',
      isVisible: 1,
      sortOrder: 0,
    });
    testCollaboratorId = collaborator.id;

    // Create a test photo with collaborator
    const photo = await db.createPhoto({
      src: '/test-photo.jpg',
      alt: 'Test Photo with Collaborator',
      category: 'portrait',
      collaboratorId: testCollaboratorId,
      location: 'Test Location',
      date: '2024-01-01',
      description: 'A test photo with collaborator',
      isVisible: 1,
      sortOrder: 0,
    });
    testPhotoId = photo.id;
  });

  describe('Collaborator CRUD Operations', () => {
    it('should create a collaborator successfully', async () => {
      
      const collaborator = await db.createCollaborator({
        name: 'New Collaborator',
        slug: `new-collaborator-${timestamp}`,
        description: 'Another test collaborator',
        isVisible: 1,
        sortOrder: 1,
      });

      expect(collaborator).toBeDefined();
      expect(collaborator.name).toBe('New Collaborator');
      expect(collaborator.slug).toBe(`new-collaborator-${timestamp}`);
    });

    it('should get collaborator by ID', async () => {
      
      const collaborator = await db.getCollaboratorById(testCollaboratorId);

      expect(collaborator).toBeDefined();
      expect(collaborator?.id).toBe(testCollaboratorId);
      expect(collaborator?.name).toBe('Test Collaborator');
    });

    it('should get collaborator by slug', async () => {
      
      const collaborator = await db.getCollaboratorBySlug(`test-collaborator-${timestamp}`);

      expect(collaborator).toBeDefined();
      expect(collaborator?.slug).toBe(`test-collaborator-${timestamp}`);
      expect(collaborator?.name).toBe('Test Collaborator');
    });

    it('should list all visible collaborators', async () => {
      
      const collaborators = await db.listCollaborators();

      expect(Array.isArray(collaborators)).toBe(true);
      expect(collaborators.length).toBeGreaterThan(0);
      expect(collaborators.every(c => c.isVisible === 1)).toBe(true);
    });

    it('should list all collaborators (admin)', async () => {
      
      const collaborators = await db.listAllCollaborators();

      expect(Array.isArray(collaborators)).toBe(true);
      expect(collaborators.length).toBeGreaterThan(0);
    });

    it('should update collaborator', async () => {
      
      const updated = await db.updateCollaborator(testCollaboratorId, {
        description: 'Updated description for testing',
      });

      expect(updated).toBeDefined();
      
      const collaborator = await db.getCollaboratorById(testCollaboratorId);
      expect(collaborator?.description).toBe('Updated description for testing');
    });

    it('should get photos by collaborator ID', async () => {
      
      const photos = await db.getPhotosByCollaboratorId(testCollaboratorId);

      expect(Array.isArray(photos)).toBe(true);
      expect(photos.length).toBeGreaterThan(0);
      expect(photos[0].collaboratorId).toBe(testCollaboratorId);
    });
  });

  describe('Photo-Collaborator Association', () => {
    it('should create photo with collaborator', async () => {
      
      const photo = await db.createPhoto({
        src: '/test-photo-2.jpg',
        alt: 'Another Test Photo',
        category: 'portrait',
        collaboratorId: testCollaboratorId,
        location: 'Test Location 2',
        date: '2024-01-02',
        description: 'Another test photo',
        isVisible: 1,
        sortOrder: 1,
      });

      expect(photo).toBeDefined();
      expect(photo.collaboratorId).toBe(testCollaboratorId);
    });

    it('should update photo collaborator', async () => {
      
      
      // Create another collaborator
      const newCollaborator = await db.createCollaborator({
        name: 'Another Collaborator',
        slug: `another-collaborator-${timestamp}`,
        isVisible: 1,
        sortOrder: 2,
      });

      // Update photo to use new collaborator
      await db.updatePhoto(testPhotoId, {
        collaboratorId: newCollaborator.id,
      });

      const photo = await db.getPhotoById(testPhotoId);
      expect(photo?.collaboratorId).toBe(newCollaborator.id);
    });

    it('should remove collaborator from photo', async () => {
      
      
      await db.updatePhoto(testPhotoId, {
        collaboratorId: null,
      });

      const photo = await db.getPhotoById(testPhotoId);
      // collaboratorId can be null or undefined depending on database driver
      expect(photo?.collaboratorId == null).toBe(true);
    });
  });

  describe('Collaborator with Photos Query', () => {
    it('should get collaborator with photos', async () => {
      
      
      // First, re-associate the photo with the collaborator
      await db.updatePhoto(testPhotoId, {
        collaboratorId: testCollaboratorId,
      });

      const collaborator = await db.getCollaboratorBySlug(`test-collaborator-${timestamp}`);
      const photos = await db.getPhotosByCollaboratorId(testCollaboratorId);

      expect(collaborator).toBeDefined();
      expect(photos.length).toBeGreaterThan(0);
      expect(photos.some(p => p.id === testPhotoId)).toBe(true);
    });
  });

  describe('Collaborator Deletion', () => {
    it('should delete collaborator', async () => {
      
      
      // Create a temporary collaborator for deletion test
      const tempCollaborator = await db.createCollaborator({
        name: 'Temp Collaborator',
        slug: `temp-collaborator-${timestamp}`,
        isVisible: 1,
        sortOrder: 99,
      });

      await db.deleteCollaborator(tempCollaborator.id);

      const deleted = await db.getCollaboratorById(tempCollaborator.id);
      expect(deleted).toBeNull();
    });

    it('should handle deleting collaborator with associated photos', async () => {
      
      
      // When a collaborator is deleted, associated photos should have collaboratorId set to null
      // This is handled by the database ON DELETE SET NULL constraint
      
      // Create a new collaborator and photo
      const collaborator = await db.createCollaborator({
        name: 'To Delete',
        slug: `to-delete-${timestamp}`,
        isVisible: 1,
        sortOrder: 100,
      });

      const photo = await db.createPhoto({
        src: '/test-delete.jpg',
        alt: 'Test Delete Photo',
        category: 'portrait',
        collaboratorId: collaborator.id,
        isVisible: 1,
        sortOrder: 0,
      });

      // Delete the collaborator
      await db.deleteCollaborator(collaborator.id);

      // Check that the photo's collaboratorId is now null
      const updatedPhoto = await db.getPhotoById(photo.id);
      // collaboratorId can be null or undefined depending on database driver
      expect(updatedPhoto?.collaboratorId == null).toBe(true);
    });
  });
});
