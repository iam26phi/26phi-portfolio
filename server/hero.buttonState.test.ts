import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";

describe("Hero Carousel Button State - UX Optimization", () => {
  const caller = appRouter.createCaller({
    user: { id: 1, role: "admin" as const },
  });

  let testPhotoId: number;
  let testSlideId: number;

  beforeAll(async () => {
    // Create a test photo
    const photo = await caller.photos.create({
      src: "/test-button-state-photo.jpg",
      alt: "Test Button State Photo",
      slug: `test-button-state-${Date.now()}`,
      category: "portrait",
      displayTitle: "Button State Test",
      isVisible: 1,
      sortOrder: 0,
    });
    testPhotoId = photo.id;
  });

  afterAll(async () => {
    // Cleanup
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

  it("should track carousel state correctly", async () => {
    // Initially, photo should not be in carousel
    const slidesBefore = await caller.hero.listAllSlides();
    const isInCarouselBefore = slidesBefore.some(
      (slide) => slide.imageUrl === "/test-button-state-photo.jpg"
    );
    expect(isInCarouselBefore).toBe(false);

    // Add photo to carousel
    const result = await caller.hero.addSlideFromPhoto({
      photoId: testPhotoId,
    });
    testSlideId = result.id;

    // After adding, photo should be in carousel
    const slidesAfter = await caller.hero.listAllSlides();
    const isInCarouselAfter = slidesAfter.some(
      (slide) => slide.imageUrl === "/test-button-state-photo.jpg"
    );
    expect(isInCarouselAfter).toBe(true);
  });

  it("should prevent duplicate addition with proper error message", async () => {
    // Try to add the same photo again
    await expect(
      caller.hero.addSlideFromPhoto({
        photoId: testPhotoId,
      })
    ).rejects.toThrow("already in carousel");
  });

  it("should maintain carousel state after refetch", async () => {
    // Simulate refetch by querying slides again
    const slides = await caller.hero.listAllSlides();
    const foundSlide = slides.find((slide) => slide.id === testSlideId);

    expect(foundSlide).toBeDefined();
    expect(foundSlide!.imageUrl).toBe("/test-button-state-photo.jpg");
    expect(foundSlide!.isActive).toBe(1);
  });

  it("should handle button state transitions correctly", async () => {
    // Create another test photo to simulate state transition
    const photo2 = await caller.photos.create({
      src: "/test-button-transition.jpg",
      alt: "Test Button Transition",
      slug: `test-button-transition-${Date.now()}`,
      category: "portrait",
      isVisible: 1,
      sortOrder: 0,
    });

    // State 1: Not in carousel (button should be enabled)
    const slidesBefore = await caller.hero.listAllSlides();
    const isInCarouselBefore = slidesBefore.some(
      (slide) => slide.imageUrl === "/test-button-transition.jpg"
    );
    expect(isInCarouselBefore).toBe(false);

    // State 2: Add to carousel (button should show loading then disabled)
    const addResult = await caller.hero.addSlideFromPhoto({
      photoId: photo2.id,
    });

    // State 3: After adding (button should be disabled)
    const slidesAfter = await caller.hero.listAllSlides();
    const isInCarouselAfter = slidesAfter.some(
      (slide) => slide.imageUrl === "/test-button-transition.jpg"
    );
    expect(isInCarouselAfter).toBe(true);

    // Cleanup
    await caller.hero.deleteSlide(addResult.id);
    await caller.photos.delete({ id: photo2.id });
  });

  it("should provide correct button states for multiple photos", async () => {
    // Get all slides
    const slides = await caller.hero.listAllSlides();
    const carouselUrls = new Set(slides.map((slide) => slide.imageUrl));

    // Test photo should be in carousel
    expect(carouselUrls.has("/test-button-state-photo.jpg")).toBe(true);

    // Non-existent photo should not be in carousel
    expect(carouselUrls.has("/non-existent-photo.jpg")).toBe(false);
  });
});
