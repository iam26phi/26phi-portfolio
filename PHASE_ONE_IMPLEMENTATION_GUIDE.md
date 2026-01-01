# 階段一優化 - 詳細實施指南

> **目標**：在 4-5 小時內完成 5 項高優先級優化，立即提升網站效能

**預期效果**：
- 首頁載入速度提升 50%
- 照片列表載入速度提升 70%
- Lighthouse Performance 分數提升 15-20 分

---

## 優化 1：字體載入優化（預估 15 分鐘）

### 問題分析

Lithue 字體檔案大小為 2.6MB，在首次載入時會阻塞頁面渲染，造成明顯的字體閃爍（FOUT - Flash of Unstyled Text）。雖然已設定 `font-display: swap`，但字體檔案下載時間過長仍會影響使用者體驗。

### 解決方案

使用 `<link rel="preload">` 提示瀏覽器優先載入字體檔案，減少首次渲染阻塞時間。

### 實施步驟

#### 步驟 1：新增字體 preload 標籤

**檔案**：`client/index.html`

**位置**：在 `<head>` 標籤內，`<title>` 標籤之後

**新增內容**：
```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>26phi Photography Portfolio</title>
  
  <!-- 字體預載入 -->
  <link 
    rel="preload" 
    href="/fonts/lithue-1.1.otf" 
    as="font" 
    type="font/otf" 
    crossorigin="anonymous"
  />
  
</head>
<body>
  <!-- ... -->
</body>
</html>
```

**重要說明**：
- `rel="preload"`：告訴瀏覽器這是高優先級資源
- `as="font"`：指定資源類型為字體
- `type="font/otf"`：指定字體格式（OTF）
- `crossorigin="anonymous"`：必須加入此屬性，否則字體會被下載兩次

#### 步驟 2：驗證現有 CSS 設定

**檔案**：`client/src/index.css`

**檢查內容**：
```css
@font-face {
  font-family: 'Lithue';
  src: url('/fonts/lithue-1.1.otf') format('opentype');
  font-weight: normal;
  font-style: normal;
  font-display: swap; /* ✅ 已正確設定 */
}
```

**確認項目**：
- ✅ `font-display: swap` 已設定（允許在字體載入時先顯示備用字體）
- ✅ 路徑正確（`/fonts/lithue-1.1.otf`）
- ✅ 格式正確（`format('opentype')`）

#### 步驟 3：測試字體載入效能

**使用 Chrome DevTools**：

1. 開啟 Chrome DevTools（F12）
2. 切換到 **Network** 標籤
3. 篩選 **Font** 類型
4. 重新載入頁面（Ctrl+Shift+R 清除快取）
5. 觀察 `lithue-1.1.otf` 的載入時間和優先級

**預期結果**：
- 字體檔案的 **Priority** 應顯示為 **High**
- 字體應在頁面載入早期開始下載
- 首次內容繪製（FCP）時間應減少 200-500ms

**使用 Lighthouse**：

1. 開啟 Chrome DevTools
2. 切換到 **Lighthouse** 標籤
3. 選擇 **Performance** 類別
4. 點擊 **Analyze page load**
5. 檢查 **Opportunities** 區域是否仍有字體相關警告

**預期改善**：
- "Ensure text remains visible during webfont load" 警告應消失或改善
- Performance 分數提升 3-5 分

### 進階優化（可選）

如果希望進一步減少字體檔案大小，可以考慮以下方案：

#### 方案 A：轉換為 WOFF2 格式

WOFF2 格式的壓縮率比 OTF 高 30-40%，可將 2.6MB 減少至約 1.6-1.8MB。

**工具**：使用線上轉換工具或 `fonttools`

```bash
# 安裝 fonttools
pip install fonttools brotli

# 轉換為 WOFF2
pyftsubset lithue-1.1.otf \
  --output-file=lithue-1.1.woff2 \
  --flavor=woff2
```

