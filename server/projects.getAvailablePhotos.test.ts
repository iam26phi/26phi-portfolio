import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';

describe('projects.getAvailablePhotos', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let adminContext: any;
  let nonAdminContext: any;
  const timestamp = Date.now();

  beforeAll(async () => {
    // Create admin context
    adminContext = {
      user: { openId: 'test-admin', role: 'admin' },
    };

    // Create non-admin context
    nonAdminContext = {
      user: { openId: 'test-user', role: 'user' },
    };

    // Create caller with admin context
    caller = appRouter.createCaller(adminContext);
  });

  it('should require admin role', async () => {
    const nonAdminCaller = appRouter.createCaller(nonAdminContext);
    
    await expect(
      nonAdminCaller.projects.getAvailablePhotos({ projectId: 1 })
    ).rejects.toThrow('Unauthorized');
  });

  it('should return all photos when no photos are assigned to any project', async () => {
    // Create test photos
    const photo1 = await db.createPhoto({
      src: 'https://example.com/photo1.jpg',
      alt: 'Test Photo 1',
      category: 'Test',
      isVisible: 1,
      sortOrder: 1,
    });
    const photo1Id = photo1!.id;

    const photo2 = await db.createPhoto({
      src: 'https://example.com/photo2.jpg',
      alt: 'Test Photo 2',
      category: 'Test',
      isVisible: 1,
      sortOrder: 2,
    });
    const photo2Id = photo2!.id;

    // Create test project
    const project = await db.createProject({
      title: 'Test Project',
      slug: `test-project-available-${timestamp}`,
      description: 'Test Description',
      isVisible: 1,
      sortOrder: 1,
    });
    const projectId = project!.id;

    const availablePhotos = await caller.projects.getAvailablePhotos({ projectId });

    expect(availablePhotos.length).toBeGreaterThanOrEqual(2);
    expect(availablePhotos.some(p => p.id === photo1Id)).toBe(true);
    expect(availablePhotos.some(p => p.id === photo2Id)).toBe(true);

    // Cleanup
    await db.deletePhoto(photo1Id);
    await db.deletePhoto(photo2Id);
    await db.deleteProject(projectId);
  });

  it('should exclude photos assigned to other projects', async () => {
    // Create test photos
    const photo1 = await db.createPhoto({
      src: 'https://example.com/photo1.jpg',
      alt: 'Test Photo 1',
      category: 'Test',
      isVisible: 1,
      sortOrder: 1,
    });
    const photo1Id = photo1!.id;

    const photo2 = await db.createPhoto({
      src: 'https://example.com/photo2.jpg',
      alt: 'Test Photo 2',
      category: 'Test',
      isVisible: 1,
      sortOrder: 2,
    });
    const photo2Id = photo2!.id;

    // Create two test projects
    const project1 = await db.createProject({
      title: 'Test Project 1',
      slug: `test-project-1-exclude-${timestamp}`,
      description: 'Test Description 1',
      isVisible: 1,
      sortOrder: 1,
    });
    const project1Id = project1!.id;

    const project2 = await db.createProject({
      title: 'Test Project 2',
      slug: `test-project-2-exclude-${timestamp}`,
      description: 'Test Description 2',
      isVisible: 1,
      sortOrder: 2,
    });
    const project2Id = project2!.id;

    // Assign photo1 to project1
    await db.addPhotoToProject(photo1Id, project1Id);

    // Get available photos for project2
    const availablePhotos = await caller.projects.getAvailablePhotos({ projectId: project2Id });

    // photo1 should NOT be in the available list (assigned to project1)
    expect(availablePhotos.some(p => p.id === photo1Id)).toBe(false);
    
    // photo2 should be in the available list (not assigned to any project)
    expect(availablePhotos.some(p => p.id === photo2Id)).toBe(true);

    // Cleanup
    await db.removePhotoFromProject(photo1Id, project1Id);
    await db.deletePhoto(photo1Id);
    await db.deletePhoto(photo2Id);
    await db.deleteProject(project1Id);
    await db.deleteProject(project2Id);
  });

  it('should include photos already assigned to the current project', async () => {
    // Create test photo
    const photo = await db.createPhoto({
      src: 'https://example.com/photo.jpg',
      alt: 'Test Photo',
      category: 'Test',
      isVisible: 1,
      sortOrder: 1,
    });
    const photoId = photo!.id;

    // Create test project
    const project = await db.createProject({
      title: 'Test Project',
      slug: `test-project-include-${timestamp}`,
      description: 'Test Description',
      isVisible: 1,
      sortOrder: 1,
    });
    const projectId = project!.id;

    // Assign photo to project
    await db.addPhotoToProject(photoId, projectId);

    // Get available photos for the same project
    const availablePhotos = await caller.projects.getAvailablePhotos({ projectId });

    // The photo should still be in the available list (assigned to this project)
    expect(availablePhotos.some(p => p.id === photoId)).toBe(true);

    // Cleanup
    await db.removePhotoFromProject(photoId, projectId);
    await db.deletePhoto(photoId);
    await db.deleteProject(projectId);
  });

  it('should return empty array when all photos are assigned to other projects', async () => {
    // Create test photos
    const photo1 = await db.createPhoto({
      src: 'https://example.com/photo1.jpg',
      alt: 'Test Photo 1',
      category: 'Test',
      isVisible: 1,
      sortOrder: 1,
    });
    const photo1Id = photo1!.id;

    const photo2 = await db.createPhoto({
      src: 'https://example.com/photo2.jpg',
      alt: 'Test Photo 2',
      category: 'Test',
      isVisible: 1,
      sortOrder: 2,
    });
    const photo2Id = photo2!.id;

    // Create two test projects
    const project1 = await db.createProject({
      title: 'Test Project 1',
      slug: `test-project-1-empty-${timestamp}`,
      description: 'Test Description 1',
      isVisible: 1,
      sortOrder: 1,
    });
    const project1Id = project1!.id;

    const project2 = await db.createProject({
      title: 'Test Project 2',
      slug: `test-project-2-empty-${timestamp}`,
      description: 'Test Description 2',
      isVisible: 1,
      sortOrder: 2,
    });
    const project2Id = project2!.id;

    // Assign both photos to project1
    await db.addPhotoToProject(photo1Id, project1Id);
    await db.addPhotoToProject(photo2Id, project1Id);

    // Get available photos for project2
    const availablePhotos = await caller.projects.getAvailablePhotos({ projectId: project2Id });

    // Should not include the photos assigned to project1
    expect(availablePhotos.some(p => p.id === photo1Id)).toBe(false);
    expect(availablePhotos.some(p => p.id === photo2Id)).toBe(false);

    // Cleanup
    await db.removePhotoFromProject(photo1Id, project1Id);
    await db.removePhotoFromProject(photo2Id, project1Id);
    await db.deletePhoto(photo1Id);
    await db.deletePhoto(photo2Id);
    await db.deleteProject(project1Id);
    await db.deleteProject(project2Id);
  });

  it('should handle complex scenario with multiple projects and photos', { timeout: 10000 }, async () => {
    // Create test photos
    const photo1 = await db.createPhoto({
      src: 'https://example.com/photo1.jpg',
      alt: 'Test Photo 1',
      category: 'Test',
      isVisible: 1,
      sortOrder: 1,
    });
    const photo1Id = photo1!.id;

    const photo2 = await db.createPhoto({
      src: 'https://example.com/photo2.jpg',
      alt: 'Test Photo 2',
      category: 'Test',
      isVisible: 1,
      sortOrder: 2,
    });
    const photo2Id = photo2!.id;

    const photo3 = await db.createPhoto({
      src: 'https://example.com/photo3.jpg',
      alt: 'Test Photo 3',
      category: 'Test',
      isVisible: 1,
      sortOrder: 3,
    });
    const photo3Id = photo3!.id;

    // Create three test projects
    const project1 = await db.createProject({
      title: 'Test Project 1',
      slug: `test-project-1-complex-${timestamp}`,
      description: 'Test Description 1',
      isVisible: 1,
      sortOrder: 1,
    });
    const project1Id = project1!.id;

    const project2 = await db.createProject({
      title: 'Test Project 2',
      slug: `test-project-2-complex-${timestamp}`,
      description: 'Test Description 2',
      isVisible: 1,
      sortOrder: 2,
    });
    const project2Id = project2!.id;

    const project3 = await db.createProject({
      title: 'Test Project 3',
      slug: `test-project-3-complex-${timestamp}`,
      description: 'Test Description 3',
      isVisible: 1,
      sortOrder: 3,
    });
    const project3Id = project3!.id;

    // Assign photo1 to project1
    await db.addPhotoToProject(photo1Id, project1Id);
    
    // Assign photo2 to project2
    await db.addPhotoToProject(photo2Id, project2Id);
    
    // photo3 is not assigned to any project

    // Get available photos for project3
    const availablePhotos = await caller.projects.getAvailablePhotos({ projectId: project3Id });

    // photo1 should NOT be available (assigned to project1)
    expect(availablePhotos.some(p => p.id === photo1Id)).toBe(false);
    
    // photo2 should NOT be available (assigned to project2)
    expect(availablePhotos.some(p => p.id === photo2Id)).toBe(false);
    
    // photo3 should be available (not assigned to any project)
    expect(availablePhotos.some(p => p.id === photo3Id)).toBe(true);

    // Cleanup
    await db.removePhotoFromProject(photo1Id, project1Id);
    await db.removePhotoFromProject(photo2Id, project2Id);
    await db.deletePhoto(photo1Id);
    await db.deletePhoto(photo2Id);
    await db.deletePhoto(photo3Id);
    await db.deleteProject(project1Id);
    await db.deleteProject(project2Id);
    await db.deleteProject(project3Id);
  });
});
