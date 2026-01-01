import { eq, and, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, photos, InsertPhoto, blogPosts, InsertBlogPost, siteSettings, InsertSiteSetting, photoCategories, InsertPhotoCategory, projects, InsertProject, photoProjects, InsertPhotoProject, changelogs, InsertChangelog, contactSubmissions, InsertContactSubmission, collaborators, InsertCollaborator, Collaborator, photoCollaborators, InsertPhotoCollaborator, heroSlides, InsertHeroSlide, heroQuotes, InsertHeroQuote, bookingPackages, InsertBookingPackage, photoPackageRelations, InsertPhotoPackageRelation, testimonials, InsertTestimonial, Testimonial } from "../drizzle/schema";
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

  // 1. Get all visible photos
  const photosList = await db
    .select()
    .from(photos)
    .where(eq(photos.isVisible, 1))
    .orderBy(photos.sortOrder);

  if (photosList.length === 0) {
    return [];
  }

  // 2. Batch query all collaborators for these photos
  const photoIds = photosList.map((p) => p.id);
  const allCollaborators = await db
    .select({
      photoId: photoCollaborators.photoId,
      id: collaborators.id,
      name: collaborators.name,
      slug: collaborators.slug,
      instagram: collaborators.instagram,
    })
    .from(photoCollaborators)
    .leftJoin(collaborators, eq(photoCollaborators.collaboratorId, collaborators.id))
    .where(inArray(photoCollaborators.photoId, photoIds));

  // 3. Build a Map for fast lookup
  const collaboratorsByPhoto = new Map<number, Array<{
    id: number | null;
    name: string | null;
    slug: string | null;
    instagram: string | null;
  }>>();

  for (const collab of allCollaborators) {
    if (!collaboratorsByPhoto.has(collab.photoId)) {
      collaboratorsByPhoto.set(collab.photoId, []);
    }
    if (collab.id !== null) {
      collaboratorsByPhoto.get(collab.photoId)!.push({
        id: collab.id,
        name: collab.name,
        slug: collab.slug,
        instagram: collab.instagram,
      });
    }
  }

  // 4. Combine results
  return photosList.map((photo) => ({
    ...photo,
    collaborators: collaboratorsByPhoto.get(photo.id) || [],
  }));
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
  const insertId = Number(result[0].insertId);
  return await getPhotoById(insertId);
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

// ==================== Projects ====================

export async function getAllProjects() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(projects).orderBy(projects.sortOrder);
}

export async function getVisibleProjects() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(projects).where(eq(projects.isVisible, 1)).orderBy(projects.sortOrder);
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(projects).where(eq(projects.id, id));
  return result[0] || null;
}

export async function getProjectBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(projects).where(eq(projects.slug, slug));
  return result[0] || null;
}

export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(projects).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateProject(id: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(projects).set(data).where(eq(projects.id, id));
  return { success: true };
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  // Also delete all photo-project associations
  await db.delete(photoProjects).where(eq(photoProjects.projectId, id));
  await db.delete(projects).where(eq(projects.id, id));
  return { success: true };
}

// ==================== Photo-Project Associations ====================

export async function getPhotosByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get all photo IDs associated with this project
  const associations = await db.select().from(photoProjects).where(eq(photoProjects.projectId, projectId));
  const photoIds = associations.map(a => a.photoId);
  
  if (photoIds.length === 0) return [];
  
  // Get all photos with these IDs
  const allPhotos = await db.select().from(photos);
  return allPhotos.filter(p => photoIds.includes(p.id)).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getProjectsByPhotoId(photoId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get all project IDs associated with this photo
  const associations = await db.select().from(photoProjects).where(eq(photoProjects.photoId, photoId));
  const projectIds = associations.map(a => a.projectId);
  
  if (projectIds.length === 0) return [];
  
  // Get all projects with these IDs
  const allProjects = await db.select().from(projects);
  return allProjects.filter(p => projectIds.includes(p.id));
}

export async function addPhotoToProject(photoId: number, projectId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // Check if association already exists
  const existing = await db.select().from(photoProjects)
    .where(and(
      eq(photoProjects.photoId, photoId),
      eq(photoProjects.projectId, projectId)
    ));
  
  if (existing.length > 0) {
    return { success: true, message: 'Association already exists' };
  }
  
  await db.insert(photoProjects).values({ photoId, projectId });
  return { success: true };
}

