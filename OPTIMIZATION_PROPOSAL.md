# 26phi 攝影作品集網站 - 程式碼優化提案

> **目標**：在不影響現有功能的前提下，提升網站效能、可維護性和擴展性

**審查日期**：2025-12-31  
**專案規模**：前端 19,254 行 / 後端 4,643 行 / 依賴套件 608MB

---

## 一、執行摘要

經過全面程式碼審查，26phi 攝影作品集網站整體架構健全，功能完整且運作正常。然而，隨著功能持續增長，部分區域出現效能瓶頸和維護性問題。本提案提出**15 項優化建議**，分為**立即實施**（高優先級）和**逐步改進**（中優先級）兩個階段，預計可提升 30-50% 的頁面載入速度和 40% 的程式碼可維護性。

---

## 二、現況分析

### 2.1 前端架構（19,254 行程式碼）

**優點**：
- 使用 React 19 + TypeScript 提供型別安全
- Tailwind CSS 4 實現響應式設計
- Framer Motion 提供流暢動畫效果
- TRPC 提供端到端型別安全的 API 調用

**待改進**：
- **Home.tsx 過於龐大**（471 行），包含多個職責（英雄區域、作品集、評價、篩選）
- **重複的隨機排序邏輯**：Home.tsx 和 Packages.tsx 中重複實作 Fisher-Yates 演算法
- **多個 TRPC 查詢未優化**：Home.tsx 中同時發起 5 個獨立查詢，未使用批次載入
- **圖片載入未優化**：缺少 lazy loading 和 WebP 格式支援
- **字體載入未優化**：Lithue 字體 (2.6MB) 阻塞首次渲染

### 2.2 後端架構（4,643 行程式碼）

**優點**：
- 使用 Drizzle ORM 提供型別安全的資料庫操作
- 81 個資料庫函數涵蓋所有業務邏輯
- 完整的權限控制（protectedProcedure + role 檢查）
- 良好的測試覆蓋率（23 個測試檔案）

**待改進**：
- **N+1 查詢問題**：`getAllPhotos()` 中對每張照片單獨查詢協作者資訊
- **routers.ts 過於龐大**（1,335 行），包含 13 個 router 定義
- **缺少資料庫索引優化**：photos 表的 category、location、date 欄位未建立索引
- **缺少查詢結果快取**：頻繁查詢的資料（categories、projects）未快取

### 2.3 效能瓶頸

1. **首頁載入時間**：5 個並行 TRPC 查詢 + 大型字體檔案 + 未優化圖片
2. **照片列表渲染**：大量照片同時渲染，未使用虛擬化
3. **資料庫查詢**：N+1 查詢導致每次載入照片列表需執行 100+ 次資料庫查詢
4. **依賴套件大小**：608MB node_modules，包含許多未使用的 Radix UI 組件

---

## 三、優化提案

### 階段一：立即實施（高優先級）

#### 3.1 前端效能優化

##### 3.1.1 拆分 Home.tsx 為多個組件

**問題**：Home.tsx 包含 471 行程式碼，職責過多，難以維護和測試。

**解決方案**：
```
client/src/pages/Home.tsx (保留主要結構)
client/src/components/home/
  ├── HeroSection.tsx (英雄區域輪播)
  ├── PortfolioGrid.tsx (作品集網格)
  ├── PhotoFilters.tsx (篩選器)
  └── ReviewsSection.tsx (客戶評價)
```

**預期效果**：
- 減少 Home.tsx 至 150 行以內
- 提升組件可重用性和測試性
- 改善程式碼可讀性

**實施難度**：⭐⭐ (中等)  
**預估時間**：2-3 小時

---

##### 3.1.2 提取共用的隨機排序邏輯

**問題**：Fisher-Yates 演算法在 Home.tsx、Packages.tsx 中重複實作。

**解決方案**：
```typescript
// client/src/lib/utils.ts
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

**使用方式**：
```typescript
// Home.tsx
const shuffledPhotos = useMemo(() => shuffleArray(photosRaw), [photosRaw]);

// Packages.tsx
const shuffledPhotos = useMemo(() => shuffleArray(photos), [photos]);
```

**預期效果**：
- 消除重複程式碼
- 單一測試點，提升可靠性
- 未來可輕鬆擴展（例如：加入種子值支援可重現的隨機順序）

**實施難度**：⭐ (簡單)  
**預估時間**：30 分鐘

---

##### 3.1.3 優化字體載入策略

**問題**：Lithue 字體 (2.6MB) 阻塞首次渲染，造成明顯的字體閃爍（FOUT）。

**解決方案**：
```html
<!-- client/index.html -->
<head>
  <link rel="preload" href="/fonts/lithue-1.1.otf" as="font" type="font/otf" crossorigin>