**更新 CSS**：
```css
@font-face {
  font-family: 'Lithue';
  src: url('/fonts/lithue-1.1.woff2') format('woff2'),
       url('/fonts/lithue-1.1.otf') format('opentype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

#### 方案 B：字體子集化（Subsetting）

僅包含網站實際使用的字元，可大幅減少檔案大小。

**注意**：需要分析網站使用的所有中文字元，實施較複雜，建議後續再考慮。

---

## 優化 2：圖片 Lazy Loading（預估 30 分鐘）

### 問題分析

目前所有照片在頁面載入時同時開始下載，導致：
1. 首頁初始載入時間過長（需下載 20-30 張照片）
2. 浪費頻寬（使用者可能不會滾動到底部）
3. 阻塞其他重要資源的載入

### 解決方案

使用瀏覽器原生的 `loading="lazy"` 屬性，讓照片在接近可視區域時才開始載入。

### 實施步驟

#### 步驟 1：檢查現有 ProgressiveImage 組件

**檔案**：`client/src/components/ProgressiveImage.tsx`

**當前實作**（簡化版）：
```typescript
export function ProgressiveImage({ 
  src, 
  alt, 
  className 
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <div className={className}>
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
```

#### 步驟 2：新增 loading 屬性支援

**更新後的實作**：
```typescript
interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager"; // 新增
  rootMargin?: string; // 新增（可選）
}

export function ProgressiveImage({ 
  src, 
  alt, 
  className,
  loading = "lazy", // 預設為 lazy
  rootMargin = "200px" // 提前 200px 開始載入
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // 使用 Intersection Observer 提供更精細的控制（可選）
  useEffect(() => {
    if (loading === "eager" || !imgRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            observer.unobserve(img);
          }
        });
      },
      { rootMargin }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [loading, rootMargin]);
  
  return (
    <div className={className}>
      <img
        ref={imgRef}
        src={loading === "eager" ? src : undefined}
        data-src={loading === "lazy" ? src : undefined}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
```

**簡化版本（僅使用原生 lazy loading）**：
```typescript
interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

export function ProgressiveImage({ 
  src, 
  alt, 
  className,
  loading = "lazy"
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <div className={className}>
      <img
        src={src}
        alt={alt}
        loading={loading} // ⭐ 關鍵：新增此行
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
```

#### 步驟 3：更新 Home.tsx 照片網格

**檔案**：`client/src/pages/Home.tsx`

**找到照片渲染的位置**（約在第 300-350 行）：
```typescript
{filteredPhotos.map((photo, index) => (
  <motion.div
    key={photo.id}
    variants={photoGridItemVariants}
    className="relative group cursor-pointer"
    onClick={() => setSelectedPhoto(photo)}
  >
    <ProgressiveImage
      src={photo.src}
      alt={photo.alt}
      loading="lazy" // ⭐ 新增此行
      className="w-full h-64 object-cover"
    />
    {/* ... */}
  </motion.div>
))}
```

**重要**：首屏可見的照片（前 6-9 張）應使用 `loading="eager"` 以避免延遲：

```typescript
{filteredPhotos.map((photo, index) => (
  <motion.div
    key={photo.id}
    variants={photoGridItemVariants}
    className="relative group cursor-pointer"
    onClick={() => setSelectedPhoto(photo)}
  >
    <ProgressiveImage
      src={photo.src}
      alt={photo.alt}
      loading={index < 9 ? "eager" : "lazy"} // ⭐ 前 9 張立即載入
      className="w-full h-64 object-cover"
    />
    {/* ... */}
  </motion.div>
))}
```

#### 步驟 4：更新 Packages.tsx 方案照片

**檔案**：`client/src/pages/Packages.tsx`

**找到方案照片渲染的位置**（約在第 100-150 行）：
```typescript
{displayPhotos.slice(0, 3).map((photo, idx) => (
  <motion.img
    key={idx}
    src={photo.src}
    alt={photo.alt}
    loading="lazy" // ⭐ 新增此行
    variants={photoGridItemVariants}
    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
  />
))}
```

#### 步驟 5：測試 Lazy Loading 效果

**使用 Chrome DevTools Network 標籤**：

1. 開啟 Chrome DevTools（F12）
2. 切換到 **Network** 標籤
3. 篩選 **Img** 類型
4. 重新載入頁面
5. 觀察圖片載入順序

**預期結果**：
- 首屏可見的照片（前 9 張）立即開始載入
- 其他照片在滾動接近時才開始載入
- 初始載入的圖片數量從 20-30 張減少至 9-12 張

**使用 Chrome DevTools Performance 標籤**：

1. 開啟 Chrome DevTools
2. 切換到 **Performance** 標籤
3. 點擊 **Record** 並重新載入頁面
4. 停止錄製
5. 檢查 **Network** 區域的圖片載入時間線

**預期改善**：
- 頁面載入完成時間（Load Event）提前 1-2 秒
- 首次內容繪製（FCP）時間減少 500ms-1s
- 最大內容繪製（LCP）時間改善

### 進階優化（可選）

#### 方案 A：使用 Intersection Observer 提供更精細的控制

原生 `loading="lazy"` 的觸發距離由瀏覽器決定，通常是可視區域下方 1000-3000px。如果希望更早或更晚觸發載入，可以使用 Intersection Observer API。

**範例**（已包含在步驟 2 的完整版本中）：
```typescript
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // 圖片進入可視區域，開始載入
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src!;
        observer.unobserve(img);
      }
    });
  },
  { 
    rootMargin: "200px" // 提前 200px 開始載入
  }
);
```

#### 方案 B：實作虛擬化滾動（Virtual Scrolling）

如果照片數量非常多（100+ 張），可以使用 `react-window` 或 `react-virtualized` 實作虛擬化滾動，僅渲染可見區域的 DOM 節點。

**注意**：實施較複雜，建議在階段二再考慮。

---

## 優化 3：提取共用隨機排序邏輯（預估 30 分鐘）

### 問題分析

Fisher-Yates 演算法在 `Home.tsx` 和 `Packages.tsx` 中重複實作，違反 DRY（Don't Repeat Yourself）原則。

### 解決方案

建立共用的 `shuffleArray` 工具函數，並撰寫單元測試確保正確性。

### 實施步驟

#### 步驟 1：建立工具函數

**檔案**：`client/src/lib/utils.ts`

**位置**：在檔案末尾新增

**新增內容**：
```typescript
/**
 * 使用 Fisher-Yates 演算法隨機打亂陣列
 * @param array 要打亂的陣列
 * @returns 打亂後的新陣列（不修改原陣列）
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]; // 建立副本，不修改原陣列
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

#### 步驟 2：更新 Home.tsx

**檔案**：`client/src/pages/Home.tsx`

**找到現有的隨機排序邏輯**（約在第 69-79 行）：
```typescript
// ❌ 移除此段程式碼
useEffect(() => {
  if (photosRaw.length > 0 && photos.length === 0) {
    const shuffled = [...photosRaw];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setPhotos(shuffled);
  }
}, [photosRaw, photos.length]);
```

**替換為**：
```typescript
// ✅ 使用共用函數
import { shuffleArray } from "@/lib/utils"; // 新增 import

// ... 在組件內部

useEffect(() => {
  if (photosRaw.length > 0 && photos.length === 0) {
    setPhotos(shuffleArray(photosRaw));
  }
}, [photosRaw, photos.length]);
```

**或使用 useMemo（更佳）**：
```typescript
// 移除 useState 和 useEffect，直接使用 useMemo
const photos = useMemo(() => {
  return photosRaw.length > 0 ? shuffleArray(photosRaw) : [];
}, [photosRaw]);
```

**對英雄輪播也做相同處理**（約在第 94-103 行）：
```typescript
// ❌ 移除此段程式碼
useEffect(() => {
  if (heroSlidesRaw.length > 0 && heroSlides.length === 0) {
    const shuffled = [...heroSlidesRaw];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setHeroSlides(shuffled);
  }
}, [heroSlidesRaw, heroSlides.length]);
```

**替換為**：
```typescript
// ✅ 使用共用函數
const heroSlides = useMemo(() => {
  return heroSlidesRaw.length > 0 ? shuffleArray(heroSlidesRaw) : [];
}, [heroSlidesRaw]);
```

#### 步驟 3：更新 Packages.tsx

**檔案**：`client/src/pages/Packages.tsx`

**找到 PackageCard 組件內的隨機排序邏輯**（約在第 50-70 行）：
```typescript
// ❌ 移除此段程式碼
useEffect(() => {
  if (photos && photos.length > 0) {
    const shuffled = [...photos];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setDisplayPhotos(shuffled.slice(0, 3));
  }
}, [photos]);
```

**替換為**：
```typescript
// ✅ 使用共用函數
import { shuffleArray } from "@/lib/utils"; // 新增 import

// ... 在 PackageCard 組件內部

useEffect(() => {
  if (photos && photos.length > 0) {
    setDisplayPhotos(shuffleArray(photos).slice(0, 3));
  }
}, [photos]);
```

**或使用 useMemo（更佳）**：
```typescript
const displayPhotos = useMemo(() => {
  return photos && photos.length > 0 
    ? shuffleArray(photos).slice(0, 3) 
    : [];
}, [photos]);
```

#### 步驟 4：撰寫單元測試

**檔案**：`server/shuffle.test.ts`（已存在）

**檢查測試內容**：
```typescript
import { describe, it, expect } from 'vitest';

// 將 shuffleArray 移至 shared/utils.ts 以便後端測試
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

describe('shuffleArray', () => {
  it('should return an array of the same length', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result).toHaveLength(input.length);
  });

  it('should contain all original elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result.sort()).toEqual(input.sort());
  });

  it('should not modify the original array', () => {
    const input = [1, 2, 3, 4, 5];
    const original = [...input];
    shuffleArray(input);
    expect(input).toEqual(original);
  });

  it('should produce different orders', () => {
    const input = [1, 2, 3, 4, 5];
    const results = new Set<string>();
    
    for (let i = 0; i < 100; i++) {
      results.add(JSON.stringify(shuffleArray(input)));
    }
    
    // 100 次測試應產生至少 30 種不同順序
    expect(results.size).toBeGreaterThan(30);
  });
});
```

**執行測試**：
```bash
cd /home/ubuntu/26phi_portfolio
pnpm test shuffle
```

**預期結果**：所有測試通過 ✅

---

## 優化 4：解決 N+1 查詢問題（預估 2-3 小時）

### 問題分析

`getAllPhotos()` 函數對每張照片單獨查詢協作者資訊，導致：
- 如果有 100 張照片，需執行 101 次資料庫查詢（1 次查照片 + 100 次查協作者）
- 照片列表載入時間長達 2-3 秒
- 資料庫負載過高

### 解決方案

使用 `inArray` 一次查詢所有照片的協作者，然後在記憶體中組合結果。

### 實施步驟

#### 步驟 1：檢查現有實作

**檔案**：`server/db.ts`

**找到 getAllPhotos 函數**（約在第 93-140 行）：
```typescript
export async function getAllPhotos() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get photos: database not available");
    return [];
  }

  const photos = await db.select().from(photos).orderBy(photos.sortOrder);

  // ❌ N+1 查詢問題
  const photosWithCollaborators = await Promise.all(
    photos.map(async (photo) => {
      const collaboratorsResult = await db
        .select({
          id: collaborators.id,
          name: collaborators.name,
          slug: collaborators.slug,
          instagram: collaborators.instagram,
        })
        .from(photoCollaborators)
        .leftJoin(collaborators, eq(photoCollaborators.collaboratorId, collaborators.id))
        .where(eq(photoCollaborators.photoId, photo.id)); // ⚠️ 每張照片查詢一次

      return {
        ...photo,
        collaborators: collaboratorsResult.filter((c) => c.id !== null),
      };
    })
  );

  return photosWithCollaborators;
}
```

#### 步驟 2：重構為批次查詢

**新的實作**：
```typescript
import { inArray } from 'drizzle-orm'; // 新增 import

export async function getAllPhotos() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get photos: database not available");
    return [];
  }

  // 1. 查詢所有照片
  const photosList = await db.select().from(photos).orderBy(photos.sortOrder);

  if (photosList.length === 0) {
    return [];
  }

  // 2. 一次查詢所有照片的協作者
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
    .where(inArray(photoCollaborators.photoId, photoIds)); // ✅ 一次查詢所有

  // 3. 建立 Map 以便快速查找
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

  // 4. 組合結果
  return photosList.map((photo) => ({
    ...photo,
    collaborators: collaboratorsByPhoto.get(photo.id) || [],
  }));
}
```

#### 步驟 3：對 getVisiblePhotos 做相同處理

**檔案**：`server/db.ts`

**找到 getVisiblePhotos 函數**（約在第 142-180 行）：

**套用相同的重構模式**：
```typescript
export async function getVisiblePhotos() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get photos: database not available");
    return [];
  }

  // 1. 查詢所有可見照片
  const photosList = await db
    .select()
    .from(photos)
    .where(eq(photos.isVisible, 1))
    .orderBy(photos.sortOrder);

  if (photosList.length === 0) {
    return [];
  }

  // 2. 一次查詢所有照片的協作者
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

  // 3. 建立 Map
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

  // 4. 組合結果
  return photosList.map((photo) => ({
    ...photo,
    collaborators: collaboratorsByPhoto.get(photo.id) || [],
  }));
}
```

#### 步驟 4：提取共用邏輯（可選但建議）

由於 `getAllPhotos` 和 `getVisiblePhotos` 有大量重複的協作者查詢邏輯，可以提取為共用函數：

```typescript
/**
 * 批次查詢照片的協作者資訊
 * @param photosList 照片列表
 * @returns 包含協作者資訊的照片列表
 */
