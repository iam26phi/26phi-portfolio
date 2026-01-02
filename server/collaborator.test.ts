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

    // Create a test photo
    const photo = await db.createPhoto({
      src: '/test-photo.jpg',
      alt: 'Test Photo with Collaborator',
      category: 'portrait',
      location: 'Test Location',
      date: '2024-01-01',
      description: 'A test photo with collaborator',
      isVisible: 1,
      sortOrder: 0,
    });
    testPhotoId = photo.id;

    // Associate photo with collaborator using many-to-many relationship
    await db.addPhotoCollaborator(testPhotoId, testCollaboratorId);
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
    });

    it('should update collaborator', async () => {
      
      
      await db.updateCollaborator(testCollaboratorId, {
        description: 'Updated description for testing',
      });

      const collaborator = await db.getCollaboratorById(testCollaboratorId);
      expect(collaborator?.description).toBe('Updated description for testing');
    });

    it('should get photos by collaborator ID', async () => {
      
      const photos = await db.getPhotosByCollaboratorId(testCollaboratorId);

      expect(Array.isArray(photos)).toBe(true);
      expect(photos.length).toBeGreaterThan(0);
      // Verify the test photo is in the results
      expect(photos.some(p => p.id === testPhotoId)).toBe(true);
    });
  });

  describe('Photo-Collaborator Many-to-Many Association', () => {
    it('should add collaborator to photo', async () => {
      
      // Create a new photo
      const photo = await db.createPhoto({
        src: '/test-photo-2.jpg',
        alt: 'Another Test Photo',
        category: 'portrait',
        location: 'Test Location 2',
        date: '2024-01-02',
        description: 'Another test photo',
        isVisible: 1,
        sortOrder: 1,
      });

      // Add collaborator to photo
      await db.addPhotoCollaborator(photo.id, testCollaboratorId);

      // Verify the association
      const collaborators = await db.getPhotoCollaborators(photo.id);
      expect(collaborators.length).toBeGreaterThan(0);
      expect(collaborators.some(c => c.id === testCollaboratorId)).toBe(true);
    });

    it('should support multiple collaborators per photo', async () => {
      
      
      // Create another collaborator
      const newCollaborator = await db.createCollaborator({
        name: 'Another Collaborator',
        slug: `another-collaborator-${timestamp}`,
        isVisible: 1,
        sortOrder: 2,
      });

      // Add second collaborator to the test photo
      await db.addPhotoCollaborator(testPhotoId, newCollaborator.id);

      // Verify both collaborators are associated
      const collaborators = await db.getPhotoCollaborators(testPhotoId);
      expect(collaborators.length).toBeGreaterThanOrEqual(2);
      expect(collaborators.some(c => c.id === testCollaboratorId)).toBe(true);
      expect(collaborators.some(c => c.id === newCollaborator.id)).toBe(true);
    });

    it('should remove collaborator from photo', async () => {
      
      
      // Create a temporary collaborator
      const tempCollaborator = await db.createCollaborator({
        name: 'Temp Collaborator',
        slug: `temp-collab-${timestamp}`,
        isVisible: 1,
        sortOrder: 3,
      });

      // Add and then remove
      await db.addPhotoCollaborator(testPhotoId, tempCollaborator.id);
      await db.removePhotoCollaborator(testPhotoId, tempCollaborator.id);

      // Verify removal
      const collaborators = await db.getPhotoCollaborators(testPhotoId);
      expect(collaborators.some(c => c.id === tempCollaborator.id)).toBe(false);
    });

    it('should set multiple collaborators at once', async () => {
      
      
      // Create two new collaborators
      const collab1 = await db.createCollaborator({
        name: 'Batch Collab 1',
        slug: `batch-collab-1-${timestamp}`,
        isVisible: 1,
        sortOrder: 4,
      });

      const collab2 = await db.createCollaborator({
        name: 'Batch Collab 2',
        slug: `batch-collab-2-${timestamp}`,
        isVisible: 1,
        sortOrder: 5,
      });

      // Create a new photo
      const photo = await db.createPhoto({
        src: '/test-batch.jpg',
        alt: 'Batch Test Photo',
        category: 'portrait',
        isVisible: 1,
        sortOrder: 2,
      });

      // Set collaborators in batch
      await db.setPhotoCollaborators(photo.id, [collab1.id, collab2.id]);

      // Verify
      const collaborators = await db.getPhotoCollaborators(photo.id);
      expect(collaborators.length).toBe(2);
      expect(collaborators.some(c => c.id === collab1.id)).toBe(true);
      expect(collaborators.some(c => c.id === collab2.id)).toBe(true);
    });
  });

  describe('Collaborator with Photos Query', () => {
    it('should get collaborator with photos', async () => {
      
      
      const collaborator = await db.getCollaboratorBySlug(`test-collaborator-${timestamp}`);
      const photos = await db.getPhotosByCollaboratorId(testCollaboratorId);

      expect(collaborator).toBeDefined();
      expect(photos.length).toBeGreaterThan(0);
      expect(photos.some(p => p.id === testPhotoId)).toBe(true);
    });

    it('should get visible photos only for public view', async () => {
      
      
      const visiblePhotos = await db.getVisiblePhotosByCollaboratorId(testCollaboratorId);

      expect(Array.isArray(visiblePhotos)).toBe(true);
      // All returned photos should be visible
      visiblePhotos.forEach(photo => {
        expect(photo.isVisible).toBe(1);
      });
    });
  });

  describe('Collaborator Deletion', () => {
    it('should delete collaborator', async () => {
      
      
      // Create a temporary collaborator for deletion test
      const tempCollaborator = await db.createCollaborator({
        name: 'Temp Collaborator for Deletion',
        slug: `temp-delete-collaborator-${timestamp}`,
        isVisible: 1,
        sortOrder: 99,
      });

      await db.deleteCollaborator(tempCollaborator.id);

      const deleted = await db.getCollaboratorById(tempCollaborator.id);
      expect(deleted).toBeNull();
    });

    it('should handle deleting collaborator with associated photos', async () => {
      
      
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
        isVisible: 1,
        sortOrder: 0,
      });

      // Associate photo with collaborator
      await db.addPhotoCollaborator(photo.id, collaborator.id);

      // Verify association exists
      let collaborators = await db.getPhotoCollaborators(photo.id);
      expect(collaborators.some(c => c.id === collaborator.id)).toBe(true);

      // Delete the collaborator
      await db.deleteCollaborator(collaborator.id);

      // Verify the association is removed (cascade delete)
      collaborators = await db.getPhotoCollaborators(photo.id);
      expect(collaborators.some(c => c.id === collaborator.id)).toBe(false);

      // Photo itself should still exist
      const photoStillExists = await db.getPhotoById(photo.id);
      expect(photoStillExists).toBeDefined();
    });
  });
});