</head>
```

```css
/* client/src/index.css */
@font-face {
  font-family: 'Lithue';
  src: url('/fonts/lithue-1.1.otf') format('opentype');
  font-weight: normal;
  font-style: normal;
  font-display: swap; /* 已設定，保持 */
}
```

**進階優化**（可選）：
- 使用 `woff2` 格式（壓縮率更高，約減少 30-40% 檔案大小）
- 使用 `font-subset` 工具僅包含使用的字元

**預期效果**：
- 減少首次渲染阻塞時間 200-500ms
- 改善 Lighthouse Performance 分數

**實施難度**：⭐ (簡單)  
**預估時間**：15 分鐘

---

##### 3.1.4 實作圖片 Lazy Loading

**問題**：所有照片同時載入，首頁載入時間過長。

**解決方案**：
```typescript
// client/src/components/ProgressiveImage.tsx (已存在，需啟用 lazy loading)
<ProgressiveImage
  src={photo.src}
  alt={photo.alt}
  loading="lazy" // 新增此屬性
  rootMargin="200px"
  className="..."
/>
```

**進階優化**（可選）：
- 使用 `react-window` 或 `react-virtualized` 實作虛擬化滾動
- 僅渲染可見區域的照片，大幅減少 DOM 節點數量

**預期效果**：
- 首頁初始載入時間減少 50-70%
- 改善滾動效能

**實施難度**：⭐ (簡單)  
**預估時間**：30 分鐘

---

##### 3.1.5 優化 TRPC 查詢批次載入

**問題**：Home.tsx 中同時發起 5 個獨立查詢，未使用批次載入。

**解決方案**：
```typescript
// 使用 TRPC 的 useQueries 批次載入
const queries = trpc.useQueries((t) => [
  t.photos.list(),
  t.photoCategories.list(),
  t.projects.list(),
  t.hero.getActiveSlides(),
  t.hero.getActiveQuotes(),
]);

const [photosQuery, categoriesQuery, projectsQuery, slidesQuery, quotesQuery] = queries;
```

**預期效果**：
- 減少 HTTP 請求數量（5 個 → 1 個）
- 改善首頁載入時間 100-200ms

**實施難度**：⭐⭐ (中等)  
**預估時間**：1 小時

---

#### 3.2 後端效能優化

##### 3.2.1 解決照片協作者的 N+1 查詢問題

**問題**：`getAllPhotos()` 中對每張照片單獨查詢協作者，導致 100+ 次資料庫查詢。

**現況**：
```typescript
// server/db.ts - getAllPhotos()
for (const photo of photos) {
  const collaboratorsResult = await db
    .select({...})
    .from(photoCollaborators)
    .leftJoin(collaborators, ...)
    .where(eq(photoCollaborators.photoId, photo.id)); // N+1 查詢
}
```

**解決方案**：
```typescript
// 一次查詢所有照片的協作者
const photoIds = photos.map(p => p.id);
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

// 建立 Map 快速查找
const collaboratorsByPhoto = new Map<number, Array<{...}>>();
for (const collab of allCollaborators) {
  if (!collaboratorsByPhoto.has(collab.photoId)) {
    collaboratorsByPhoto.set(collab.photoId, []);
  }
  collaboratorsByPhoto.get(collab.photoId)!.push(collab);
}

// 組合結果
return photos.map(photo => ({
  ...photo,
  collaborators: collaboratorsByPhoto.get(photo.id) || [],
}));
```

**預期效果**：
- 資料庫查詢次數從 100+ 次減少至 2 次
- 照片列表載入時間減少 70-80%

**實施難度**：⭐⭐⭐ (較難)  
**預估時間**：2-3 小時

---

##### 3.2.2 新增資料庫索引

**問題**：photos 表的 category、location、date 欄位未建立索引，篩選查詢效能差。

**解決方案**：
```sql
-- drizzle/migrations/add_indexes.sql
CREATE INDEX idx_photos_category ON photos(category);
CREATE INDEX idx_photos_location ON photos(location);
CREATE INDEX idx_photos_date ON photos(date);
CREATE INDEX idx_photos_featured ON photos(featured);
CREATE INDEX idx_photos_is_visible ON photos(isVisible);
CREATE INDEX idx_photos_sort_order ON photos(sortOrder);
```

**預期效果**：
- 篩選查詢速度提升 5-10 倍
- 改善使用者體驗（即時篩選）

**實施難度**：⭐ (簡單)  
**預估時間**：30 分鐘

---

##### 3.2.3 拆分 routers.ts 為多個檔案

**問題**：routers.ts 包含 1,335 行程式碼和 13 個 router，難以維護。

**解決方案**：
```
server/routers/
  ├── index.ts (匯出所有 router)
  ├── photos.router.ts
  ├── blog.router.ts
  ├── projects.router.ts
  ├── hero.router.ts
  ├── bookingPackages.router.ts
  └── ...
