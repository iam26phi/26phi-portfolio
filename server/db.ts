import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, photos, InsertPhoto, blogPosts, InsertBlogPost, siteSettings, InsertSiteSetting, photoCategories, InsertPhotoCategory } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Photo management functions
export async function getAllPhotos() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get photos: database not available");
    return [];
  }

  return await db.select().from(photos).orderBy(photos.sortOrder);
}

export async function getVisiblePhotos() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get photos: database not available");
    return [];
  }

  return await db.select().from(photos).where(eq(photos.isVisible, 1)).orderBy(photos.sortOrder);
}

export async function getPhotoById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get photo: database not available");
    return undefined;
  }

  const result = await db.select().from(photos).where(eq(photos.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPhoto(photo: InsertPhoto) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(photos).values(photo);
  return result;
}

export async function updatePhoto(id: number, updates: Partial<InsertPhoto>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(photos).set(updates).where(eq(photos.id, id));
  return await getPhotoById(id);
}

export async function deletePhoto(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(photos).where(eq(photos.id, id));
  return { success: true };
}

// Blog post management functions
export async function getAllBlogPosts() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get blog posts: database not available");
    return [];
  }

  return await db.select().from(blogPosts).orderBy(blogPosts.createdAt);
}

export async function getBlogPosts(status?: "draft" | "published", limit?: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get blog posts: database not available");
    return [];
  }

  let query = db.select().from(blogPosts);
  
  if (status) {
    query = query.where(eq(blogPosts.status, status)) as any;
  }
  
  query = query.orderBy(blogPosts.publishedAt) as any;
  
  if (limit) {
    query = query.limit(limit) as any;
  }

  return await query;
}

export async function getBlogPostById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get blog post: database not available");
    return undefined;
  }

  const result = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get blog post: database not available");
    return undefined;
  }

  const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBlogPost(post: InsertBlogPost) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(blogPosts).values(post);
  return result;
}

export async function updateBlogPost(id: number, updates: Partial<InsertBlogPost>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(blogPosts).set(updates).where(eq(blogPosts.id, id));
  return await getBlogPostById(id);
}

export async function deleteBlogPost(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(blogPosts).where(eq(blogPosts.id, id));
  return { success: true };
}

export async function incrementBlogPostViews(id: number) {
  const db = await getDb();
  if (!db) {
    return;
  }

  const post = await getBlogPostById(id);
  if (post) {
    await db.update(blogPosts)
      .set({ viewCount: (post.viewCount || 0) + 1 })
      .where(eq(blogPosts.id, id));
  }
}

// Site settings management functions
export async function getSiteSetting(key: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get site setting: database not available");
    return undefined;
  }

  const result = await db.select().from(siteSettings).where(eq(siteSettings.settingKey, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertSiteSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existing = await getSiteSetting(key);
  
  if (existing) {
    await db.update(siteSettings)
      .set({ settingValue: value, updatedAt: new Date() })
      .where(eq(siteSettings.settingKey, key));
  } else {
    await db.insert(siteSettings).values({
      settingKey: key,
      settingValue: value,
    });
  }
  
  return await getSiteSetting(key);
}

// ============================================
// Photo Categories Management
// ============================================

export async function listPhotoCategories() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(photoCategories).orderBy(photoCategories.sortOrder);
  } catch (error) {
    console.error("[Database] Failed to list photo categories:", error);
    return [];
  }
}

export async function createPhotoCategory(category: InsertPhotoCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const result = await db.insert(photoCategories).values(category);
    return { success: true, id: Number((result as any).insertId) };
  } catch (error) {
    console.error("[Database] Failed to create photo category:", error);
    throw error;
  }
}

export async function updatePhotoCategory(id: number, data: Partial<InsertPhotoCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.update(photoCategories).set(data).where(eq(photoCategories.id, id));
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to update photo category:", error);
    throw error;
  }
}

export async function deletePhotoCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.delete(photoCategories).where(eq(photoCategories.id, id));
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to delete photo category:", error);
    throw error;
  }
}