export async function removePhotoFromProject(photoId: number, projectId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.delete(photoProjects)
    .where(and(
      eq(photoProjects.photoId, photoId),
      eq(photoProjects.projectId, projectId)
    ));
  
  return { success: true };
}

export async function setPhotoProjects(photoId: number, projectIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // Remove all existing associations for this photo
  await db.delete(photoProjects).where(eq(photoProjects.photoId, photoId));
  
  // Add new associations
  if (projectIds.length > 0) {
    const values = projectIds.map(projectId => ({ photoId, projectId }));
    await db.insert(photoProjects).values(values);
  }
  
  return { success: true };
}

// ===== Changelog Functions =====

export async function getAllChangelogs() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(changelogs).orderBy(changelogs.date);
}

export async function getVisibleChangelogs() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(changelogs).where(eq(changelogs.isVisible, 1)).orderBy(changelogs.date);
}

export async function getChangelogById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(changelogs).where(eq(changelogs.id, id)).limit(1);
  return result[0] || null;
}

export async function createChangelog(data: InsertChangelog) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(changelogs).values(data);
  return { success: true, id: Number((result as any).insertId) };
}

export async function updateChangelog(id: number, data: Partial<InsertChangelog>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(changelogs).set(data).where(eq(changelogs.id, id));
  return { success: true };
}

export async function deleteChangelog(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(changelogs).where(eq(changelogs.id, id));
  return { success: true };
}


// ============ Contact Submissions ============

export async function createContactSubmission(submission: InsertContactSubmission) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(contactSubmissions).values(submission);
  const insertId = Number(result[0].insertId);
  // Fetch the complete record from database to get all fields including timestamps
  const created = await db.select().from(contactSubmissions).where(eq(contactSubmissions.id, insertId));
  return created[0];
}

export async function getAllContactSubmissions() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get contact submissions: database not available");
    return [];
  }
  return await db.select().from(contactSubmissions).orderBy(contactSubmissions.createdAt);
}

export async function getContactSubmissionById(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const results = await db.select().from(contactSubmissions).where(eq(contactSubmissions.id, id));
  if (!results[0]) {
    throw new Error(`Contact submission with id ${id} not found`);
  }
  return results[0];
}

export async function updateContactSubmissionStatus(id: number, status: 'new' | 'read' | 'replied' | 'archived') {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(contactSubmissions).set({ status, updatedAt: new Date() }).where(eq(contactSubmissions.id, id));
  // Fetch the updated record to return complete data
  const updated = await db.select().from(contactSubmissions).where(eq(contactSubmissions.id, id));
  return updated[0];
}

export async function deleteContactSubmission(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
  return { success: true };
}

// Collaborator management functions
export async function getAllCollaborators() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get collaborators: database not available");
    return [];
  }

  return await db.select().from(collaborators).orderBy(collaborators.sortOrder);
}

export async function getVisibleCollaborators() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get visible collaborators: database not available");
    return [];
  }

  return await db.select().from(collaborators).where(eq(collaborators.isVisible, 1)).orderBy(collaborators.sortOrder);
}

export async function getCollaboratorById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get collaborator: database not available");
    return null;
  }

  const result = await db.select().from(collaborators).where(eq(collaborators.id, id)).limit(1);
  if (result.length === 0) {
    return null;
  }
  return result[0];
}

export async function getCollaboratorBySlug(slug: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get collaborator: database not available");
    return undefined;
  }

  const result = await db.select().from(collaborators).where(eq(collaborators.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCollaborator(collaborator: InsertCollaborator) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create collaborator: database not available");
    return undefined;
  }

  const result = await db.insert(collaborators).values(collaborator);
  const insertId = Number(result[0].insertId);
  return await getCollaboratorById(insertId);
}

export async function updateCollaborator(id: number, updates: Partial<InsertCollaborator>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update collaborator: database not available");
    return undefined;
  }

  await db.update(collaborators).set(updates).where(eq(collaborators.id, id));
  return await getCollaboratorById(id);
}

export async function deleteCollaborator(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete collaborator: database not available");
    return;
  }

  await db.delete(collaborators).where(eq(collaborators.id, id));
}

