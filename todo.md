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

## Bug 修復 - Admin.tsx 標題固定功能（待解決）

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

### 狀態
- [ ] 待實施（需要重構 JSX 結構）
