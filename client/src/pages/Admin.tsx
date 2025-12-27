import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, Upload, GripVertical, Save, X } from "lucide-react";
import imageCompression from "browser-image-compression";
import { SortablePhotoCard } from "@/components/SortablePhotoCard";
import { useRef } from "react";
import { getLoginUrl } from "@/const";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type PhotoFormData = {
  id?: number;
  src: string;
  alt: string;
  category: string;
  location: string;
  date: string;
  description: string;
  isVisible: number;
  sortOrder: number;
};

export default function Admin() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PhotoFormData | null>(null);
  const [uploadCategory, setUploadCategory] = useState<string>("Portrait");
  const [uploadQueue, setUploadQueue] = useState<Array<{
    id: string;
    filename: string;
    progress: number;
    stage: "compressing" | "reading" | "uploading" | "creating" | "done" | "error";
    estimatedTime: number | null;
    error?: string;
  }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSorting, setIsSorting] = useState(false);
  const [sortedPhotos, setSortedPhotos] = useState<Array<{
    id: number;
    src: string;
    alt: string;
    category: string;
    location: string | null;
    date: string | null;
    description: string | null;
    isVisible: number;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
  }>>([]);
  
  const { data: photos, isLoading, refetch } = trpc.photos.listAll.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });
  
  const { data: categories } = trpc.photoCategories.list.useQuery();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateOrderMutation = trpc.photos.updateOrder.useMutation({
    onSuccess: () => {
      toast.success("排序已更新");
      refetch();
      setIsSorting(false);
    },
    onError: (error) => {
      toast.error(`更新排序失敗: ${error.message}`);
    },
  });

  // Update sorted photos when data changes
  useEffect(() => {
    if (photos) {
      setSortedPhotos([...photos].sort((a, b) => a.sortOrder - b.sortOrder));
    }
  }, [photos]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && sortedPhotos) {
      setSortedPhotos((items) => {
        if (!items) return [];
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveOrder = async () => {
    if (!sortedPhotos) return;
    const updates = sortedPhotos.map((photo, index) => ({
      id: photo.id,
      sortOrder: index,
    }));
    await updateOrderMutation.mutateAsync(updates);
  };

  const createMutation = trpc.photos.create.useMutation({
    onSuccess: () => {
      toast.success("照片已成功新增");
      refetch();
      setIsDialogOpen(false);
      setEditingPhoto(null);
    },
    onError: (error) => {
      toast.error(`新增失敗: ${error.message}`);
    },
  });

  const updateMutation = trpc.photos.update.useMutation({
    onSuccess: () => {
      toast.success("照片已成功更新");
      refetch();
      setIsDialogOpen(false);
      setEditingPhoto(null);
    },
    onError: (error) => {
      toast.error(`更新失敗: ${error.message}`);
    },
  });

  const deleteMutation = trpc.photos.delete.useMutation({
    onSuccess: () => {
      toast.success("照片已成功刪除");
      refetch();
    },
    onError: (error) => {
      toast.error(`刪除失敗: ${error.message}`);
    },
  });

  const uploadMutation = trpc.photos.upload.useMutation();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate all files
    const invalidFiles = files.filter(f => !f.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      toast.error(`${invalidFiles.length} 個檔案不是圖片格式，已跳過`);
    }

    const validFiles = files.filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    // Initialize upload queue
    const newQueue = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      filename: file.name,
      progress: 0,
      stage: "reading" as const,
      estimatedTime: Math.ceil(file.size / (1024 * 1024)),
    }));

    setUploadQueue(newQueue);

    // Upload files sequentially
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const queueItem = newQueue[i];

      try {
        await uploadSingleFile(file, queueItem.id);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }

    // Clear queue after a delay
    setTimeout(() => {
      setUploadQueue([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 2000);
  };

  const uploadSingleFile = async (file: File, queueId: string) => {
    const updateQueueItem = (updates: Partial<typeof uploadQueue[0]>) => {
      setUploadQueue(prev => prev.map(item => 
        item.id === queueId ? { ...item, ...updates } : item
      ));
    };

    let fileToUpload = file;
    const fileSizeMB = file.size / (1024 * 1024);

    // Compress image if larger than 10MB
    if (fileSizeMB > 10) {
      updateQueueItem({ stage: "compressing", progress: 0 });

      const options = {
        maxSizeMB: 10,
        maxWidthOrHeight: 2400,
        useWebWorker: true,
        fileType: file.type,
      };

      try {
        fileToUpload = await imageCompression(file, options);
        const compressedSizeMB = fileToUpload.size / (1024 * 1024);
        toast.success(`${file.name} 壓縮完成：${fileSizeMB.toFixed(2)}MB → ${compressedSizeMB.toFixed(2)}MB`);
      } catch (compressionError) {
        console.error("Compression error:", compressionError);
        toast.warning(`${file.name} 壓縮失敗，將使用原始檔案`);
      }
    }

    const startTime = Date.now();
    const estimatedSeconds = Math.ceil(fileToUpload.size / (1024 * 1024));

    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 30);
          updateQueueItem({ progress });

          const elapsed = (Date.now() - startTime) / 1000;
          const rate = event.loaded / elapsed;
          const remaining = (event.total - event.loaded) / rate;
          updateQueueItem({ estimatedTime: Math.ceil(remaining) });
        }
      };

      reader.onload = async (event) => {
        updateQueueItem({ progress: 30, stage: "uploading" });

        const base64 = event.target?.result as string;
        const uploadStartTime = Date.now();

        const progressInterval = setInterval(() => {
          const elapsed = (Date.now() - uploadStartTime) / 1000;
          const calculatedProgress = 30 + Math.min(50, (elapsed / estimatedSeconds) * 50);
          const remaining = Math.max(0, estimatedSeconds - elapsed);
          
          updateQueueItem({ 
            progress: Math.round(calculatedProgress),
            estimatedTime: Math.ceil(remaining)
          });
        }, 500);

        try {
          const result = await uploadMutation.mutateAsync({
            file: base64,
            filename: file.name,
            category: uploadCategory,
          });

          clearInterval(progressInterval);
          updateQueueItem({ progress: 90, stage: "creating" });

          await createMutation.mutateAsync({
            src: result.url,
            alt: file.name.replace(/\.[^/.]+$/, ""),
            category: uploadCategory,
            location: "",
            date: new Date().toISOString().split('T')[0],
            description: "",
            isVisible: 1,
            sortOrder: 0,
          });

          updateQueueItem({ progress: 100, stage: "done", estimatedTime: 0 });
          toast.success(`${file.name} 上傳成功`);
          resolve();
        } catch (error: any) {
          clearInterval(progressInterval);
          updateQueueItem({ 
            stage: "error", 
            error: error.message,
            estimatedTime: 0
          });
          toast.error(`${file.name} 上傳失敗: ${error.message}`);
          reject(error);
        }
      };

      reader.onerror = () => {
        updateQueueItem({ stage: "error", error: "讀取檔案失敗" });
        toast.error(`${file.name} 讀取失敗`);
        reject(new Error("讀取檔案失敗"));
      };

      reader.readAsDataURL(fileToUpload);
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      src: formData.get("src") as string,
      alt: formData.get("alt") as string,
      category: formData.get("category") as string,
      location: formData.get("location") as string,
      date: formData.get("date") as string,
      description: formData.get("description") as string,
      isVisible: Number(formData.get("isVisible")),
      sortOrder: Number(formData.get("sortOrder")),
    };

    if (editingPhoto?.id) {
      updateMutation.mutate({ id: editingPhoto.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (photo: any) => {
    setEditingPhoto(photo);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("確定要刪除這張照片嗎？")) {
      deleteMutation.mutate({ id });
    }
  };

  const toggleVisibility = (photo: any) => {
    updateMutation.mutate({
      id: photo.id,
      isVisible: photo.isVisible === 1 ? 0 : 1,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">請先登入</h1>
        <Button onClick={() => window.location.href = getLoginUrl()}>
          登入
        </Button>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">您沒有權限訪問此頁面</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">照片管理</h1>
            <p className="text-muted-foreground">管理您的作品集照片</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.href = "/admin/hero"}
              className="font-mono"
            >
              英雄區域設定
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/admin/blog"}
              className="font-mono"
            >
              部落格管理
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/admin/about"}
              className="font-mono"
            >
              About 編輯
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/admin/categories"}
              className="font-mono"
            >
              分類管理
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/admin/watermark"}
              className="font-mono"
            >
              浮水印設定
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/admin/projects"}
              className="font-mono"
            >
              專案管理
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/admin/changelogs"}
              className="font-mono"
            >
              更新日誌
            </Button>
          </div>
          
          <div className="flex flex-col gap-4">
            {uploadQueue.length > 0 && (
              <div className="bg-card border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-sm">上傳中 ({uploadQueue.filter(q => q.stage === "done").length}/{uploadQueue.length})</h3>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {uploadQueue.map((item) => (
                    <div key={item.id} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium truncate max-w-[200px]" title={item.filename}>
                          {item.filename}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          {item.stage === "done" && <span className="text-green-600">✓ 完成</span>}
                          {item.stage === "error" && <span className="text-red-600">✗ 失敗</span>}
                          {item.stage === "compressing" && <span className="text-blue-600">壓縮中...</span>}
                          {item.stage === "reading" && <span>讀取中...</span>}
                          {item.stage === "uploading" && <span>上傳中...</span>}
                          {item.stage === "creating" && <span>建立中...</span>}
                          {item.stage !== "done" && item.stage !== "error" && (
                            <>
                              {item.progress}%
                              {item.estimatedTime !== null && item.estimatedTime > 0 && (
                                <> · {item.estimatedTime}s</>
                              )}
                            </>
                          )}
                        </span>
                      </div>
                      {item.stage !== "done" && item.stage !== "error" && (
                        <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-300 ease-out"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}
                      {item.error && (
                        <p className="text-xs text-red-600">{item.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-2 items-center">
              <Button
                variant={isSorting ? "default" : "outline"}
                onClick={() => setIsSorting(!isSorting)}
              >
                {isSorting ? (
                  <><X className="mr-2 h-4 w-4" /> 取消排序</>
                ) : (
                  <><GripVertical className="mr-2 h-4 w-4" /> 調整順序</>
                )}
              </Button>
              {isSorting && (
                <Button
                  onClick={handleSaveOrder}
                  disabled={updateOrderMutation.isPending}
                >
                  {updateOrderMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 儲存中...</>
                  ) : (
                    <><Save className="mr-2 h-4 w-4" /> 儲存順序</>
                  )}
                </Button>
              )}
              <div className="flex items-center gap-2">
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="選擇分類" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="photo-upload"
                disabled={uploadQueue.length > 0}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadQueue.length > 0}
                variant="outline"
              >
                {uploadQueue.length > 0 ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 上傳中...</>
                ) : (
                  <><Upload className="mr-2 h-4 w-4" /> 上傳照片</>
                )}
              </Button>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingPhoto(null);
                    setIsDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  手動新增
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPhoto ? "編輯照片" : "新增照片"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="src">圖片路徑 / URL</Label>
                  <Input
                    id="src"
                    name="src"
                    defaultValue={editingPhoto?.src || ""}
                    required
                    placeholder="/images/portfolio/..."
                  />
                </div>

                <div>
                  <Label htmlFor="alt">標題</Label>
                  <Input
                    id="alt"
                    name="alt"
                    defaultValue={editingPhoto?.alt || ""}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">分類</Label>
                  <select
                    id="category"
                    name="category"
                    defaultValue={editingPhoto?.category || ""}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>選擇分類</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">地點</Label>
                    <Input
                      id="location"
                      name="location"
                      defaultValue={editingPhoto?.location || ""}
                    />
                  </div>

                  <div>
                    <Label htmlFor="date">日期</Label>
                    <Input
                      id="date"
                      name="date"
                      defaultValue={editingPhoto?.date || ""}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingPhoto?.description || ""}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="isVisible">顯示狀態</Label>
                    <Select name="isVisible" defaultValue={String(editingPhoto?.isVisible ?? 1)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">顯示</SelectItem>
                        <SelectItem value="0">隱藏</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="sortOrder">排序</Label>
                    <Input
                      id="sortOrder"
                      name="sortOrder"
                      type="number"
                      defaultValue={editingPhoto?.sortOrder || 0}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingPhoto ? "更新" : "新增"}
                  </Button>
                </div>
              </form>
            </DialogContent>
            </Dialog>
              </div>
            </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8" />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedPhotos.map((p) => p.id)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedPhotos.map((photo) => (
                  <SortablePhotoCard
                    key={photo.id}
                    photo={photo}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleVisibility={toggleVisibility}
                    isSorting={isSorting}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