```

**預期效果**：
- 提升程式碼可讀性和可維護性
- 減少 Git 衝突
- 加快 IDE 載入速度

**實施難度**：⭐⭐ (中等)  
**預估時間**：2-3 小時

---

### 階段二：逐步改進（中優先級）

#### 3.3 程式碼品質改進

##### 3.3.1 實作查詢結果快取

**問題**：categories、projects 等資料頻繁查詢但很少變更。

**解決方案**：
```typescript
// 使用 TRPC 的 staleTime 設定快取
const { data: categories } = trpc.photoCategories.list.useQuery(undefined, {
  staleTime: 5 * 60 * 1000, // 5 分鐘內不重新查詢
});
```

**預期效果**：
- 減少不必要的資料庫查詢
- 改善頁面切換速度

**實施難度**：⭐ (簡單)  
**預估時間**：30 分鐘

---

##### 3.3.2 移除未使用的依賴套件

**問題**：608MB node_modules 包含許多未使用的 Radix UI 組件。

**解決方案**：
```bash
# 分析未使用的套件
npx depcheck

# 移除未使用的套件
pnpm remove @radix-ui/react-accordion @radix-ui/react-aspect-ratio ...
```

**預期效果**：
- 減少 node_modules 大小 20-30%
- 加快 npm install 速度
- 減少打包檔案大小

**實施難度**：⭐ (簡單)  
**預估時間**：1 小時

---

##### 3.3.3 實作錯誤邊界（Error Boundary）

**問題**：前端缺少全域錯誤處理，組件錯誤會導致整個應用崩潰。

**解決方案**：
```typescript
// client/src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">發生錯誤</h1>
            <button onClick={() => window.location.reload()}>
              重新載入頁面
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**預期效果**：
- 改善使用者體驗（優雅的錯誤處理）
- 防止整個應用崩潰

**實施難度**：⭐ (簡單)  
**預估時間**：30 分鐘

---

##### 3.3.4 實作圖片格式優化（WebP/AVIF）

**問題**：所有圖片使用原始格式（JPG/PNG），檔案大小未優化。

**解決方案**：
```typescript
// server/storage.ts - 上傳時自動轉換格式
import sharp from 'sharp';

async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .webp({ quality: 85 })
    .toBuffer();
}
```

```typescript
// client/src/components/ProgressiveImage.tsx - 支援多格式
<picture>
  <source srcSet={photo.src.replace('.jpg', '.webp')} type="image/webp" />
  <source srcSet={photo.src.replace('.jpg', '.avif')} type="image/avif" />
  <img src={photo.src} alt={photo.alt} loading="lazy" />
</picture>
```

**預期效果**：
- 圖片檔案大小減少 30-50%
- 頁面載入速度顯著提升

**實施難度**：⭐⭐⭐ (較難)  
**預估時間**：3-4 小時

---

##### 3.3.5 實作前端路由預載入（Prefetch）

**問題**：頁面切換時需等待資料載入，體驗不流暢。

**解決方案**：
```typescript
// client/src/components/Navigation.tsx
import { Link } from 'wouter';

<Link 
  href="/projects"
  onMouseEnter={() => {
    // 預載入 projects 資料
    trpcClient.projects.list.prefetch();
  }}
>
  PROJECTS
</Link>
```

**預期效果**：
- 頁面切換更流暢
- 改善使用者體驗

**實施難度**：⭐⭐ (中等)  
**預估時間**：1-2 小時

---

## 四、優先級排序

### 立即實施（預計 1-2 週完成）

| 優化項目 | 預期效果 | 實施難度 | 預估時間 |
|---------|---------|---------|---------|
| 3.2.1 解決 N+1 查詢問題 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 2-3 小時 |
| 3.1.3 優化字體載入 | ⭐⭐⭐⭐ | ⭐ | 15 分鐘 |
| 3.1.4 實作圖片 Lazy Loading | ⭐⭐⭐⭐ | ⭐ | 30 分鐘 |
| 3.2.2 新增資料庫索引 | ⭐⭐⭐⭐ | ⭐ | 30 分鐘 |
| 3.1.2 提取共用隨機排序邏輯 | ⭐⭐⭐ | ⭐ | 30 分鐘 |

