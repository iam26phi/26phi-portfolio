import { drizzle } from "drizzle-orm/mysql2";
import { photos } from "./drizzle/schema.js";
import mysql from "mysql2/promise";

// Existing photo data from client/src/lib/data.ts
const existingPhotos = [
  {
    src: "/images/portfolio/portrait/KILLER_劇照_10.jpg",
    alt: "Portrait Photo 1",
    category: "Portrait",
    location: "Taipei",
    date: "2025",
    sortOrder: 1
  },
  {
    src: "/images/portfolio/portrait/KILLER_劇照_101.jpg",
    alt: "Portrait Photo 2",
    category: "Portrait",
    location: "Taipei",
    date: "2025",
    sortOrder: 2
  },
  {
    src: "/images/portfolio/portrait/KILLER_劇照_1.jpg",
    alt: "Portrait Photo 3",
    category: "Portrait",
    location: "Taipei",
    date: "2025",
    sortOrder: 3
  },
  {
    src: "/images/portfolio/portrait/KILLER_劇照_100.jpg",
    alt: "Portrait Photo 4",
    category: "Portrait",
    location: "Taipei",
    date: "2025",
    sortOrder: 4
  },
  {
    src: "/images/portfolio/travel/_A1_8970.jpg",
    alt: "Travel Photo 5",
    category: "Travel",
    location: "Tokyo",
    date: "2025",
    sortOrder: 5
  },
  {
    src: "/images/portfolio/travel/_A1_8993.jpg",
    alt: "Travel Photo 6",
    category: "Travel",
    location: "Tokyo",
    date: "2025",
    sortOrder: 6
  },
  {
    src: "/images/portfolio/travel/_A1_8994.jpg",
    alt: "Travel Photo 7",
    category: "Travel",
    location: "Tokyo",
    date: "2025",
    sortOrder: 7
  },
  {
    src: "/images/portfolio/editorial/XRAGE_01_10.jpg",
    alt: "Editorial Photo 8",
    category: "Editorial",
    location: "Taipei",
    date: "2025",
    sortOrder: 8
  },
  {
    src: "/images/portfolio/editorial/XRAGE_01_1.jpg",
    alt: "Editorial Photo 9",
    category: "Editorial",
    location: "Taipei",
    date: "2025",
    sortOrder: 9
  },
  {
    src: "/images/portfolio/editorial/XRAGE_01_11.jpg",
    alt: "Editorial Photo 10",
    category: "Editorial",
    location: "Taipei",
    date: "2025",
    sortOrder: 10
  }
];

async function migrate() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  console.log("Starting photo migration...");

  try {
    // Check if photos already exist
    const existingCount = await db.select().from(photos);
    if (existingCount.length > 0) {
      console.log(`Database already contains ${existingCount.length} photos. Skipping migration.`);
      await connection.end();
      return;
    }

    // Insert photos
    for (const photo of existingPhotos) {
      await db.insert(photos).values({
        ...photo,
        isVisible: 1,
        description: null
      });
    }

    console.log(`Successfully migrated ${existingPhotos.length} photos to database.`);
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

migrate().catch(console.error);
