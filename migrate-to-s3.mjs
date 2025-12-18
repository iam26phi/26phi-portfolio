import { getDb } from "./server/db.ts";
import { photos } from "./drizzle/schema.ts";
import { storagePut } from "./server/storage.ts";
import { readFileSync } from "fs";
import { eq } from "drizzle-orm";

async function migratePhotosToS3() {
  console.log("開始遷移照片到 S3...\n");

  // 獲取資料庫連線
  const db = await getDb();
  if (!db) {
    console.error("無法連接到資料庫");
    return;
  }

  // 獲取所有照片記錄
  const allPhotos = await db.select().from(photos);
  console.log(`找到 ${allPhotos.length} 張照片需要遷移\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const photo of allPhotos) {
    try {
      // 跳過已經是 S3 URL 的照片
      if (photo.src.startsWith("http://") || photo.src.startsWith("https://")) {
        console.log(`⏭️  跳過 (已在 S3): ${photo.alt}`);
        skipCount++;
        continue;
      }

      // 讀取本地照片檔案
      const localPath = `./client/public${photo.src}`;
      console.log(`📤 上傳中: ${photo.alt}`);
      console.log(`   本地路徑: ${localPath}`);

      const fileBuffer = readFileSync(localPath);
      
      // 上傳到 S3
      const fileName = photo.src.split("/").pop();
      const s3Key = `photos/${photo.category.toLowerCase()}/${fileName}`;
      
      const result = await storagePut(s3Key, fileBuffer, "image/jpeg");
      
      // 更新資料庫記錄
      await db
        .update(photos)
        .set({ src: result.url })
        .where(eq(photos.id, photo.id));

      console.log(`✅ 成功: ${photo.alt}`);
      console.log(`   S3 URL: ${result.url}\n`);
      successCount++;

    } catch (error) {
      console.error(`❌ 失敗: ${photo.alt}`);
      console.error(`   錯誤: ${error.message}\n`);
      errorCount++;
    }
  }

  console.log("\n=== 遷移完成 ===");
  console.log(`✅ 成功: ${successCount} 張`);
  console.log(`⏭️  跳過: ${skipCount} 張`);
  console.log(`❌ 失敗: ${errorCount} 張`);
}

migratePhotosToS3().catch(console.error);
