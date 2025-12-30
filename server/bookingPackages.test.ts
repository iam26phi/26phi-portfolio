import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";

describe("Booking Packages Management", () => {
  const adminCaller = appRouter.createCaller({
    user: { id: 1, role: "admin" as const },
  });

  const publicCaller = appRouter.createCaller({
    user: null,
  });

  let testPackageId: number;

  beforeAll(async () => {
    // Create a test package
    const pkg = await adminCaller.bookingPackages.create({
      name: "測試方案",
      price: 3000,
      duration: 90,
      description: "這是一個測試方案",
      isActive: 1,
      sortOrder: 100,
    });
    testPackageId = pkg!.id;
  });

  afterAll(async () => {
    // Cleanup
    if (testPackageId) {
      try {
        await adminCaller.bookingPackages.delete(testPackageId);
      } catch (e) {
        // Ignore if already deleted
      }
    }
  });

  describe("Public API", () => {
    it("should list only active packages", async () => {
      const packages = await publicCaller.bookingPackages.list();
      
      expect(Array.isArray(packages)).toBe(true);
      // All returned packages should be active
      packages.forEach(pkg => {
        expect(pkg.isActive).toBe(1);
      });
    });

    it("should include default packages", async () => {
      const packages = await publicCaller.bookingPackages.list();
      
      // Should include the seeded packages
      const hasFirstShoot = packages.some(pkg => pkg.name === "每月第一組拍攝");
      const hasPortrait = packages.some(pkg => pkg.name === "人像拍攝");
      
      expect(hasFirstShoot).toBe(true);
      expect(hasPortrait).toBe(true);
    });
  });

  describe("Admin CRUD Operations", () => {
    it("should create a new package", async () => {
      const newPkg = await adminCaller.bookingPackages.create({
        name: "新測試方案",
        price: 5000,
        duration: 120,
        description: "新方案描述",
        isActive: 1,
        sortOrder: 200,
      });

      expect(newPkg).toBeDefined();
      expect(newPkg!.name).toBe("新測試方案");
      expect(newPkg!.price).toBe(5000);
      expect(newPkg!.duration).toBe(120);

      // Cleanup
      await adminCaller.bookingPackages.delete(newPkg!.id);
    });

    it("should update an existing package", async () => {
      const updated = await adminCaller.bookingPackages.update({
        id: testPackageId,
        name: "更新後的測試方案",
        price: 3500,
      });

      expect(updated).toBeDefined();
      expect(updated!.name).toBe("更新後的測試方案");
      expect(updated!.price).toBe(3500);
      // Duration should remain unchanged
      expect(updated!.duration).toBe(90);
    });

    it("should toggle package active status", async () => {
      // Disable the package
      await adminCaller.bookingPackages.update({
        id: testPackageId,
        isActive: 0,
      });

      const disabled = await adminCaller.bookingPackages.getById({ id: testPackageId });
      expect(disabled!.isActive).toBe(0);

      // Re-enable the package
      await adminCaller.bookingPackages.update({
        id: testPackageId,
        isActive: 1,
      });

      const enabled = await adminCaller.bookingPackages.getById({ id: testPackageId });
      expect(enabled!.isActive).toBe(1);
    });

    it("should list all packages for admin", async () => {
      const allPackages = await adminCaller.bookingPackages.listAll();
      
      expect(Array.isArray(allPackages)).toBe(true);
      expect(allPackages.length).toBeGreaterThan(0);
      
      // Should include both active and inactive packages
      const hasTestPackage = allPackages.some(pkg => pkg.id === testPackageId);
      expect(hasTestPackage).toBe(true);
    });

    it("should delete a package", async () => {
      // Create a temporary package
      const tempPkg = await adminCaller.bookingPackages.create({
        name: "臨時方案",
        price: 1000,
        duration: 30,
        isActive: 1,
        sortOrder: 300,
      });

      // Delete it
      await adminCaller.bookingPackages.delete(tempPkg!.id);

      // Verify it's deleted
      const deleted = await adminCaller.bookingPackages.getById({ id: tempPkg!.id });
      expect(deleted).toBeUndefined();
    });
  });

  describe("Sorting and Ordering", () => {
    it("should update package order", async () => {
      // Create two test packages
      const pkg1 = await adminCaller.bookingPackages.create({
        name: "排序測試 1",
        price: 1000,
        duration: 60,
        isActive: 1,
        sortOrder: 0,
      });

      const pkg2 = await adminCaller.bookingPackages.create({
        name: "排序測試 2",
        price: 2000,
        duration: 60,
        isActive: 1,
        sortOrder: 1,
      });

      // Update order
      await adminCaller.bookingPackages.updateOrder([
        { id: pkg1!.id, sortOrder: 10 },
        { id: pkg2!.id, sortOrder: 5 },
      ]);

      // Verify order
      const updated1 = await adminCaller.bookingPackages.getById({ id: pkg1!.id });
      const updated2 = await adminCaller.bookingPackages.getById({ id: pkg2!.id });

      expect(updated1!.sortOrder).toBe(10);
      expect(updated2!.sortOrder).toBe(5);

      // Cleanup
      await adminCaller.bookingPackages.delete(pkg1!.id);
      await adminCaller.bookingPackages.delete(pkg2!.id);
    });

    it("should return packages in sortOrder", async () => {
      const packages = await adminCaller.bookingPackages.listAll();
      
      // Verify packages are sorted by sortOrder
      for (let i = 1; i < packages.length; i++) {
        expect(packages[i].sortOrder).toBeGreaterThanOrEqual(packages[i - 1].sortOrder);
      }
    });
  });

  describe("Authorization", () => {
    it("should prevent non-admin from creating packages", async () => {
      const userCaller = appRouter.createCaller({
        user: { id: 2, role: "user" as const },
      });

      await expect(
        userCaller.bookingPackages.create({
          name: "未授權方案",
          price: 1000,
          duration: 60,
          isActive: 1,
          sortOrder: 0,
        })
      ).rejects.toThrow("Unauthorized");
    });

    it("should prevent non-admin from updating packages", async () => {
      const userCaller = appRouter.createCaller({
        user: { id: 2, role: "user" as const },
      });

      await expect(
        userCaller.bookingPackages.update({
          id: testPackageId,
          name: "未授權更新",
        })
      ).rejects.toThrow("Unauthorized");
    });

    it("should prevent non-admin from deleting packages", async () => {
      const userCaller = appRouter.createCaller({
        user: { id: 2, role: "user" as const },
      });

      await expect(
        userCaller.bookingPackages.delete(testPackageId)
      ).rejects.toThrow("Unauthorized");
    });
  });
});
