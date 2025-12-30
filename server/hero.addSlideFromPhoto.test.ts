import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";

describe("Hero Carousel - Add Slide From Photo", () => {
  const caller = appRouter.createCaller({
    user: { id: 1, role: "admin" as const },
  });

  let testPhotoId: number;
  let testSlideId: number;

  beforeAll(async () => {
    // Create a test photo
    const photo = await caller.photos.create({
      src: "/test-carousel-photo.jpg",
      alt: "Test Carousel Photo",
      slug: `test-carousel-${Date.now()}`,
      category: "portrait",
      displayTitle: "Beautiful Sunset",
      isVisible: 1,
      sortOrder: 0,
    });
    testPhotoId = photo.id;
  });

  afterAll(async () => {
    // Cleanup: delete test slide and photo
    if (testSlideId) {
      try {
        await caller.hero.deleteSlide(testSlideId);
      } catch (e) {
        // Ignore if already deleted
      }
    }
    if (testPhotoId) {
      await caller.photos.delete({ id: testPhotoId });
    }
  });

  it("should add photo to carousel successfully", async () => {
    const result = await caller.hero.addSlideFromPhoto({
      photoId: testPhotoId,
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.imageUrl).toBe("/test-carousel-photo.jpg");
    expect(result.title).toBe("Beautiful Sunset");
    expect(result.isActive).toBe(1);
    expect(result.sortOrder).toBeGreaterThan(0);

    testSlideId = result.id;
  });

  it("should prevent duplicate photo in carousel", async () => {
    // Try to add the same photo again
    await expect(
      caller.hero.addSlideFromPhoto({
        photoId: testPhotoId,
      })
    ).rejects.toThrow("already in carousel");
  });

  it("should fail with non-existent photo", async () => {
    await expect(
      caller.hero.addSlideFromPhoto({
        photoId: 999999,
      })
    ).rejects.toThrow("Photo not found");
  });

  it("should auto-increment sortOrder correctly", async () => {
    // Create another test photo
    const photo2 = await caller.photos.create({
      src: "/test-carousel-photo-2.jpg",
      alt: "Test Carousel Photo 2",
      slug: `test-carousel-2-${Date.now()}`,
      category: "portrait",
      isVisible: 1,
      sortOrder: 0,
    });

    const result = await caller.hero.addSlideFromPhoto({
      photoId: photo2.id,
    });

    // Should have sortOrder greater than the first slide
    const allSlides = await caller.hero.listAllSlides();
    const firstSlide = allSlides.find((s) => s.id === testSlideId);
    const secondSlide = allSlides.find((s) => s.id === result.id);

    expect(secondSlide!.sortOrder).toBeGreaterThan(firstSlide!.sortOrder);

    // Cleanup
    await caller.hero.deleteSlide(result.id);
    await caller.photos.delete({ id: photo2.id });
  });

  it("should use alt text as title if displayTitle is not set", async () => {
    // Create a photo without displayTitle
    const photo3 = await caller.photos.create({
      src: "/test-carousel-photo-3.jpg",
      alt: "Fallback Title",
      slug: `test-carousel-3-${Date.now()}`,
      category: "portrait",
      isVisible: 1,
      sortOrder: 0,
    });

    const result = await caller.hero.addSlideFromPhoto({
      photoId: photo3.id,
    });

    expect(result.title).toBe("Fallback Title");

    // Cleanup
    await caller.hero.deleteSlide(result.id);
    await caller.photos.delete({ id: photo3.id });
  });
});
