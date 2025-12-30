import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Photos Enhanced Fields", () => {
  let testPhotoId: number;
  let testCollaboratorId: number;

  const caller = appRouter.createCaller({
    req: {} as any,
    res: {} as any,
    user: { id: 1, openId: "test-admin", role: "admin" } as any,
  });

  beforeAll(async () => {
    // Create a test collaborator with unique slug
    const timestamp = Date.now();
    const collaborator = await db.createCollaborator({
      name: "Test Collaborator Enhanced",
      slug: `test-collab-enhanced-${timestamp}`,
      instagram: "@testcollab",
      bio: "Test bio",
      avatarUrl: "https://example.com/avatar.jpg",
      email: `test-enhanced-${timestamp}@example.com`,
      phone: "1234567890",
      website: "https://example.com",
      isVisible: 1,
      sortOrder: 0,
    });
    testCollaboratorId = collaborator.insertId;
  });

  afterAll(async () => {
    // Cleanup
    if (testPhotoId) {
      try {
        await caller.photos.delete({ id: testPhotoId });
      } catch (e) {
        // Ignore errors during cleanup
      }
    }
    if (testCollaboratorId) {
      try {
        await db.deleteCollaborator(testCollaboratorId);
      } catch (e) {
        // Ignore errors during cleanup
      }
    }
  });

  it("should create photo with all enhanced fields", async () => {
    const result = await caller.photos.create({
      src: "https://example.com/test-enhanced.jpg",
      alt: "IMG_TEST_ENHANCED",
      displayTitle: "台北街頭 / Taipei Street",
      category: "Portrait",
      collaboratorId: testCollaboratorId,
      location: "台北",
      date: "2024-01-15",
      description: "Test description",
      camera: "Sony A1ii",
      lens: "Sony 35mm f/1.4 GM",
      settings: "ISO 400, f/1.4, 1/200s",
      isVisible: 1,
      sortOrder: 0,
    });

    expect(result).toBeDefined();
    testPhotoId = result.insertId;
    expect(testPhotoId).toBeGreaterThan(0);
  });

  it("should retrieve photo with all enhanced fields", async () => {
    const photo = await db.getPhotoById(testPhotoId);
    
    expect(photo).toBeDefined();
    expect(photo?.displayTitle).toBe("台北街頭 / Taipei Street");
    expect(photo?.camera).toBe("Sony A1ii");
    expect(photo?.lens).toBe("Sony 35mm f/1.4 GM");
    expect(photo?.settings).toBe("ISO 400, f/1.4, 1/200s");
  });

  it("should update photo displayTitle", async () => {
    await caller.photos.update({
      id: testPhotoId,
      displayTitle: "東京夜景 / Tokyo Night",
    });

    const photo = await db.getPhotoById(testPhotoId);
    expect(photo?.displayTitle).toBe("東京夜景 / Tokyo Night");
  });

  it("should update photo gear information", async () => {
    await caller.photos.update({
      id: testPhotoId,
      camera: "Canon R5",
      lens: "Canon RF 50mm f/1.2",
      settings: "ISO 800, f/1.2, 1/125s",
    });

    const photo = await db.getPhotoById(testPhotoId);
    expect(photo?.camera).toBe("Canon R5");
    expect(photo?.lens).toBe("Canon RF 50mm f/1.2");
    expect(photo?.settings).toBe("ISO 800, f/1.2, 1/125s");
  });

  it("should retrieve visible photos with collaborator info", async () => {
    const photos = await db.getVisiblePhotos();
    
    const testPhoto = photos.find((p: any) => p.id === testPhotoId);
    expect(testPhoto).toBeDefined();
    expect(testPhoto?.displayTitle).toBe("東京夜景 / Tokyo Night");
    expect(testPhoto?.collaboratorName).toBe("Test Collaborator Enhanced");
    expect(testPhoto?.collaboratorInstagram).toBe("@testcollab");
    expect(testPhoto?.camera).toBe("Canon R5");
    expect(testPhoto?.lens).toBe("Canon RF 50mm f/1.2");
  });
});