async function attachCollaboratorsToPhotos<T extends { id: number }>(
  photosList: T[]
): Promise<(T & { collaborators: Array<{
  id: number | null;
  name: string | null;
  slug: string | null;
  instagram: string | null;
}> })[]> {
  const db = await getDb();
  if (!db || photosList.length === 0) {
    return photosList.map(photo => ({ ...photo, collaborators: [] }));
  }

  // 一次查詢所有照片的協作者
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

  // 建立 Map
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

  // 組合結果
  return photosList.map((photo) => ({
    ...photo,
    collaborators: collaboratorsByPhoto.get(photo.id) || [],
  }));
}

// 簡化後的 getAllPhotos
export async function getAllPhotos() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get photos: database not available");
    return [];
  }

  const photosList = await db.select().from(photos).orderBy(photos.sortOrder);
  return await attachCollaboratorsToPhotos(photosList);
}

// 簡化後的 getVisiblePhotos
export async function getVisiblePhotos() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get photos: database not available");
    return [];
  }

  const photosList = await db
    .select()
    .from(photos)
    .where(eq(photos.isVisible, 1))
    .orderBy(photos.sortOrder);
  
  return await attachCollaboratorsToPhotos(photosList);
}
```

#### 步驟 5：測試資料完整性

**執行現有測試**：
```bash
cd /home/ubuntu/26phi_portfolio
pnpm test photos
```

**預期結果**：所有測試通過，確保資料完整性未受影響

**手動測試**：
1. 啟動開發伺服器
2. 開啟首頁
3. 檢查照片是否正確顯示協作者資訊
4. 開啟 Chrome DevTools Network 標籤
5. 觀察 API 回應時間

**預期改善**：
- `photos.list` API 回應時間從 2-3 秒減少至 300-500ms
- 資料庫查詢次數從 100+ 次減少至 2 次

---

## 優化 5：新增資料庫索引（預估 30 分鐘）

### 問題分析

photos 表的 `category`、`location`、`date` 等欄位經常用於篩選查詢，但未建立索引，導致全表掃描，效能差。

### 解決方案

為常用的篩選欄位建立索引，加快查詢速度。

### 實施步驟

#### 步驟 1：建立 migration 檔案

**執行指令**：
```bash
cd /home/ubuntu/26phi_portfolio
pnpm drizzle-kit generate
```

**手動建立 migration 檔案**（如果自動生成失敗）：

**檔案**：`drizzle/migrations/0001_add_photos_indexes.sql`

**內容**：
```sql
-- 為 photos 表新增索引以提升查詢效能

