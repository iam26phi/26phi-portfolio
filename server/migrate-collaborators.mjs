import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { photos, photoCollaborators } from '../drizzle/schema.js';
import { eq, isNotNull } from 'drizzle-orm';

// Database connection
const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '4000'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

const db = drizzle(connection);

console.log('Starting migration of collaboratorId to photo_collaborators...');

try {
  // Get all photos with collaboratorId
  const photosWithCollaborators = await db
    .select()
    .from(photos)
    .where(isNotNull(photos.collaboratorId));

  console.log(`Found ${photosWithCollaborators.length} photos with collaboratorId`);

  // Insert into photo_collaborators
  let migratedCount = 0;
  for (const photo of photosWithCollaborators) {
    if (photo.collaboratorId) {
      // Check if already exists
      const existing = await db
        .select()
        .from(photoCollaborators)
        .where(eq(photoCollaborators.photoId, photo.id))
        .where(eq(photoCollaborators.collaboratorId, photo.collaboratorId));

      if (existing.length === 0) {
        await db.insert(photoCollaborators).values({
          photoId: photo.id,
          collaboratorId: photo.collaboratorId,
        });
        migratedCount++;
        console.log(`Migrated photo ${photo.id} -> collaborator ${photo.collaboratorId}`);
      } else {
        console.log(`Skipped photo ${photo.id} (already exists)`);
      }
    }
  }

  console.log(`\nMigration completed successfully!`);
  console.log(`Migrated ${migratedCount} photo-collaborator relationships`);
  console.log(`\nNote: The 'collaboratorId' column in 'photos' table is kept for backward compatibility.`);
  console.log(`You can remove it later after verifying the migration.`);

} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
} finally {
  await connection.end();
}
