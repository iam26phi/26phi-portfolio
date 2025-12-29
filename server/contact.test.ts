import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import type { inferProcedureInput } from "@trpc/server";
import type { AppRouter } from "./routers";

describe("Contact Form System", () => {
  const adminCaller = appRouter.createCaller({
    user: { id: 1, openId: "admin-test", name: "Admin", role: "admin" },
  });

  const publicCaller = appRouter.createCaller({
    user: null,
  });

  let testSubmissionId: number;

  // Clean up test data before and after tests
  beforeAll(async () => {
    const db = await getDb();
    if (db) {
      await db.execute("DELETE FROM contact_submissions WHERE email LIKE '%test@example.com%'");
    }
  });

  afterAll(async () => {
    const db = await getDb();
    if (db) {
      await db.execute("DELETE FROM contact_submissions WHERE email LIKE '%test@example.com%'");
    }
  });

  describe("Public Contact Form Submission", () => {
    it("should allow public users to submit contact form", async () => {
      type CreateInput = inferProcedureInput<AppRouter["contact"]["create"]>;
      const input: CreateInput = {
        name: "測試客戶",
        email: "test@example.com",
        shootingType: "portrait",
        budget: "NT$ 10,000 - 20,000",
        message: "我想預約人像攝影，請問有空檔嗎？",
      };

      const result = await publicCaller.contact.create(input);

      expect(result).toBeDefined();
      expect(result.id).toBeTypeOf("number");
      expect(result.name).toBe(input.name);
      expect(result.email).toBe(input.email);
      expect(result.shootingType).toBe(input.shootingType);
      expect(result.budget).toBe(input.budget);
      expect(result.message).toBe(input.message);
      expect(result.status).toBe("new");

      testSubmissionId = result.id;
    });

    it("should validate required fields", async () => {
      type CreateInput = inferProcedureInput<AppRouter["contact"]["create"]>;
      const invalidInput: CreateInput = {
        name: "",
        email: "invalid-email",
        shootingType: "portrait",
        budget: "NT$ 10,000 - 20,000",
        message: "",
      };

      await expect(publicCaller.contact.create(invalidInput)).rejects.toThrow();
    });

    it("should validate email format", async () => {
      type CreateInput = inferProcedureInput<AppRouter["contact"]["create"]>;
      const invalidInput: CreateInput = {
        name: "測試客戶",
        email: "not-an-email",
        shootingType: "portrait",
        budget: "NT$ 10,000 - 20,000",
        message: "測試訊息，這是一個測試訊息",
      };

      await expect(publicCaller.contact.create(invalidInput)).rejects.toThrow();
    });
  });

  describe("Admin Contact Management", () => {
    it("should allow admin to list all submissions", async () => {
      const submissions = await adminCaller.contact.listAll();

      expect(Array.isArray(submissions)).toBe(true);
      expect(submissions.length).toBeGreaterThan(0);
      
      const testSubmission = submissions.find(s => s.id === testSubmissionId);
      expect(testSubmission).toBeDefined();
      expect(testSubmission?.name).toBe("測試客戶");
    });

    it("should allow admin to get submission by id", async () => {
      const submission = await adminCaller.contact.getById(testSubmissionId);

      expect(submission).toBeDefined();
      expect(submission.id).toBe(testSubmissionId);
      expect(submission.name).toBe("測試客戶");
      expect(submission.email).toBe("test@example.com");
    });

    it("should allow admin to update submission status", async () => {
      type UpdateStatusInput = inferProcedureInput<AppRouter["contact"]["updateStatus"]>;
      const input: UpdateStatusInput = {
        id: testSubmissionId,
        status: "read",
      };

      const result = await adminCaller.contact.updateStatus(input);

      expect(result).toBeDefined();
      expect(result.id).toBe(testSubmissionId);
      expect(result.status).toBe("read");

      // Verify status was updated
      const updated = await adminCaller.contact.getById(testSubmissionId);
      expect(updated.status).toBe("read");
    });

    it("should allow admin to update status to replied", async () => {
      type UpdateStatusInput = inferProcedureInput<AppRouter["contact"]["updateStatus"]>;
      const input: UpdateStatusInput = {
        id: testSubmissionId,
        status: "replied",
      };

      const result = await adminCaller.contact.updateStatus(input);
      expect(result.status).toBe("replied");
    });

    it("should allow admin to update status to archived", async () => {
      type UpdateStatusInput = inferProcedureInput<AppRouter["contact"]["updateStatus"]>;
      const input: UpdateStatusInput = {
        id: testSubmissionId,
        status: "archived",
      };

      const result = await adminCaller.contact.updateStatus(input);
      expect(result.status).toBe("archived");
    });

    it("should allow admin to delete submission", async () => {
      // Create a new submission to delete
      type CreateInput = inferProcedureInput<AppRouter["contact"]["create"]>;
      const newSubmission = await publicCaller.contact.create({
        name: "待刪除測試",
        email: "delete-test@example.com",
        shootingType: "wedding",
        budget: "NT$ 30,000+",
        message: "這是一個測試提交，將被刪除",
      });

      // Delete the submission
      const result = await adminCaller.contact.delete(newSubmission.id);
      expect(result.success).toBe(true);

      // Verify it was deleted
      await expect(adminCaller.contact.getById(newSubmission.id)).rejects.toThrow();
    });
  });

  describe("Permission Control", () => {
    it("should prevent non-admin users from listing all submissions", async () => {
      const userCaller = appRouter.createCaller({
        user: { id: 2, openId: "user-test", name: "Regular User", role: "user" },
      });

      await expect(userCaller.contact.listAll()).rejects.toThrow();
    });

    it("should prevent non-admin users from updating submission status", async () => {
      const userCaller = appRouter.createCaller({
        user: { id: 2, openId: "user-test", name: "Regular User", role: "user" },
      });

      type UpdateStatusInput = inferProcedureInput<AppRouter["contact"]["updateStatus"]>;
      const input: UpdateStatusInput = {
        id: testSubmissionId,
        status: "read",
      };

      await expect(userCaller.contact.updateStatus(input)).rejects.toThrow();
    });

    it("should prevent non-admin users from deleting submissions", async () => {
      const userCaller = appRouter.createCaller({
        user: { id: 2, openId: "user-test", name: "Regular User", role: "user" },
      });

      await expect(userCaller.contact.delete(testSubmissionId)).rejects.toThrow();
    });

    it("should prevent unauthenticated users from accessing admin endpoints", async () => {
      await expect(publicCaller.contact.listAll()).rejects.toThrow();
      await expect(publicCaller.contact.getById(testSubmissionId)).rejects.toThrow();
      await expect(publicCaller.contact.delete(testSubmissionId)).rejects.toThrow();
    });
  });

  describe("Data Validation", () => {
    it("should accept all valid shooting types", async () => {
      const shootingTypes = ["portrait", "wedding", "commercial", "event", "product", "other"];

      for (const type of shootingTypes) {
        type CreateInput = inferProcedureInput<AppRouter["contact"]["create"]>;
        const input: CreateInput = {
          name: `測試 ${type}`,
          email: `test-${type}@example.com`,
          shootingType: type as any,
          budget: "NT$ 10,000 - 20,000",
          message: `測試 ${type} 拍攝，這是一個測試訊息`,
        };

        const result = await publicCaller.contact.create(input);
        expect(result.shootingType).toBe(type);

        // Clean up
        await adminCaller.contact.delete(result.id);
      }
    });

    it("should handle long messages", async () => {
      const longMessage = "測試訊息 ".repeat(100);

      type CreateInput = inferProcedureInput<AppRouter["contact"]["create"]>;
      const input: CreateInput = {
        name: "長訊息測試",
        email: "long-message-test@example.com",
        shootingType: "portrait",
        budget: "NT$ 10,000 - 20,000",
        message: longMessage,
      };

      const result = await publicCaller.contact.create(input);
      expect(result.message).toBe(longMessage);

      // Clean up
      await adminCaller.contact.delete(result.id);
    });

    it("should handle special characters in name and message", async () => {
      type CreateInput = inferProcedureInput<AppRouter["contact"]["create"]>;
      const input: CreateInput = {
        name: "測試客戶 <script>alert('test')</script>",
        email: "special-chars-test@example.com",
        shootingType: "portrait",
        budget: "NT$ 10,000 - 20,000",
        message: "訊息包含特殊字符：<>&\"'",
      };

      const result = await publicCaller.contact.create(input);
      expect(result.name).toBe(input.name);
      expect(result.message).toBe(input.message);

      // Clean up
      await adminCaller.contact.delete(result.id);
    });
  });

  describe("Timestamp Handling", () => {
    it("should set createdAt and updatedAt timestamps", async () => {
      type CreateInput = inferProcedureInput<AppRouter["contact"]["create"]>;
      const input: CreateInput = {
        name: "時間戳記測試",
        email: "timestamp-test@example.com",
        shootingType: "portrait",
        budget: "NT$ 10,000 - 20,000",
        message: "測試時間戳記，這是一個測試訊息",
      };

      const result = await publicCaller.contact.create(input);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
      expect(result.updatedAt.getTime()).toBeLessThanOrEqual(Date.now());

      // Clean up
      await adminCaller.contact.delete(result.id);
    });

    it("should update updatedAt when status changes", async () => {
      type CreateInput = inferProcedureInput<AppRouter["contact"]["create"]>;
      const submission = await publicCaller.contact.create({
        name: "更新時間測試",
        email: "update-time-test@example.com",
        shootingType: "portrait",
        budget: "NT$ 10,000 - 20,000",
        message: "測試更新時間，這是一個測試訊息",
      });

      const originalUpdatedAt = submission.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1000));

      type UpdateStatusInput = inferProcedureInput<AppRouter["contact"]["updateStatus"]>;
      const updated = await adminCaller.contact.updateStatus({
        id: submission.id,
        status: "read",
      });

      expect(updated.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());

      // Clean up
      await adminCaller.contact.delete(submission.id);
    });
  });
});