export async function getPhotosByCollaboratorId(collaboratorId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get photos by collaborator: database not available");
    return [];
  }

  return await db.select().from(photos).where(eq(photos.collaboratorId, collaboratorId)).orderBy(photos.sortOrder);
}

export async function getVisiblePhotosByCollaboratorId(collaboratorId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get visible photos by collaborator: database not available");
    return [];
  }

  return await db.select().from(photos).where(and(eq(photos.collaboratorId, collaboratorId), eq(photos.isVisible, 1))).orderBy(photos.sortOrder);
}

// Photo-Collaborator relationship management functions
export async function addPhotoCollaborator(photoId: number, collaboratorId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add photo collaborator: database not available");
    return;
  }

  await db.insert(photoCollaborators).values({ photoId, collaboratorId });
}

export async function removePhotoCollaborator(photoId: number, collaboratorId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot remove photo collaborator: database not available");
    return;
  }

  await db.delete(photoCollaborators).where(
    and(
      eq(photoCollaborators.photoId, photoId),
      eq(photoCollaborators.collaboratorId, collaboratorId)
    )
  );
}

export async function setPhotoCollaborators(photoId: number, collaboratorIds: number[]) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot set photo collaborators: database not available");
    return;
  }

  // Remove all existing collaborators for this photo
  await db.delete(photoCollaborators).where(eq(photoCollaborators.photoId, photoId));

  // Add new collaborators
  if (collaboratorIds.length > 0) {
    await db.insert(photoCollaborators).values(
      collaboratorIds.map((collaboratorId) => ({ photoId, collaboratorId }))
    );
  }
}

export async function getPhotoCollaborators(photoId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get photo collaborators: database not available");
    return [];
  }

  const result = await db
    .select({
      id: collaborators.id,
      name: collaborators.name,
      slug: collaborators.slug,
      instagram: collaborators.instagram,
    })
    .from(photoCollaborators)
    .leftJoin(collaborators, eq(photoCollaborators.collaboratorId, collaborators.id))
    .where(eq(photoCollaborators.photoId, photoId));

  return result.filter((c) => c.id !== null);
}

// Hero Slides management functions
export async function getAllHeroSlides() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get hero slides: database not available");
    return [];
  }

  return await db.select().from(heroSlides).orderBy(heroSlides.sortOrder);
}

export async function getActiveHeroSlides() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get active hero slides: database not available");
    return [];
  }

  return await db.select().from(heroSlides).where(eq(heroSlides.isActive, 1)).orderBy(heroSlides.sortOrder);
}

export async function getHeroSlideById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get hero slide: database not available");
    return undefined;
  }

  const result = await db.select().from(heroSlides).where(eq(heroSlides.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createHeroSlide(slide: InsertHeroSlide) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(heroSlides).values(slide);
  const insertId = Number(result[0].insertId);
  return await getHeroSlideById(insertId);
}

export async function updateHeroSlide(id: number, updates: Partial<InsertHeroSlide>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(heroSlides).set(updates).where(eq(heroSlides.id, id));
  return await getHeroSlideById(id);
}

export async function deleteHeroSlide(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(heroSlides).where(eq(heroSlides.id, id));
}

// Hero Quotes management functions
export async function getAllHeroQuotes() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get hero quotes: database not available");
    return [];
  }

  return await db.select().from(heroQuotes);
}

export async function getActiveHeroQuotes() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get active hero quotes: database not available");
    return [];
  }

  return await db.select().from(heroQuotes).where(eq(heroQuotes.isActive, 1));
}

export async function getHeroQuoteById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get hero quote: database not available");
    return undefined;
  }

  const result = await db.select().from(heroQuotes).where(eq(heroQuotes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createHeroQuote(quote: InsertHeroQuote) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(heroQuotes).values(quote);
  const insertId = Number(result[0].insertId);
  return await getHeroQuoteById(insertId);
}

export async function updateHeroQuote(id: number, updates: Partial<InsertHeroQuote>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(heroQuotes).set(updates).where(eq(heroQuotes.id, id));
  return await getHeroQuoteById(id);
}

export async function deleteHeroQuote(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(heroQuotes).where(eq(heroQuotes.id, id));
}

// Booking Packages management functions
export async function getAllBookingPackages() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get booking packages: database not available");
    return [];
  }

  return await db.select().from(bookingPackages).orderBy(bookingPackages.sortOrder);
}

