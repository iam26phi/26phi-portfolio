import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("photos.uploadAvatar", () => {
  const adminUser = {
    openId: "admin-123",
    name: "Admin User",
    email: "admin@test.com",
    role: "admin" as const,
  };

  const regularUser = {
    openId: "user-123",
    name: "Regular User",
    email: "user@test.com",
    role: "user" as const,
  };

  const createMockContext = (user: typeof adminUser | typeof regularUser | null) => ({
    user,
    req: {} as any,
    res: {} as any,
  });

  const createCaller = (ctx: any) => appRouter.createCaller(ctx);

  // Helper function to create a simple base64 image
  const createTestBase64Image = () => {
    // 1x1 transparent PNG
    const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    return `data:image/png;base64,${base64}`;
  };

  describe("Authorization", () => {
    it("should allow admin to upload avatar", async () => {
      const caller = createCaller(createMockContext(adminUser));
      
      const result = await caller.photos.uploadAvatar({
        file: createTestBase64Image(),
        filename: "test-avatar.png",
        category: "collaborators",
      });

      expect(result.success).toBe(true);
      expect(result.url).toBeDefined();
      expect(result.key).toBeDefined();
      expect(result.key).toContain("avatars/collaborators/");
    });

    it("should reject regular user from uploading avatar", async () => {
      const caller = createCaller(createMockContext(regularUser));
      
      await expect(
        caller.photos.uploadAvatar({
          file: createTestBase64Image(),
          filename: "test-avatar.png",
          category: "collaborators",
        })
      ).rejects.toThrow("Unauthorized");
    });

    it("should reject unauthenticated user from uploading avatar", async () => {
      const caller = createCaller(createMockContext(null));
      
      await expect(
        caller.photos.uploadAvatar({
          file: createTestBase64Image(),
          filename: "test-avatar.png",
          category: "collaborators",
        })
      ).rejects.toThrow();
    });
  });

  describe("File Upload", () => {
    it("should upload avatar to correct S3 path", async () => {
      const caller = createCaller(createMockContext(adminUser));
      
      const result = await caller.photos.uploadAvatar({
        file: createTestBase64Image(),
        filename: "collaborator-avatar.png",
        category: "collaborators",
      });

      expect(result.key).toMatch(/^avatars\/collaborators\/\d+-collaborator-avatar\.png$/);
      expect(result.url).toContain(result.key);
    });

    it("should support different categories", async () => {
      const caller = createCaller(createMockContext(adminUser));
      
      const result1 = await caller.photos.uploadAvatar({
        file: createTestBase64Image(),
        filename: "test.png",
        category: "collaborators",
      });
      expect(result1.key).toContain("avatars/collaborators/");

      const result2 = await caller.photos.uploadAvatar({
        file: createTestBase64Image(),
        filename: "test.png",
        category: "about",
      });
      expect(result2.key).toContain("avatars/about/");
    });

    it("should handle different file extensions", async () => {
      const caller = createCaller(createMockContext(adminUser));
      
      const extensions = ["jpg", "jpeg", "png", "gif"];
      
      for (const ext of extensions) {
        const result = await caller.photos.uploadAvatar({
          file: createTestBase64Image(),
          filename: `test-avatar.${ext}`,
          category: "collaborators",
        });

        expect(result.key).toContain(`.${ext}`);
      }
    });

    it("should generate unique filenames with timestamp", async () => {
      const caller = createCaller(createMockContext(adminUser));
      
      const result1 = await caller.photos.uploadAvatar({
        file: createTestBase64Image(),
        filename: "avatar.png",
        category: "collaborators",
      });

      // Wait a tiny bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      const result2 = await caller.photos.uploadAvatar({
        file: createTestBase64Image(),
        filename: "avatar.png",
        category: "collaborators",
      });

      expect(result1.key).not.toBe(result2.key);
      expect(result1.url).not.toBe(result2.url);
    });
  });

  describe("Data Format", () => {
    it("should accept base64 with data URI prefix", async () => {
      const caller = createCaller(createMockContext(adminUser));
      
      const result = await caller.photos.uploadAvatar({
        file: createTestBase64Image(),
        filename: "test.png",
        category: "collaborators",
      });

      expect(result.success).toBe(true);
    });

    it("should handle special characters in filename", async () => {
      const caller = createCaller(createMockContext(adminUser));
      
      const result = await caller.photos.uploadAvatar({
        file: createTestBase64Image(),
        filename: "測試-頭像 (1).png",
        category: "collaborators",
      });

      expect(result.success).toBe(true);
      expect(result.key).toBeDefined();
    });
  });

  describe("Response Format", () => {
    it("should return correct response structure", async () => {
      const caller = createCaller(createMockContext(adminUser));
      
      const result = await caller.photos.uploadAvatar({
        file: createTestBase64Image(),
        filename: "test.png",
        category: "collaborators",
      });

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("url");
      expect(result).toHaveProperty("key");
      expect(typeof result.success).toBe("boolean");
      expect(typeof result.url).toBe("string");
      expect(typeof result.key).toBe("string");
    });
  });
});
