# Project TODO

## 效能與安全性優化（7 項）

### 1. Vite 設定優化
- [x] 修改 vite.config.ts 的 build 區塊（第 24-27 行）
- [x] 新增 rollupOptions 和 manualChunks 設定
- [x] 拆分 React、framer-motion 等大型依賴為獨立 chunk
- **效益：** 減少首屏 bundle、改善瀏覽器快取命中率

### 2. ProgressiveImage 避免同圖雙下載
- [x] 修改 client/src/components/ProgressiveImage.tsx（第 82-106 行）
- [x] 當沒有 lowResSrc 時，改用單張圖片 + blur 過渡
- [x] 加上 decoding="async" 屬性
- **效益：** 避免重複下載同一張圖片，最大效能收益

### 3. 字型優化：OTF → WOFF2
- [x] 轉換字型檔案為 WOFF2 格式
  - [x] KuMincho-R.woff2
  - [x] burnfont-1.3.woff2
  - [x] lithue-1.1.woff2
- [x] 修改 client/src/index.css 的 @font-face（第 5-27 行）
- [x] 修改 client/index.html 的 preload（第 11-20 行）
- **效益：** 大幅減少字型檔案體積，改善首屏載入

### 4. 路由 Lazy Loading
- [x] 修改 client/src/App.tsx
- [x] 將所有 pages import 改為 React.lazy
- [x] 用 Suspense 包裹路由
- **效益：** 減少首頁 JS 體積，不載入未使用的後台頁面

### 5. Home 頁面效能優化
- [x] 修改 client/src/pages/Home.tsx（第 112-139 行）
- [x] 將 filteredPhotos 改用 useMemo
- [x] 加上正確的 dependencies
- **效益：** 減少不必要的重算與 re-render

### 6. Lightbox 可訪問性改進
- [x] 修改 client/src/components/Lightbox.tsx
- [x] 加上 ARIA 屬性（role, aria-modal, aria-label）
- [x] 實作 focus 管理（開啟時 focus 到關閉按鈕，關閉後還原）
- **效益：** 改善鍵盤導航和螢幕閱讀器體驗

### 7. Cookie 和 CSRF 防護優化
- [x] 修改 server/_core/cookies.ts（第 45 行）
- [x] 將 sameSite 改為可配置，預設 "lax"
- [x] 修改 server/_core/index.ts（第 36 行附近）
- [x] 加上最小 CSRF guard middleware
- **效益：** 提升安全性，避免跨站攻擊

## Bug 修復 - Admin.tsx 標題固定功能（進行中）

### 問題描述
- 照片管理頁面的「照片管理」標題應該在滾動時固定在頂部
- 目前 sticky 定位無法正常工作，因為 sticky div 在 container 內部
- 當頁面滾動時，整個 container 和標題一起滾動，導致 sticky 失效

### 技術分析
- 第 840 行：`<div className="sticky top-0 z-10 bg-black ...">` 
- 第 839 行：這個 sticky div 在 `<div className="container py-12">` 內部
- **問題根源：** sticky 定位相對於最近的滾動容器，當 sticky 元素在 container 內部時，會隨 container 一起滾動

### 建議解決方案
1. 將 sticky header 移到 container 外面
2. 重新組織 JSX 結構：
   ```
   <AdminLayout>
     <div className="min-h-screen bg-black">
       {/* Drag & Drop Overlay */}
       
       {/* Sticky Header - 移到這裡 */}
       <div className="sticky top-0 z-10 bg-black border-b border-border">
         <div className="container py-6">
           {/* 標題內容 */}
         </div>
       </div>
       
       {/* Main Content */}
       <div className="container py-12">
         {/* 照片列表等內容 */}
       </div>
     </div>
   </AdminLayout>
   ```

### 實施風險
- Admin.tsx 有 1544 行，結構複雜
- 需要仔細處理 JSX 標籤配對，避免語法錯誤
- 建議：使用 IDE 或編輯器的 JSX 格式化工具輔助

### 實施步驟
- [x] 分析 Admin.tsx 的完整結構
- [x] 嘗試使用 fixed 定位修復
- [ ] 將 sticky header 移到 container 外層（JSX 結構太複雜，多次嘗試失敗）
- [ ] 測試滾動行為確認修復

### 狀態
- [ ] 部分完成，但效果不理想，需要進一步調試

### 詳細報告
請查看 `/home/ubuntu/admin_sticky_header_issue.md` 了解完整的問題分析和建議解決方案。


## 新功能 - 部落格和 About 頁面文字特效

### 需求描述
在部落格和 About 頁面的內文中加入 anime.js 文字特效：
- 文字行上下浮動動畫
- 滑鼠懸停時文字顏色變化
- 使用 animejs 的 splitText 功能

### 實施步驟
- [x] 創建 useTextAnimation custom hook
- [x] 在 About 頁面整合文字特效
- [x] 在 Blog 頁面整合文字特效
- [x] 測試動畫效果和效能
- [x] 確保動畫不影響可讀性

### 技術細節
- 使用 anime.js v4 (esm.sh CDN)
- splitText API 分割文字
- stagger 延遲效果
- 顏色隨機變化效果


## Bug 修復 - About 頁面照片上傳功能

### 問題描述
用戶無法正常上傳 About 頁面的個人照片
- 點擊儲存變更後顯示上傳完成
- 但開啟前台網頁時照片還是空白
- 重新整理 Admin 頁面後原先上傳的照片也消失了
- **根本原因：照片上傳成功但沒有正確保存到資料庫**