-- 分類篩選索引
CREATE INDEX IF NOT EXISTS idx_photos_category ON photos(category);

-- 地點篩選索引
CREATE INDEX IF NOT EXISTS idx_photos_location ON photos(location);

-- 日期篩選索引
CREATE INDEX IF NOT EXISTS idx_photos_date ON photos(date);

-- 精選照片篩選索引
CREATE INDEX IF NOT EXISTS idx_photos_featured ON photos(featured);

-- 可見性篩選索引
CREATE INDEX IF NOT EXISTS idx_photos_is_visible ON photos(isVisible);

-- 排序索引
CREATE INDEX IF NOT EXISTS idx_photos_sort_order ON photos(sortOrder);

-- 複合索引：可見性 + 排序（最常用的組合）
CREATE INDEX IF NOT EXISTS idx_photos_visible_sort ON photos(isVisible, sortOrder);
```

#### 步驟 2：執行 migration

**方法 A：使用 drizzle-kit**：
```bash
cd /home/ubuntu/26phi_portfolio
pnpm db:push
```

**方法 B：手動執行 SQL**（如果 drizzle-kit 失敗）：
```bash
# 連接到資料庫
mysql -h <host> -u <user> -p <database>

# 執行 SQL 檔案
source drizzle/migrations/0001_add_photos_indexes.sql;

