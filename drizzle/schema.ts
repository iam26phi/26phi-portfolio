import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Photos table for portfolio management
 */
/**
 * Photo categories table for dynamic category management
 */
export const photoCategories = mysqlTable("photo_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(), // URL-friendly identifier
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PhotoCategory = typeof photoCategories.$inferSelect;
export type InsertPhotoCategory = typeof photoCategories.$inferInsert;

/**
 * Projects table for project-based categorization
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(), // URL-friendly identifier
  description: text("description"),
  coverImage: text("coverImage"), // S3 URL for cover image
  isVisible: int("isVisible").default(1).notNull(), // 1 = visible, 0 = hidden
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export const photos = mysqlTable("photos", {
  id: int("id").autoincrement().primaryKey(),
  src: text("src").notNull(), // S3 URL or local path
  alt: text("alt").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // Changed from enum to varchar for dynamic categories
  projectId: int("projectId"), // Optional reference to projects table
  location: varchar("location", { length: 255 }),
  date: varchar("date", { length: 50 }),
  description: text("description"),
  isVisible: int("isVisible").default(1).notNull(), // 1 = visible, 0 = hidden
  sortOrder: int("sortOrder").default(0).notNull(), // For manual ordering
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Photo-Project junction table for many-to-many relationship
 */
export const photoProjects = mysqlTable("photo_projects", {
  id: int("id").autoincrement().primaryKey(),
  photoId: int("photoId").notNull(),
  projectId: int("projectId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PhotoProject = typeof photoProjects.$inferSelect;
export type InsertPhotoProject = typeof photoProjects.$inferInsert;

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = typeof photos.$inferInsert;
/**
 * Blog posts table for article management
 */
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(), // URL-friendly identifier
  content: text("content").notNull(), // Markdown content
  excerpt: text("excerpt"), // Short summary for list view
  coverImage: text("coverImage"), // S3 URL for cover image
  category: varchar("category", { length: 100 }), // e.g., "Photography", "Behind the Scenes", "Travel"
  tags: text("tags"), // Comma-separated tags
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  viewCount: int("viewCount").default(0).notNull(),
  authorId: int("authorId").notNull(), // Reference to users table
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

/**
 * Site settings table for global configuration
 */
export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(), // e.g., "hero_background_image"
  settingValue: text("settingValue"), // JSON or plain text value
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;

/**
 * Changelogs table for version update history
 */
export const changelogs = mysqlTable("changelogs", {
  id: int("id").autoincrement().primaryKey(),
  version: varchar("version", { length: 50 }).notNull(), // e.g., "v1.0.0", "2024-01-15"
  date: timestamp("date").notNull(), // Release date
  description: text("description").notNull(), // Brief description of the update
  type: mysqlEnum("type", ["feature", "improvement", "bugfix", "design"]).default("feature").notNull(),
  isVisible: int("isVisible").default(1).notNull(), // 1 = visible, 0 = hidden
  sortOrder: int("sortOrder").default(0).notNull(), // For manual ordering
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Changelog = typeof changelogs.$inferSelect;
export type InsertChangelog = typeof changelogs.$inferInsert;