### 實施步驟
- [x] 檢查 AdminAbout 頁面的上傳實作
- [x] 檢查後端 API 路由和處理邏輯
- [x] 診斷上傳失敗的原因
- [x] 檢查 about.update API 是否正確處理 profileImage
- [x] 檢查資料庫 schema 是否有 profileImage 欄位
- [x] 修復上傳功能（在 about.update input schema 加入 profileImage 欄位）
- [x] 測試上傳流程


## GitHub 整合 (2026-01-02)

### 需求描述
將網站程式碼推送到 GitHub 並設定自動同步機制，確保每次更新都會自動推送到 GitHub

### 實施步驟
- [x] 檢查 GitHub 帳號登入狀態 (iam26phi)
- [x] 建立 GitHub 儲存庫 (26phi-portfolio)
- [x] 推送現有程式碼到 GitHub (1331 個物件，389.14 MiB)
- [x] 設定 Git post-commit hook 實現自動同步
- [x] 測試自動同步功能（README 更新測試）
- [x] 撰寫 GitHub 整合說明文件

### 技術細節
- **儲存庫網址**：https://github.com/iam26phi/26phi-portfolio
- **自動同步機制**：Git post-commit hook (`.git/hooks/post-commit`)
- **運作方式**：每次 commit 後自動執行 `git push github main`
- **Remote 設定**：
  - `origin`: Manus 內部儲存庫 (S3)
  - `github`: GitHub 儲存庫

### 測試結果
- ✅ 自動推送功能正常運作
- ✅ 每次 commit 後會顯示同步狀態
- ✅ GitHub 儲存庫與本地保持同步



## Bug 修復 - 首頁照片分類篩選功能

### 問題描述
首頁搜尋特定分類的照片無法正常顯示，只有「人像攝影」分類可以正常顯示照片，其他分類點擊後沒有照片顯示。

### 根本原因
- 照片表的 `category` 欄位儲存的是分類**名稱**（例：「人像攝影」）
- 篩選按鈕傳遞的是分類 **slug**（例：portrait）
- Home.tsx 的篩選邏輯直接比對 `photo.category !== advancedFilters.category`，導致永遠不匹配

### 實施步驟
- [x] 檢查首頁 PortfolioGrid 組件的篩選邏輯
- [x] 檢查資料庫中的照片和分類資料
- [x] 診斷問題根源（分類名稱 vs slug 不匹配）
- [x] 修復篩選功能（使用 categories.find 將 name 轉換為 slug）
- [x] 測試所有分類篩選功能（劇照攝影測試成功）

### 修復細節
修改 `client/src/pages/Home.tsx` 第 122-127 行：
```typescript
// 修復前：
if (advancedFilters.category !== "All" && photo.category !== advancedFilters.category) {
  return false;
}

// 修復後：
if (advancedFilters.category !== "All") {
  const photoCategory = categories.find(cat => cat.name === photo.category);
  if (!photoCategory || photoCategory.slug !== advancedFilters.category) {
    return false;
  }
}
```

### 測試結果
- ✅ 劇照攝影：3 張照片正常顯示
- ✅ 篩選邏輯正確使用 slug 進行比對


## Bug 修復 - 合作對象檢視頁面照片顯示

### 問題描述
在管理員後台為照片新增「合作對象」後，該合作對象的檢視頁面並沒有正常顯示這些照片。

### 根本原因
`getVisiblePhotosByCollaboratorId` 函數只查詢 `photos` 表的 `collaboratorId` 欄位（舊的單一關聯），沒有查詢 `photoCollaborators` 多對多關聯表。管理員後台新增合作對象時使用的是多對多關聯表，因此照片無法顯示。

### 實施步驟
- [x] 檢查合作對象檢視頁面的前端實作
- [x] 檢查後端 API 是否正確查詢合作對象的照片
- [x] 檢查資料庫關聯和查詢邏輯
- [x] 診斷問題根源（查詢邏輯未支援多對多關聯）
- [x] 修復 `getVisiblePhotosByCollaboratorId` 函數
- [x] 測試合作對象頁面的照片顯示功能

### 修復細節
修改 `server/db.ts` 的 `getVisiblePhotosByCollaboratorId` 函數（第 732-761 行）：

**修復前：**
```typescript
return await db.select().from(photos)
  .where(and(eq(photos.collaboratorId, collaboratorId), eq(photos.isVisible, 1)))
  .orderBy(photos.sortOrder);
```

**修復後：**
```typescript
// 1. 從多對多關聯表查詢照片 ID
const photoCollaboratorRecords = await db
  .select({ photoId: photoCollaborators.photoId })
  .from(photoCollaborators)
  .where(eq(photoCollaborators.collaboratorId, collaboratorId));

const photoIds = photoCollaboratorRecords.map(record => record.photoId);

if (photoIds.length === 0) {
  return [];
}

// 2. 查詢可見的照片
return await db
  .select()
  .from(photos)
  .where(and(
    inArray(photos.id, photoIds),
    eq(photos.isVisible, 1)
  ))
  .orderBy(photos.sortOrder);
```

### 測試結果
- ✅ 資料庫中確認有 photoCollaborators 關聯資料
- ✅ 修復後的函數正確查詢多對多關聯表
- ✅ 合作對象頁面現在可以正常顯示照片