# 驗證索引已建立
SHOW INDEX FROM photos;
```

#### 步驟 3：驗證索引效果

**執行 EXPLAIN 查詢**：
```sql
-- 優化前（全表掃描）
EXPLAIN SELECT * FROM photos WHERE category = 'Portrait' AND isVisible = 1 ORDER BY sortOrder;
-- type: ALL, rows: 100+

-- 優化後（使用索引）
EXPLAIN SELECT * FROM photos WHERE category = 'Portrait' AND isVisible = 1 ORDER BY sortOrder;
-- type: ref, rows: 10-20, key: idx_photos_category 或 idx_photos_visible_sort
```

**測試查詢效能**：
```bash
# 在開發伺服器中測試
cd /home/ubuntu/26phi_portfolio
pnpm test photos
```

**預期改善**：
- 篩選查詢速度提升 5-10 倍
- 資料庫 CPU 使用率降低

---

## 實施檢查清單

### 優化 1：字體載入優化 ✅
- [ ] 在 `client/index.html` 新增 preload 標籤
- [ ] 驗證 `client/src/index.css` 的 font-display 設定
- [ ] 使用 Chrome DevTools Network 測試字體載入優先級
- [ ] 使用 Lighthouse 測量效能改善

### 優化 2：圖片 Lazy Loading ✅
- [ ] 更新 `client/src/components/ProgressiveImage.tsx` 新增 loading 屬性
- [ ] 更新 `client/src/pages/Home.tsx` 照片網格啟用 lazy loading
- [ ] 更新 `client/src/pages/Packages.tsx` 方案照片啟用 lazy loading
- [ ] 使用 Chrome DevTools Network 測試圖片載入順序
- [ ] 使用 Chrome DevTools Performance 測量效能改善

### 優化 3：提取共用隨機排序邏輯 ✅
- [ ] 在 `client/src/lib/utils.ts` 建立 shuffleArray 函數
- [ ] 更新 `client/src/pages/Home.tsx` 使用新函數（照片和輪播）
- [ ] 更新 `client/src/pages/Packages.tsx` 使用新函數
- [ ] 執行 `pnpm test shuffle` 確保測試通過

### 優化 4：解決 N+1 查詢問題 ✅
- [ ] 重構 `server/db.ts` 的 getAllPhotos 函數
- [ ] 重構 `server/db.ts` 的 getVisiblePhotos 函數
- [ ] （可選）提取 attachCollaboratorsToPhotos 共用函數
- [ ] 執行 `pnpm test photos` 確保資料完整性
- [ ] 使用 Chrome DevTools Network 測量 API 回應時間改善

### 優化 5：新增資料庫索引 ✅
- [ ] 建立 `drizzle/migrations/0001_add_photos_indexes.sql`
- [ ] 執行 `pnpm db:push` 或手動執行 SQL
- [ ] 執行 `SHOW INDEX FROM photos` 驗證索引已建立
- [ ] 執行 `EXPLAIN` 查詢驗證索引使用
- [ ] 測試篩選查詢效能改善

---

## 效能測量

### 優化前基準

使用 Lighthouse 測量當前效能：

```bash
# 開啟 Chrome DevTools > Lighthouse
# 選擇 Performance 類別
# 點擊 Analyze page load
```

**記錄以下指標**：
- Performance Score: ____ / 100
- First Contentful Paint (FCP): ____ ms
- Largest Contentful Paint (LCP): ____ ms
- Total Blocking Time (TBT): ____ ms
- Cumulative Layout Shift (CLS): ____
- Speed Index: ____ ms

### 優化後測量

完成所有優化後，重新測量並比較：

| 指標 | 優化前 | 優化後 | 改善幅度 |
|-----|--------|--------|---------|
| Performance Score | | | |
| FCP | | | |
| LCP | | | |
| TBT | | | |
| CLS | | | |
| Speed Index | | | |

**預期改善目標**：
- Performance Score: +15-20 分
- FCP: -200-500ms
- LCP: -500-1000ms
- 照片列表載入時間: -70%

---

## 常見問題

### Q1：字體 preload 後仍有閃爍？

**A**：確認以下項目：
1. `crossorigin="anonymous"` 屬性是否正確設定
2. 字體路徑是否正確（`/fonts/lithue-1.1.otf`）
3. `font-display: swap` 是否設定
4. 瀏覽器快取是否清除（Ctrl+Shift+R）

### Q2：圖片 lazy loading 不生效？

**A**：檢查以下項目：
1. `loading="lazy"` 屬性是否正確設定
2. 首屏照片是否使用 `loading="eager"`
3. 瀏覽器是否支援（Chrome 76+, Firefox 75+）
4. 圖片是否在可視區域內（應在區域外才會 lazy load）

### Q3：N+1 查詢優化後資料不完整？

**A**：檢查以下項目：
1. `inArray` import 是否正確
2. Map 的 key 是否正確（photoId）
3. 過濾 `collab.id !== null` 是否正確
4. 執行測試確認資料完整性

### Q4：資料庫索引建立失敗？

**A**：檢查以下項目：
1. 資料庫連線是否正常
2. 是否有足夠的權限（CREATE INDEX）
3. 表名和欄位名是否正確
4. 是否有重複的索引名稱

---

## 下一步

完成階段一優化後，建議：

1. **測量並記錄效能改善**：使用 Lighthouse 和 Chrome DevTools 量化改進效果
2. **監控生產環境效能**：使用 Google Analytics 或其他工具追蹤真實使用者體驗
3. **規劃階段二優化**：根據效能測量結果，決定是否實施階段二的優化項目

---

**祝優化順利！如有任何問題，請隨時詢問。** 🚀
