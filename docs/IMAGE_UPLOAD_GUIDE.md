# 圖片上傳功能開發規範

本文檔定義了 26phi Portfolio 專案中所有圖片上傳功能的標準實作流程，確保一致性和可維護性。

## 核心原則

所有圖片上傳功能必須使用 **tRPC photos API**，不得直接呼叫 `/api/upload` 端點或使用其他上傳方式。

### API 選擇指南

- **`photos.upload`**: 用於上傳**作品集照片**，會自動套用浮水印（如果後台有設定）
- **`photos.uploadAvatar`**: 用於上傳**頭像類圖片**（合作對象、About 個人照片），**不會**套用浮水印

## 標準實作流程

### 1. 前端實作

#### 1.1 必要的 State 宣告

```typescript
const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string>("");
const [isUploading, setIsUploading] = useState(false);
```

#### 1.2 引入 Upload Mutation

**作品集照片（帶浮水印）**
```typescript
const uploadMutation = trpc.photos.upload.useMutation();
```

**頭像類圖片（不帶浮水印）**
```typescript
const uploadMutation = trpc.photos.uploadAvatar.useMutation();
```

#### 1.3 檔案選擇處理函數

```typescript
const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
};
```

#### 1.4 上傳函數（標準模板）

```typescript
const uploadImage = async (file: File, category: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const base64 = event.target?.result as string;
        const result = await uploadMutation.mutateAsync({
          file: base64,
          filename: file.name,
          category: category, // 例如: 'collaborators', 'about', 'blog' 等
        });
        resolve(result.url);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('讀取檔案失敗'));
    };
    
    reader.readAsDataURL(file);
  });
};
```

#### 1.5 表單提交處理

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    setIsUploading(true);
    
    let imageUrl = existingImageUrl; // 保留現有圖片 URL
    
    // 如果使用者選擇了新圖片，則上傳
    if (imageFile) {
      imageUrl = await uploadImage(imageFile, 'your-category');
    }

    // 使用新的 imageUrl 更新資料
    const dataToSubmit = {
      ...formData,
      imageField: imageUrl,
    };

    // 呼叫更新或建立 mutation
    mutation.mutate(dataToSubmit);
  } catch (error) {
    toast.error("圖片上傳失敗");
  } finally {
    setIsUploading(false);
  }
};
```

#### 1.6 UI 組件（表單欄位）

```tsx
<div>
  <Label htmlFor="image">圖片</Label>
  <div className="space-y-4">
    {imagePreview && (
      <div className="flex justify-center">
        <img
          src={imagePreview}
          alt="圖片預覽"
          className="w-64 h-64 object-cover border-2 border-border"
        />
      </div>
    )}
    <Input
      id="image"
      type="file"
      accept="image/*"
      onChange={handleImageChange}
      className="cursor-pointer"
    />
    <p className="text-sm text-muted-foreground">
      支援 JPG、PNG、GIF 等圖片格式
    </p>
  </div>
</div>
```

#### 1.7 提交按鈕狀態

```tsx
<Button 
  type="submit" 
  disabled={mutation.isPending || isUploading}
>
  {(mutation.isPending || isUploading) && (
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  )}
  儲存
</Button>
```

### 2. Category 命名規範

不同功能模塊使用不同的 category 值，用於組織 S3 儲存結構：

| 功能模塊 | API | Category 值 | S3 路徑 | 浮水印 |
|---------|-----|------------|---------|------|
| 作品照片 | `photos.upload` | 依分類名稱 | `portfolio/{category}/` | ✅ 是 |
| 合作對象頭像 | `photos.uploadAvatar` | `collaborators` | `avatars/collaborators/` | ❌ 否 |
| About 個人照片 | `photos.uploadAvatar` | `about` | `avatars/about/` | ❌ 否 |
| 部落格圖片 | `photos.upload` | `blog` | `portfolio/blog/` | ✅ 是 |
| 英雄區域背景 | `photos.upload` | `hero` | `portfolio/hero/` | ✅ 是 |

### 3. 後端 API 規格

#### 3.1 photos.upload（帶浮水印）

**路徑**: `trpc.photos.upload`

**用途**: 上傳作品集照片，會自動套用浮水印（如果後台有設定）

**輸入參數**:
```typescript
{
  file: string;      // Base64 編碼的圖片資料
  filename: string;  // 原始檔案名稱
  category: string;  // 分類名稱（用於 S3 路徑組織）
}
```

**返回值**:
```typescript
{
  success: boolean;
  url: string;       // 上傳後的圖片 URL
  key: string;       // S3 儲存路徑
}
```

#### 3.2 photos.uploadAvatar（不帶浮水印）

**路徑**: `trpc.photos.uploadAvatar`

**用途**: 上傳頭像類圖片（合作對象、About 個人照片），**不會**套用浮水印

**輸入參數**:
```typescript
{
  file: string;      // Base64 編碼的圖片資料
  filename: string;  // 原始檔案名稱
  category: string;  // 分類名稱（例如: 'collaborators', 'about'）
}
```

**返回值**:
```typescript
{
  success: boolean;
  url: string;       // 上傳後的圖片 URL
  key: string;       // S3 儲存路徑
}
```

#### 3.3 錯誤處理

- 檔案格式錯誤: 前端應在選擇檔案時驗證 `file.type.startsWith('image/')`
- 上傳失敗: 顯示 toast 錯誤訊息，不影響表單其他欄位
- 網路錯誤: 使用 try-catch 捕獲並提示使用者重試

### 4. 進階功能（可選）

#### 4.1 圖片壓縮

對於大型圖片（> 10MB），建議使用 `browser-image-compression` 套件進行壓縮：

```typescript
import imageCompression from 'browser-image-compression';

