import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema.js";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: "default" });

const defaultPackages = [
  {
    name: "每月第一組拍攝",
    price: 2000,
    duration: 60,
    description: "每月第一組拍攝優惠方案，一小時人像拍攝",
    isActive: 1,
    sortOrder: 1,
  },
  {
    name: "人像拍攝",
    price: 4000,
    duration: 60,
    description: "標準人像拍攝方案，一小時專業拍攝服務",
    isActive: 1,
    sortOrder: 2,
  },
];

console.log("🌱 Seeding booking packages...");

for (const pkg of defaultPackages) {
  await db.insert(schema.bookingPackages).values(pkg);
  console.log(`✓ Created package: ${pkg.name}`);
}

console.log("✅ Booking packages seeded successfully!");

await connection.end();
process.exit(0);
