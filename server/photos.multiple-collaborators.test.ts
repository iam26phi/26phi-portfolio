import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from './db';

describe('Photos Multiple Collaborators Feature', () => {
  let testPhotoId: number;
  let testCollaborator1Id: number;
  let testCollaborator2Id: number;
  let testCollaborator3Id: number;

  beforeAll(async () => {
    // Create test collaborators
    const collab1 = await db.createCollaborator({
      name: 'Test Collaborator 1',
      slug: 'test-collab-1-' + Date.now(),
      instagram: '@testcollab1',
    });
    const collab2 = await db.createCollaborator({
      name: 'Test Collaborator 2',
      slug: 'test-collab-2-' + Date.now(),
      instagram: '@testcollab2',
    });
    const collab3 = await db.createCollaborator({
      name: 'Test Collaborator 3',
      slug: 'test-collab-3-' + Date.now(),
      instagram: '@testcollab3',
    });

    testCollaborator1Id = collab1!.id;
    testCollaborator2Id = collab2!.id;
    testCollaborator3Id = collab3!.id;

    // Create a test photo
    const photo = await db.createPhoto({
      src: '/test-multi-collab.jpg',
      alt: 'Test photo with multiple collaborators',
      category: 'Portrait',
      isVisible: 1,
      sortOrder: 0,
      slug: 'test-multi-collab-' + Date.now(),
    });

    testPhotoId = photo!.id;
  });

  afterAll(async () => {
    // Clean up
    if (testPhotoId) {
      await db.deletePhoto(testPhotoId);
    }
    if (testCollaborator1Id) {
      await db.deleteCollaborator(testCollaborator1Id);
    }
    if (testCollaborator2Id) {
      await db.deleteCollaborator(testCollaborator2Id);
    }
    if (testCollaborator3Id) {
      await db.deleteCollaborator(testCollaborator3Id);
    }
  });

  it('should add multiple collaborators to a photo', async () => {
    await db.setPhotoCollaborators(testPhotoId, [testCollaborator1Id, testCollaborator2Id]);
    
    const collaborators = await db.getPhotoCollaborators(testPhotoId);
    expect(collaborators).toHaveLength(2);
    expect(collaborators.map(c => c.id)).toContain(testCollaborator1Id);
    expect(collaborators.map(c => c.id)).toContain(testCollaborator2Id);
  });

  it('should replace existing collaborators when setting new ones', async () => {
    // First set
    await db.setPhotoCollaborators(testPhotoId, [testCollaborator1Id]);
    let collaborators = await db.getPhotoCollaborators(testPhotoId);
    expect(collaborators).toHaveLength(1);
    expect(collaborators[0].id).toBe(testCollaborator1Id);

    // Replace with new set
    await db.setPhotoCollaborators(testPhotoId, [testCollaborator2Id, testCollaborator3Id]);
    collaborators = await db.getPhotoCollaborators(testPhotoId);
    expect(collaborators).toHaveLength(2);
    expect(collaborators.map(c => c.id)).not.toContain(testCollaborator1Id);
    expect(collaborators.map(c => c.id)).toContain(testCollaborator2Id);
    expect(collaborators.map(c => c.id)).toContain(testCollaborator3Id);
  });

  it('should remove all collaborators when setting empty array', async () => {
    await db.setPhotoCollaborators(testPhotoId, [testCollaborator1Id, testCollaborator2Id]);
    let collaborators = await db.getPhotoCollaborators(testPhotoId);
    expect(collaborators).toHaveLength(2);

    await db.setPhotoCollaborators(testPhotoId, []);
    collaborators = await db.getPhotoCollaborators(testPhotoId);
    expect(collaborators).toHaveLength(0);
  });

  it('should add a single collaborator', async () => {
    await db.addPhotoCollaborator(testPhotoId, testCollaborator1Id);
    
    const collaborators = await db.getPhotoCollaborators(testPhotoId);
    expect(collaborators.length).toBeGreaterThanOrEqual(1);
    expect(collaborators.map(c => c.id)).toContain(testCollaborator1Id);
  });

  it('should remove a specific collaborator', async () => {
    await db.setPhotoCollaborators(testPhotoId, [testCollaborator1Id, testCollaborator2Id, testCollaborator3Id]);
    let collaborators = await db.getPhotoCollaborators(testPhotoId);
    expect(collaborators).toHaveLength(3);

    await db.removePhotoCollaborator(testPhotoId, testCollaborator2Id);
    collaborators = await db.getPhotoCollaborators(testPhotoId);
    expect(collaborators).toHaveLength(2);
    expect(collaborators.map(c => c.id)).not.toContain(testCollaborator2Id);
    expect(collaborators.map(c => c.id)).toContain(testCollaborator1Id);
    expect(collaborators.map(c => c.id)).toContain(testCollaborator3Id);
  });

  it('should return collaborators with correct properties', async () => {
    await db.setPhotoCollaborators(testPhotoId, [testCollaborator1Id]);
    
    const collaborators = await db.getPhotoCollaborators(testPhotoId);
    expect(collaborators).toHaveLength(1);
    
    const collab = collaborators[0];
    expect(collab).toHaveProperty('id');
    expect(collab).toHaveProperty('name');
    expect(collab).toHaveProperty('slug');
    expect(collab).toHaveProperty('instagram');
    expect(collab.name).toBe('Test Collaborator 1');
    expect(collab.instagram).toBe('@testcollab1');
  });

  it('should include collaborators in getVisiblePhotos', async () => {
    await db.setPhotoCollaborators(testPhotoId, [testCollaborator1Id, testCollaborator2Id]);
    
    const photos = await db.getVisiblePhotos();
    const testPhoto = photos.find(p => p.id === testPhotoId);
    
    expect(testPhoto).toBeDefined();
    expect(testPhoto?.collaborators).toBeDefined();
    expect(testPhoto?.collaborators).toHaveLength(2);
  });
});
