import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

// Mock user contexts
const adminUser = { id: 1, openId: "admin-123", role: "admin" as const, name: "Admin", email: "admin@test.com" };
const regularUser = { id: 2, openId: "user-456", role: "user" as const, name: "User", email: "user@test.com" };

// Create test callers
const createCaller = (user: typeof adminUser | typeof regularUser | null) => {
  return appRouter.createCaller({
    user: user as any,
    req: {} as any,
    res: {} as any,
  });
};

describe("Testimonials API", () => {
  describe("testimonials.list (Public)", () => {
    it("should return visible testimonials", async () => {
      const caller = createCaller(null); // Public access
      const testimonials = await caller.testimonials.list();
      
      expect(Array.isArray(testimonials)).toBe(true);
      // All returned testimonials should be visible
      testimonials.forEach((t) => {
        expect(t.isVisible).toBe(1);
      });
    });
  });

  describe("testimonials.listAll (Admin)", () => {
    it("should return all testimonials for admin", async () => {
      const caller = createCaller(adminUser);
      const testimonials = await caller.testimonials.listAll();
      
      expect(Array.isArray(testimonials)).toBe(true);
    });

    it("should throw error for non-admin users", async () => {
      const caller = createCaller(regularUser);
      
      await expect(caller.testimonials.listAll()).rejects.toThrow("Unauthorized");
    });

    it("should throw error for unauthenticated users", async () => {
      const caller = createCaller(null);
      
      await expect(caller.testimonials.listAll()).rejects.toThrow();
    });
  });

  describe("testimonials.create (Admin)", () => {
    it("should create a new testimonial with valid data", async () => {
      const caller = createCaller(adminUser);
      
      const newTestimonial = await caller.testimonials.create({
        clientName: "測試客戶",
        clientTitle: "新娘",
        content: "非常滿意的拍攝體驗！",
        rating: 5,
        isVisible: 1,
        sortOrder: 0,
      });

      expect(newTestimonial).toBeDefined();
      expect(newTestimonial?.clientName).toBe("測試客戶");
      expect(newTestimonial?.rating).toBe(5);

      // Cleanup
      if (newTestimonial) {
        await db.deleteTestimonial(newTestimonial.id);
      }
    });

    it("should reject empty client name", async () => {
      const caller = createCaller(adminUser);
      
      await expect(
        caller.testimonials.create({
          clientName: "",
          content: "測試內容",
          rating: 5,
        })
      ).rejects.toThrow();
    });

    it("should reject empty content", async () => {
      const caller = createCaller(adminUser);
      
      await expect(
        caller.testimonials.create({
          clientName: "測試客戶",
          content: "",
          rating: 5,
        })
      ).rejects.toThrow();
    });

    it("should reject invalid rating (too low)", async () => {
      const caller = createCaller(adminUser);
      
      await expect(
        caller.testimonials.create({
          clientName: "測試客戶",
          content: "測試內容",
          rating: 0,
        })
      ).rejects.toThrow();
    });

    it("should reject invalid rating (too high)", async () => {
      const caller = createCaller(adminUser);
      
      await expect(
        caller.testimonials.create({
          clientName: "測試客戶",
          content: "測試內容",
          rating: 6,
        })
      ).rejects.toThrow();
    });

    it("should throw error for non-admin users", async () => {
      const caller = createCaller(regularUser);
      
      await expect(
        caller.testimonials.create({
          clientName: "測試客戶",
          content: "測試內容",
          rating: 5,
        })
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("testimonials.update (Admin)", () => {
    it("should update an existing testimonial", async () => {
      const caller = createCaller(adminUser);
      
      // Create a test testimonial
      const created = await caller.testimonials.create({
        clientName: "原始客戶",
        content: "原始內容",
        rating: 4,
      });

      expect(created).toBeDefined();
      if (!created) return;

      // Update the testimonial
      const updated = await caller.testimonials.update({
        id: created.id,
        clientName: "更新後客戶",
        content: "更新後內容",
        rating: 5,
      });

      expect(updated?.clientName).toBe("更新後客戶");
      expect(updated?.content).toBe("更新後內容");
      expect(updated?.rating).toBe(5);

      // Cleanup
      await db.deleteTestimonial(created.id);
    });

    it("should throw error for non-admin users", async () => {
      const caller = createCaller(regularUser);
      
      await expect(
        caller.testimonials.update({
          id: 1,
          clientName: "測試",
        })
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("testimonials.delete (Admin)", () => {
    it("should delete an existing testimonial", async () => {
      const caller = createCaller(adminUser);
      
      // Create a test testimonial
      const created = await caller.testimonials.create({
        clientName: "待刪除客戶",
        content: "待刪除內容",
        rating: 5,
      });

      expect(created).toBeDefined();
      if (!created) return;

      // Delete the testimonial
      const result = await caller.testimonials.delete({ id: created.id });
      expect(result.success).toBe(true);

      // Verify deletion
      const testimonial = await db.getTestimonialById(created.id);
      expect(testimonial).toBeUndefined();
    });

    it("should throw error for non-admin users", async () => {
      const caller = createCaller(regularUser);
      
      await expect(
        caller.testimonials.delete({ id: 1 })
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("testimonials.updateVisibility (Admin)", () => {
    it("should toggle testimonial visibility", async () => {
      const caller = createCaller(adminUser);
      
      // Create a visible testimonial
      const created = await caller.testimonials.create({
        clientName: "測試客戶",
        content: "測試內容",
        rating: 5,
        isVisible: 1,
      });

      expect(created).toBeDefined();
      if (!created) return;

      // Hide the testimonial
      const hidden = await caller.testimonials.updateVisibility({
        id: created.id,
        isVisible: 0,
      });
      expect(hidden?.isVisible).toBe(0);

      // Show the testimonial again
      const visible = await caller.testimonials.updateVisibility({
        id: created.id,
        isVisible: 1,
      });
      expect(visible?.isVisible).toBe(1);

      // Cleanup
      await db.deleteTestimonial(created.id);
    });

    it("should throw error for non-admin users", async () => {
      const caller = createCaller(regularUser);
      
      await expect(
        caller.testimonials.updateVisibility({
          id: 1,
          isVisible: 0,
        })
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("testimonials.reorder (Admin)", () => {
    it("should reorder multiple testimonials", async () => {
      const caller = createCaller(adminUser);
      
      // Create test testimonials
      const t1 = await caller.testimonials.create({
        clientName: "客戶1",
        content: "內容1",
        rating: 5,
        sortOrder: 0,
      });
      const t2 = await caller.testimonials.create({
        clientName: "客戶2",
        content: "內容2",
        rating: 5,
        sortOrder: 1,
      });

      expect(t1 && t2).toBeTruthy();
      if (!t1 || !t2) return;

      // Reorder
      const result = await caller.testimonials.reorder({
        updates: [
          { id: t1.id, sortOrder: 1 },
          { id: t2.id, sortOrder: 0 },
        ],
      });
      expect(result.success).toBe(true);

      // Verify new order
      const updated1 = await db.getTestimonialById(t1.id);
      const updated2 = await db.getTestimonialById(t2.id);
      expect(updated1?.sortOrder).toBe(1);
      expect(updated2?.sortOrder).toBe(0);

      // Cleanup
      await db.deleteTestimonial(t1.id);
      await db.deleteTestimonial(t2.id);
    });

    it("should throw error for non-admin users", async () => {
      const caller = createCaller(regularUser);
      
      await expect(
        caller.testimonials.reorder({
          updates: [{ id: 1, sortOrder: 0 }],
        })
      ).rejects.toThrow("Unauthorized");
    });
  });
});