const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 10,
    maxWidthOrHeight: 2400,
    useWebWorker: true,
    fileType: file.type,
  };
  
  return await imageCompression(file, options);
};
```

#### 4.2 上傳進度顯示

參考 `Admin.tsx` 中的 `uploadQueue` 實作，提供詳細的上傳進度反饋。

## 常見錯誤

### ❌ 錯誤做法

```typescript
// 錯誤 1: 直接呼叫 /api/upload（已棄用）
const response = await fetch('/api/upload', {
  method: 'POST',
  body: JSON.stringify({ file: base64, filename: file.name }),
});
```

```typescript
// 錯誤 2: 未使用 FileReader 讀取檔案
const result = await uploadMutation.mutateAsync({
  file: file, // 錯誤：應該是 base64 字串
  filename: file.name,
  category: 'test',
});
```

```typescript
// 錯誤 3: 頭像上傳使用 photos.upload（會套用浮水印）
const uploadMutation = trpc.photos.upload.useMutation(); // 應該使用 uploadAvatar
const result = await uploadMutation.mutateAsync({
  file: base64,
  filename: 'avatar.png',
  category: 'collaborators', // 頭像不應該有浮水印
});
```

### ✅ 正確做法

```typescript
// 正確 1: 上傳作品集照片（帶浮水印）
const uploadMutation = trpc.photos.upload.useMutation();
const reader = new FileReader();
reader.onload = async (event) => {
  const base64 = event.target?.result as string;
  const result = await uploadMutation.mutateAsync({
    file: base64,
    filename: file.name,
    category: 'portrait', // 作品集分類
  });
};
reader.readAsDataURL(file);
```

```typescript
// 正確 2: 上傳頭像（不帶浮水印）
const uploadMutation = trpc.photos.uploadAvatar.useMutation();
const reader = new FileReader();
reader.onload = async (event) => {
  const base64 = event.target?.result as string;
  const result = await uploadMutation.mutateAsync({
    file: base64,
    filename: file.name,
    category: 'collaborators', // 或 'about'
  });
};
reader.readAsDataURL(file);
```

## 檢查清單

在實作新的圖片上傳功能時，請確認以下項目：

- [ ] 選擇正確的 API：
  - 作品集照片 → `trpc.photos.upload`（帶浮水印）
  - 頭像類圖片 → `trpc.photos.uploadAvatar`（不帶浮水印）
- [ ] 使用 FileReader 將檔案轉換為 base64
- [ ] 正確設定 category 參數
- [ ] 實作圖片預覽功能
- [ ] 處理上傳中狀態（isUploading）
- [ ] 禁用提交按鈕防止重複提交
- [ ] 顯示錯誤訊息（使用 toast）
- [ ] 驗證檔案類型（僅接受圖片）
- [ ] 測試上傳成功和失敗情境

## 參考實作

完整的參考實作可以在以下檔案中找到：

### 作品集照片（帶浮水印）
- **標準照片上傳**: `client/src/pages/Admin.tsx` (uploadSingleFile 函數)
- **API 實作**: `server/routers.ts` (photos.upload)

### 頭像類圖片（不帶浮水印）
- **合作對象頭像**: `client/src/pages/AdminCollaborators.tsx` (uploadAvatar 函數)
- **About 個人照片**: `client/src/pages/AdminAbout.tsx` (uploadProfileImage 函數)
- **API 實作**: `server/routers.ts` (photos.uploadAvatar)

### 單元測試
- **uploadAvatar 測試**: `server/photos.uploadAvatar.test.ts`

## 更新記錄

- **2025-01-01**: 建立初始版本，統一圖片上傳規範
- **2025-01-30**: 新增 `photos.uploadAvatar` API，區分作品集照片（帶浮水印）和頭像類圖片（不帶浮水印）