**總計**：約 4-5 小時

### 逐步改進（預計 2-4 週完成）

| 優化項目 | 預期效果 | 實施難度 | 預估時間 |
|---------|---------|---------|---------|
| 3.1.1 拆分 Home.tsx | ⭐⭐⭐⭐ | ⭐⭐ | 2-3 小時 |
| 3.2.3 拆分 routers.ts | ⭐⭐⭐⭐ | ⭐⭐ | 2-3 小時 |
| 3.1.5 優化 TRPC 批次載入 | ⭐⭐⭐ | ⭐⭐ | 1 小時 |
| 3.3.4 實作圖片格式優化 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 3-4 小時 |
| 3.3.2 移除未使用依賴 | ⭐⭐ | ⭐ | 1 小時 |

**總計**：約 9-12 小時

---

## 五、風險評估

### 5.1 低風險優化（建議優先實施）

- 3.1.2 提取共用隨機排序邏輯
- 3.1.3 優化字體載入
- 3.1.4 實作圖片 Lazy Loading
- 3.2.2 新增資料庫索引
- 3.3.1 實作查詢結果快取
- 3.3.3 實作錯誤邊界

### 5.2 中風險優化（需充分測試）

- 3.1.1 拆分 Home.tsx（需確保動畫和狀態管理正常）
- 3.1.5 優化 TRPC 批次載入（需測試錯誤處理）
- 3.2.1 解決 N+1 查詢問題（需確保資料完整性）
- 3.2.3 拆分 routers.ts（需確保所有 API 正常運作）

### 5.3 高風險優化（建議最後實施）

- 3.3.4 實作圖片格式優化（需處理舊圖片相容性）

---

## 六、實施建議

### 6.1 實施順序

1. **第一週**：實施所有低風險優化（3.1.2, 3.1.3, 3.1.4, 3.2.2）
2. **第二週**：實施高影響力的中風險優化（3.2.1, 3.1.1）
3. **第三週**：實施程式碼重構優化（3.2.3, 3.1.5）
4. **第四週**：實施進階優化（3.3.4, 3.3.5）

### 6.2 測試策略

- **單元測試**：為新增的工具函數（shuffleArray）撰寫測試
- **整合測試**：測試 N+1 查詢優化後的資料完整性
- **效能測試**：使用 Lighthouse 測量優化前後的效能差異
- **視覺回歸測試**：確保 UI 無變化

### 6.3 回滾計畫

- 每個優化項目實施前建立 Git 分支
- 實施後進行充分測試
- 如遇問題可快速回滾至優化前狀態

---

## 七、預期成果

### 7.1 效能提升

- **首頁載入時間**：從 3-4 秒減少至 1.5-2 秒（提升 50%）
- **照片列表載入**：從 2-3 秒減少至 0.5-1 秒（提升 70%）
- **Lighthouse Performance 分數**：從 70-80 提升至 90-95

### 7.2 程式碼品質提升

- **程式碼可讀性**：Home.tsx 和 routers.ts 拆分後更易維護
- **重複程式碼減少**：提取共用邏輯，減少 10-15% 程式碼量
- **測試覆蓋率提升**：新增單元測試，提升至 80%+

### 7.3 使用者體驗提升

- **頁面載入更快**：減少等待時間，提升使用者滿意度
- **滾動更流暢**：虛擬化滾動和 lazy loading 改善體驗
- **錯誤處理更優雅**：Error Boundary 防止應用崩潰

---

## 八、結論

本優化提案提出 15 項具體的改進建議，涵蓋前端效能、後端效能、程式碼品質三大面向。所有優化均在**不影響現有功能**的前提下進行，並提供詳細的實施步驟和風險評估。

**建議優先實施**階段一的 5 項高優先級優化（預計 4-5 小時），可立即獲得顯著的效能提升。階段二的優化可根據實際需求和時間安排逐步實施。

透過這些優化，26phi 攝影作品集網站將在效能、可維護性和使用者體驗方面獲得全面提升，為未來的功能擴展奠定堅實基礎。

---

**附錄**：
- [程式碼審查詳細報告](./CODE_REVIEW.md)（待建立）
- [效能測試基準](./PERFORMANCE_BASELINE.md)（待建立）
- [實施進度追蹤](./OPTIMIZATION_PROGRESS.md)（待建立）
