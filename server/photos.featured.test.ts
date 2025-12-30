import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";

describe("Photos Featured Functionality", () => {
  const caller = appRouter.createCaller({
    user: { id: 1, role: "admin" as const },
  });

  let testPhotoId: number;

  beforeAll(async () => {
    // Create a test photo using API
    const result = await caller.photos.create({
      src: "/test-featured.jpg",
      alt: "Test Featured Photo",
      slug: `test-featured-${Date.now()}`,
      category: "portrait",
      isVisible: 1,
      sortOrder: 0,
    });
    testPhotoId = result.id;
  });

  afterAll(async () => {
    // Cleanup
    if (testPhotoId) {
      await caller.photos.delete({ id: testPhotoId });
    }
  });

  it("should create photo with featured=0 by default", async () => {
    const allPhotos = await caller.photos.listAll();
    const testPhoto = allPhotos.find((p) => p.id === testPhotoId);
    expect(testPhoto).toBeDefined();
    expect(testPhoto?.featured).toBe(0);
  });

  it("should update photo to featured=1", async () => {
    await caller.photos.update({
      id: testPhotoId,
      featured: 1,
    });

    const allPhotos = await caller.photos.listAll();
    const testPhoto = allPhotos.find((p) => p.id === testPhotoId);
    expect(testPhoto?.featured).toBe(1);
  });

  it("should update photo back to featured=0", async () => {
    await caller.photos.update({
      id: testPhotoId,
      featured: 0,
    });

    const allPhotos = await caller.photos.listAll();
    const testPhoto = allPhotos.find((p) => p.id === testPhotoId);
    expect(testPhoto?.featured).toBe(0);
  });

  it("should list featured photos correctly", async () => {
    // Set photo as featured
    await caller.photos.update({
      id: testPhotoId,
      featured: 1,
    });

    const allPhotos = await caller.photos.listAll();
    const featuredPhotos = allPhotos.filter((p) => p.featured === 1);
    
    expect(featuredPhotos.length).toBeGreaterThan(0);
    expect(featuredPhotos.some((p) => p.id === testPhotoId)).toBe(true);
  });

  it("should maintain featured status after other updates", async () => {
    // Set as featured
    await caller.photos.update({
      id: testPhotoId,
      featured: 1,
    });

    // Update other fields
    await caller.photos.update({
      id: testPhotoId,
      location: "Test Location",
      description: "Test Description",
    });

    const allPhotos = await caller.photos.listAll();
    const testPhoto = allPhotos.find((p) => p.id === testPhotoId);
    expect(testPhoto?.featured).toBe(1);
    expect(testPhoto?.location).toBe("Test Location");
  });
});
