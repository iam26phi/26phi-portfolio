# EXIF 自動提取功能測試文檔

## 功能說明

照片上傳時會自動提取 EXIF 資訊，包括：
- **相機型號** (camera): 例如 "Canon EOS R5"
- **鏡頭資訊** (lens): 例如 "RF24-70mm F2.8 L IS USM"
- **拍攝參數** (settings): 例如 "ISO 400, f/2.8, 1/250s, 50mm"
- **拍攝日期** (date): 自動從 EXIF 提取
- **GPS 位置** (location): 經緯度座標（如果照片包含 GPS 資訊）

## 測試步驟

### 1. 準備測試照片

準備以下類型的照片：
- ✅ 包含完整 EXIF 資訊的照片（相機拍攝的原始 JPG）
- ✅ 不包含 EXIF 資訊的照片（截圖、PNG 圖片）
- ✅ 包含 GPS 資訊的照片

### 2. 測試上傳流程

1. 登入後台管理頁面 (`/admin`)
2. 點擊「上傳照片」按鈕
3. 選擇包含 EXIF 資訊的照片
4. 觀察上傳過程中的 toast 訊息

**預期結果：**
- 如果照片包含 EXIF 資訊，應該顯示「{檔名} EXIF 資訊提取成功」
- 照片上傳成功後，資料庫中應該自動填入以下欄位：
  * `camera`: 相機型號
  * `lens`: 鏡頭資訊
  * `settings`: 拍攝參數
  * `date`: 拍攝日期
  * `location`: GPS 座標（如果有）

### 3. 驗證資料庫記錄

上傳成功後，檢查照片詳細資訊：
1. 在照片管理列表中找到剛上傳的照片
2. 點擊編輯按鈕查看詳細資訊
3. 確認以下欄位已自動填入：
   - 相機型號
   - 鏡頭
   - 拍攝參數
   - 拍攝日期

### 4. 前台顯示測試

1. 前往首頁 (`/`)
2. 點擊剛上傳的照片開啟 Lightbox
3. 確認 Lightbox 中顯示完整的 EXIF 資訊：
   - 相機型號和鏡頭資訊
   - 拍攝參數（ISO、光圈、快門、焦距）
   - 拍攝日期
   - 拍攝地點（如果有 GPS 資訊）

## 測試案例

### 案例 1：完整 EXIF 資訊的照片

**輸入：** 相機拍攝的原始 JPG 照片
**預期輸出：**
```json
{
  "camera": "Canon EOS R5",
  "lens": "RF24-70mm F2.8 L IS USM",
  "settings": "ISO 400, f/2.8, 1/250s, 50mm",
  "date": "2024-12-30",
  "location": "25.033964, 121.564472"
}
```

### 案例 2：無 EXIF 資訊的照片

**輸入：** PNG 截圖或經過處理的照片
**預期輸出：**
```json
{
  "camera": undefined,
  "lens": undefined,
  "settings": undefined,
  "date": "2024-12-30", // 使用當前日期
  "location": ""
}
```

### 案例 3：部分 EXIF 資訊的照片

**輸入：** 只包含基本 EXIF 的照片
**預期輸出：**
```json
{
  "camera": "iPhone 15 Pro",
  "lens": undefined,
  "settings": "ISO 64, f/1.8, 1/120s",
  "date": "2024-12-25",
  "location": ""
}
```

## 實作細節

### EXIF 提取邏輯 (`client/src/lib/exif.ts`)

- 使用 `exifr` 套件讀取 EXIF 資訊
- 支援讀取 TIFF、EXIF、GPS、Interop 等標籤
- 自動格式化拍攝參數為易讀格式
- 處理各種相機廠商的 EXIF 格式差異

### 上傳流程整合 (`client/src/pages/Admin.tsx`)

- 在 `uploadSingleFile` 函數中，讀取檔案後立即提取 EXIF
- EXIF 提取成功後顯示 toast 訊息
- 將提取的 EXIF 資訊傳遞給 `createMutation`
- 如果 EXIF 提取失敗，使用預設值（空字串或當前日期）

## 已知限制

1. **GPS 座標格式**：目前只儲存經緯度數值，未轉換為地址名稱
2. **相機型號格式**：某些相機可能有不同的 EXIF 標籤名稱
3. **壓縮後的照片**：如果照片經過壓縮，EXIF 資訊可能會被移除

## 未來改進方向

1. **GPS 反向地理編碼**：將經緯度轉換為實際地址
2. **EXIF 編輯功能**：允許手動修改自動提取的 EXIF 資訊
3. **批次 EXIF 提取**：為已上傳的照片批次提取 EXIF
4. **EXIF 資訊展示優化**：在前台以更美觀的方式展示 EXIF 資訊