export async function getActiveBookingPackages() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get active booking packages: database not available");
    return [];
  }

  return await db.select().from(bookingPackages).where(eq(bookingPackages.isActive, 1)).orderBy(bookingPackages.sortOrder);
}

export async function getBookingPackageById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get booking package: database not available");
    return undefined;
  }

  const result = await db.select().from(bookingPackages).where(eq(bookingPackages.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBookingPackage(pkg: InsertBookingPackage) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(bookingPackages).values(pkg);
  const insertId = Number(result[0].insertId);
  return await getBookingPackageById(insertId);
}

export async function updateBookingPackage(id: number, updates: Partial<InsertBookingPackage>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(bookingPackages).set(updates).where(eq(bookingPackages.id, id));
  return await getBookingPackageById(id);
}

export async function deleteBookingPackage(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(bookingPackages).where(eq(bookingPackages.id, id));
}

export async function updateBookingPackagesOrder(updates: Array<{ id: number; sortOrder: number }>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  for (const update of updates) {
    await db.update(bookingPackages).set({ sortOrder: update.sortOrder }).where(eq(bookingPackages.id, update.id));
  }
}

// ============================================
// Photo-Package Relations Management
// ============================================

export async function getPhotoPackages(photoId: number) {
  const db = await getDb();
  if (!db) return [];

  const relations = await db
    .select()
    .from(photoPackageRelations)
    .where(eq(photoPackageRelations.photoId, photoId));

  return relations.map(r => r.packageId);
}

export async function updatePhotoPackages(photoId: number, packageIds: number[]) {
  const db = await getDb();
  if (!db) return;

  // Delete existing relations
  await db
    .delete(photoPackageRelations)
    .where(eq(photoPackageRelations.photoId, photoId));

  // Remove duplicates from packageIds
  const uniquePackageIds = Array.from(new Set(packageIds));

  // Insert new relations
  if (uniquePackageIds.length > 0) {
    await db.insert(photoPackageRelations).values(
      uniquePackageIds.map(packageId => ({
        photoId,
        packageId,
      }))
    );
  }
}

export async function getPackagePhotos(packageId: number) {
  const db = await getDb();
  if (!db) return [];

  const relations = await db
    .select()
    .from(photoPackageRelations)
    .where(eq(photoPackageRelations.packageId, packageId));

  if (relations.length === 0) return [];

  // Fetch photos
  const photoIds = relations.map(r => r.photoId);
  const packagePhotos = await db
    .select()
    .from(photos)
    .where(eq(photos.id, photoIds[0])); // Start with first photo

  // Fetch all photos with matching IDs
  const allPhotos = [];
  for (const photoId of photoIds) {
    const photo = await db
      .select()
      .from(photos)
      .where(eq(photos.id, photoId));
    if (photo.length > 0) {
      allPhotos.push(photo[0]);
    }
  }

  return allPhotos;
}


// ============================================
// Testimonials Management
// ============================================

export async function getAllTestimonials() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get testimonials: database not available");
    return [];
  }

  return await db.select().from(testimonials).orderBy(testimonials.sortOrder);
}

export async function getVisibleTestimonials() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get visible testimonials: database not available");
    return [];
  }

  return await db.select().from(testimonials).where(eq(testimonials.isVisible, 1)).orderBy(testimonials.sortOrder);
}

export async function getTestimonialById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get testimonial: database not available");
    return undefined;
  }

  const result = await db.select().from(testimonials).where(eq(testimonials.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createTestimonial(testimonial: InsertTestimonial) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(testimonials).values(testimonial);
  const insertId = Number(result[0].insertId);
  return await getTestimonialById(insertId);
}

export async function updateTestimonial(id: number, updates: Partial<InsertTestimonial>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(testimonials).set(updates).where(eq(testimonials.id, id));
  return await getTestimonialById(id);
}

export async function deleteTestimonial(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(testimonials).where(eq(testimonials.id, id));
}

export async function updateTestimonialsOrder(updates: Array<{ id: number; sortOrder: number }>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  for (const update of updates) {
    await db.update(testimonials).set({ sortOrder: update.sortOrder }).where(eq(testimonials.id, update.id));
  }
}
