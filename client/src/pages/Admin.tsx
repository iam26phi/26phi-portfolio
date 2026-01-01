import { useState, useRef, useMemo, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, Upload, GripVertical, Save, X, Menu, Settings, FileText, Image, Palette, FolderOpen, History, Mail, Users, Star } from "lucide-react";
import imageCompression from "browser-image-compression";
import { extractExifData } from "@/lib/exif";
import { SortablePhotoCard } from "@/components/SortablePhotoCard";
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
  displayTitle?: string;
  category: string;
  collaboratorId?: number | null; // Kept for backward compatibility
  collaboratorIds?: number[]; // New: support multiple collaborators
  packageIds?: number[]; // New: support multiple booking packages
  location: string;
  date: string;
  description: string;
  camera?: string;
  lens?: string;
  settings?: string;
  isVisible: number;
  sortOrder: number;
};

export default function Admin() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PhotoFormData | null>(null);
  
  // Smart form prefill: Remember last selected category
  const [uploadCategory, setUploadCategory] = useState<string>(() => {
    const saved = localStorage.getItem('26phi_last_upload_category');
    return saved || "Portrait";
  });
  
  // Update localStorage when category changes
  const handleCategoryChange = (value: string) => {
    setUploadCategory(value);
    localStorage.setItem('26phi_last_upload_category', value);
  };
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
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<number>>(new Set());
  
  // Photo sorting state
  const [sortBy, setSortBy] = useState<string>(() => {
    const saved = localStorage.getItem('26phi_photo_sort');
    return saved || 'uploadTime-desc';
  });
  
  // Update localStorage when sort changes
  const handleSortChange = (value: string) => {
    setSortBy(value);
    localStorage.setItem('26phi_photo_sort', value);
  };
  const [batchCategory, setBatchCategory] = useState<string>("");
  const [isBatchCategoryDialogOpen, setIsBatchCategoryDialogOpen] = useState(false);
  const [isBatchTitleDialogOpen, setIsBatchTitleDialogOpen] = useState(false);
  const [batchTitleValue, setBatchTitleValue] = useState<string>("");
  const [batchTitleMode, setBatchTitleMode] = useState<'replace' | 'prefix' | 'suffix'>('replace');
  const [filterCollaboratorId, setFilterCollaboratorId] = useState<number | null>(null);
  const [sortedPhotos, setSortedPhotos] = useState<Array<{
    id: number;
    src: string;
    alt: string;
    category: string;
    location: string | null;
    date: string | null;
    description: string | null;
    featured: number;
    isVisible: number;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
  }>>([]);
  
  const trpcUtils = trpc.useUtils();
  
  const { data: photos, isLoading, refetch } = trpc.photos.listAll.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });
  
  const { data: categories } = trpc.photoCategories.list.useQuery();
  const { data: collaborators } = trpc.collaborators.listAll.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });
  const { data: packages } = trpc.bookingPackages.listAll.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Load hero slides to track which photos are already in carousel
  const { data: heroSlides, refetch: refetchHeroSlides } = trpc.hero.listAllSlides.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Create a set of photo URLs that are already in carousel
  const carouselPhotoUrls = useMemo(() => {
    if (!heroSlides) return new Set<string>();
    return new Set(heroSlides.map(slide => slide.imageUrl));
  }, [heroSlides]);

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

  // Update sorted photos when data changes, filter changes, or sort option changes
  useEffect(() => {
    if (photos) {
      let filtered = photos;
      if (filterCollaboratorId !== null) {
        filtered = photos.filter(photo => photo.collaboratorId === filterCollaboratorId);
      }
      
      // Apply sorting
      const sorted = [...filtered];
      switch (sortBy) {
        case 'uploadTime-desc':
          sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'uploadTime-asc':
          sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'title-asc':
          sorted.sort((a, b) => (a.alt || '').localeCompare(b.alt || ''));
          break;
        case 'title-desc':
          sorted.sort((a, b) => (b.alt || '').localeCompare(a.alt || ''));
          break;
        case 'category-asc':
          sorted.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
          break;
        case 'sortOrder':
        default:
          sorted.sort((a, b) => a.sortOrder - b.sortOrder);
          break;
      }
      
      setSortedPhotos(sorted);
    }
  }, [photos, filterCollaboratorId, sortBy]);

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

  const batchDeleteMutation = trpc.photos.batchDelete.useMutation({
    onSuccess: (result) => {
      toast.success(`批次刪除完成：成功 ${result.succeeded} 張，失敗 ${result.failed} 張`);
      refetch();
      setSelectedPhotoIds(new Set());
      setIsBatchMode(false);
    },
    onError: (error) => {
      toast.error(`批次刪除失敗: ${error.message}`);
    },
  });

  const batchUpdateCategoryMutation = trpc.photos.batchUpdateCategory.useMutation({
    onSuccess: (result) => {
      toast.success(`批次修改分類完成：成功 ${result.succeeded} 張，失敗 ${result.failed} 張`);
      refetch();
      setSelectedPhotoIds(new Set());
      setIsBatchMode(false);
      setIsBatchCategoryDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`批次修改分類失敗: ${error.message}`);
    },
  });

  const batchUpdateVisibilityMutation = trpc.photos.batchUpdateVisibility.useMutation({
    onSuccess: (result) => {
      toast.success(`批次修改可見性完成：成功 ${result.succeeded} 張，失敗 ${result.failed} 張`);
      refetch();
      setSelectedPhotoIds(new Set());
      setIsBatchMode(false);
    },
    onError: (error) => {
      toast.error(`批次修改可見性失敗: ${error.message}`);
    },
  });

  const batchQuickUpdateMutation = trpc.photos.batchQuickUpdate.useMutation({
    onSuccess: (result) => {
      toast.success(`批次更新完成：成功 ${result.succeeded} 張，失敗 ${result.failed} 張`);
      refetch();
      setSelectedPhotoIds(new Set());
      setIsBatchMode(false);
      setIsBatchTitleDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`批次更新失敗: ${error.message}`);
    },
  });

  const addToCarouselMutation = trpc.hero.addSlideFromPhoto.useMutation({
    onSuccess: () => {
      toast.success("照片已成功加入首頁輪播！");
      // Refetch hero slides to update button states
      refetchHeroSlides();
    },
    onError: (error) => {
      if (error.message.includes("already in carousel")) {
        toast.error("此照片已在輪播中");
      } else {
        toast.error(`加入輪播失敗: ${error.message}`);
      }
    },
  });

  const updatePackagesMutation = trpc.photos.updatePackages.useMutation({
    onSuccess: () => {
      toast.success("方案標籤已更新！");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "更新方案標籤失敗");
    },
  });

  const quickUpdateMutation = trpc.photos.quickUpdate.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast.error(`更新失敗: ${error.message}`);
      refetch(); // Refetch to revert UI
    },
  });

  // Operation handlers
  const handleQuickUpdate = async (photoId: number, field: string, value: string | number) => {
    await quickUpdateMutation.mutateAsync({ id: photoId, field: field as any, value });
  };

  const togglePhotoSelection = (photoId: number) => {
    setSelectedPhotoIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const selectAllPhotos = () => {
    if (selectedPhotoIds.size === sortedPhotos?.length) {
      setSelectedPhotoIds(new Set());
    } else {
      setSelectedPhotoIds(new Set(sortedPhotos?.map(p => p.id) || []));
    }
  };

  const handleBatchDelete = () => {
    if (selectedPhotoIds.size === 0) {
      toast.error("請選擇至少一張照片");
      return;
    }
    if (confirm(`確定要刪除選中的 ${selectedPhotoIds.size} 張照片嗎？`)) {
      batchDeleteMutation.mutate({ ids: Array.from(selectedPhotoIds) });
    }
  };

  const handleBatchUpdateCategory = () => {
    if (selectedPhotoIds.size === 0) {
      toast.error("請選擇至少一張照片");
      return;
    }
    if (!batchCategory) {
      toast.error("請選擇分類");
      return;
    }
    batchUpdateCategoryMutation.mutate({ 
      ids: Array.from(selectedPhotoIds),
      category: batchCategory
    });
  };

  const handleBatchUpdateVisibility = (isVisible: number) => {
    if (selectedPhotoIds.size === 0) {
      toast.error("請選擇至少一張照片");
      return;
    }
    batchUpdateVisibilityMutation.mutate({ 
      ids: Array.from(selectedPhotoIds),
      isVisible
    });
  };

  const handleBatchUpdateTitle = () => {
    if (selectedPhotoIds.size === 0) {
      toast.error("請選擇至少一張照片");
      return;
    }
    if (!batchTitleValue.trim()) {
      toast.error("請輸入標題內容");
      return;
    }
    batchQuickUpdateMutation.mutate({
      ids: Array.from(selectedPhotoIds),
      field: 'displayTitle',
      value: batchTitleValue,
      mode: batchTitleMode,
    });
  };

  const handleBatchUpdateFeatured = (featured: number) => {
    if (selectedPhotoIds.size === 0) {
      toast.error("請選擇至少一張照片");
      return;
    }
    batchQuickUpdateMutation.mutate({
      ids: Array.from(selectedPhotoIds),
      field: 'featured',
      value: featured,
    });
  };

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

        // Extract EXIF data from the original file
        let exifData = {};
        try {
          exifData = await extractExifData(file);
          if (Object.keys(exifData).length > 0) {
            toast.success(`${file.name} EXIF 資訊提取成功`);
          }
        } catch (error) {
          console.error('EXIF extraction error:', error);
        }

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

          const location = (exifData as any).location || "";
          
          // Smart form prefill: Save recent locations
          if (location) {
            const recentLocations = JSON.parse(localStorage.getItem('26phi_recent_locations') || '[]');
            const updated = [location, ...recentLocations.filter((l: string) => l !== location)].slice(0, 5);
            localStorage.setItem('26phi_recent_locations', JSON.stringify(updated));
          }
          
          await createMutation.mutateAsync({
            src: result.url,
            alt: file.name.replace(/\.[^/.]+$/, ""),
            category: uploadCategory,
            location,
            date: (exifData as any).date || new Date().toISOString().split('T')[0],
            description: "",
            camera: (exifData as any).camera,
            lens: (exifData as any).lens,
            settings: (exifData as any).settings,
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Get multiple collaborator IDs
    const collaboratorIdsValues = formData.getAll("collaboratorIds") as string[];
    const collaboratorIds = collaboratorIdsValues
      .filter(v => v && v !== "")
      .map(v => Number(v));
    
    // Get multiple package IDs
    const packageIdsValues = formData.getAll("packageIds") as string[];
    const packageIds = packageIdsValues
      .filter(v => v && v !== "")
      .map(v => Number(v));
    
    const data = {
      src: formData.get("src") as string,
      alt: formData.get("alt") as string,
      displayTitle: formData.get("displayTitle") as string || undefined,
      category: formData.get("category") as string,
      collaboratorIds: collaboratorIds.length > 0 ? collaboratorIds : undefined,
      location: formData.get("location") as string,
      date: formData.get("date") as string,
      description: formData.get("description") as string,
      camera: formData.get("camera") as string || undefined,
      lens: formData.get("lens") as string || undefined,
      settings: formData.get("settings") as string || undefined,
      isVisible: Number(formData.get("isVisible")),
      sortOrder: Number(formData.get("sortOrder")),
    };

    if (editingPhoto?.id) {
      await updateMutation.mutateAsync({ id: editingPhoto.id, ...data });
      // Update package associations
      await updatePackagesMutation.mutateAsync({ photoId: editingPhoto.id, packageIds });
    } else {
      const newPhoto = await createMutation.mutateAsync(data);
      // Update package associations for new photo
      if (newPhoto && packageIds.length > 0) {
        await updatePackagesMutation.mutateAsync({ photoId: newPhoto.id, packageIds });
      }
    }
  };

  const handleEdit = async (photo: any) => {
    setEditingPhoto(photo);
    // Load photo's package associations
    try {
      const packageIds = await trpcUtils.photos.getPackages.fetch({ photoId: photo.id });
      setEditingPhoto({ ...photo, packageIds });
    } catch (error) {
      console.error('Failed to load package associations:', error);
    }
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

  const toggleFeatured = (photo: any) => {
    updateMutation.mutate({
      id: photo.id,
      featured: photo.featured === 1 ? 0 : 1,
    });
  };

  const handleAddToCarousel = (photoId: number) => {
    addToCarouselMutation.mutate({ photoId });
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
    <AdminLayout>
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">照片管理</h1>
            <p className="text-muted-foreground">管理您的作品集照片</p>
          </div>
          <div className="hidden"><DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="font-mono">
                <Menu className="w-4 h-4 mr-2" />
                管理選單
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>網站管理</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = "/admin/hero"}>
                <Image className="w-4 h-4 mr-2" />
                英雄區域設定
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = "/admin/blog"}>
                <FileText className="w-4 h-4 mr-2" />
                部落格管理
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = "/admin/about"}>
                <FileText className="w-4 h-4 mr-2" />
                About 編輯
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>內容管理</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = "/admin/categories"}>
                <FolderOpen className="w-4 h-4 mr-2" />
                分類管理
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = "/admin/projects"}>
                <FolderOpen className="w-4 h-4 mr-2" />
                專案管理
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = "/admin/collaborators"}>
                <Users className="w-4 h-4 mr-2" />
                合作對象
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>系統設定</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = "/admin/watermark"}>
                <Palette className="w-4 h-4 mr-2" />
                浮水印設定
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = "/admin/changelogs"}>
                <History className="w-4 h-4 mr-2" />
                更新日誌
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = "/admin/contact"}>
                <Mail className="w-4 h-4 mr-2" />
                聯絡表單
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = "/admin/packages"}>
                <Settings className="w-4 h-4 mr-2" />
                拍攝方案
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
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
            
            <div className="flex gap-2 items-center flex-wrap">
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="選擇排序方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uploadTime-desc">上傳時間（最新）</SelectItem>
                  <SelectItem value="uploadTime-asc">上傳時間（最舊）</SelectItem>
                  <SelectItem value="title-asc">標題（A-Z）</SelectItem>
                  <SelectItem value="title-desc">標題（Z-A）</SelectItem>
                  <SelectItem value="category-asc">分類（A-Z）</SelectItem>
                  <SelectItem value="sortOrder">自訂排序</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant={isSorting ? "default" : "outline"}
                onClick={() => setIsSorting(!isSorting)}
                disabled={isBatchMode}
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
              
              <Button
                variant={isBatchMode ? "default" : "outline"}
                onClick={() => {
                  setIsBatchMode(!isBatchMode);
                  setSelectedPhotoIds(new Set());
                }}
                disabled={isSorting}
              >
                {isBatchMode ? (
                  <><X className="mr-2 h-4 w-4" /> 取消批次</>
                ) : (
                  <>批次操作</>
                )}
              </Button>
              
              {isBatchMode && (
                <>
                  <Select value={filterCollaboratorId?.toString() || "all"} onValueChange={(value) => {
                    setFilterCollaboratorId(value === "all" ? null : parseInt(value));
                    setSelectedPhotoIds(new Set());
                  }}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="篩選合作對象" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有合作對象</SelectItem>
                      {collaborators?.map((collab) => (
                        <SelectItem key={collab.id} value={collab.id.toString()}>
                          {collab.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={selectAllPhotos}>
                    {selectedPhotoIds.size === sortedPhotos?.length ? "取消全選" : "全選"}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    已選擇 {selectedPhotoIds.size} 張
                  </span>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleBatchDelete}
                    disabled={selectedPhotoIds.size === 0 || batchDeleteMutation.isPending}
                  >
                    {batchDeleteMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 刪除中...</>
                    ) : (
                      <><Trash2 className="mr-2 h-4 w-4" /> 刪除</>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsBatchCategoryDialogOpen(true)}
                    disabled={selectedPhotoIds.size === 0}
                  >
                    修改分類
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleBatchUpdateVisibility(1)}
                    disabled={selectedPhotoIds.size === 0 || batchUpdateVisibilityMutation.isPending}
                  >
                    <Eye className="mr-2 h-4 w-4" /> 顯示
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleBatchUpdateVisibility(0)}
                    disabled={selectedPhotoIds.size === 0 || batchUpdateVisibilityMutation.isPending}
                  >
                    <EyeOff className="mr-2 h-4 w-4" /> 隱藏
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsBatchTitleDialogOpen(true)}
                    disabled={selectedPhotoIds.size === 0}
                  >
                    <Edit className="mr-2 h-4 w-4" /> 修改標題
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleBatchUpdateFeatured(1)}
                    disabled={selectedPhotoIds.size === 0 || batchQuickUpdateMutation.isPending}
                  >
                    <Star className="mr-2 h-4 w-4" /> 設為精選
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleBatchUpdateFeatured(0)}
                    disabled={selectedPhotoIds.size === 0 || batchQuickUpdateMutation.isPending}
                  >
                    <Star className="mr-2 h-4 w-4" /> 取消精選
                  </Button>
                </>
              )}
              <div className="flex items-center gap-2">
              <Select value={uploadCategory} onValueChange={handleCategoryChange}>
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
                  <Label htmlFor="alt">檔案名稱（內部使用）</Label>
                  <Input
                    id="alt"
                    name="alt"
                    defaultValue={editingPhoto?.alt || ""}
                    required
                    placeholder="例如：IMG_1234"
                  />
                </div>

                <div>
                  <Label htmlFor="displayTitle">顯示標題（可選）</Label>
                  <Input
                    id="displayTitle"
                    name="displayTitle"
                    defaultValue={editingPhoto?.displayTitle || ""}
                    placeholder="例如：台北街頭 / Taipei Street"
                  />
                  <p className="text-xs text-gray-500 mt-1">留空則顯示檔案名稱</p>
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

                <div>
                  <Label htmlFor="collaboratorIds">合作對象（可選，可多選）</Label>
                  <select
                    id="collaboratorIds"
                    name="collaboratorIds"
                    multiple
                    defaultValue={editingPhoto?.collaboratorId ? [String(editingPhoto.collaboratorId)] : []}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {collaborators?.map((collab) => (
                      <option key={collab.id} value={String(collab.id)}>{collab.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">按住 Ctrl/Cmd 鍵可選擇多個合作對象</p>
                </div>

                <div>
                  <Label htmlFor="packageIds">拍攝方案標籤（可選，可多選）</Label>
                  <select
                    id="packageIds"
                    name="packageIds"
                    multiple
                    defaultValue={(editingPhoto?.packageIds || []).map((id: number) => String(id))}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {packages?.map((pkg) => (
                      <option key={pkg.id} value={String(pkg.id)}>{pkg.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">按住 Ctrl/Cmd 鍵可選擇多個方案，選中的照片會顯示在對應方案頁面</p>
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

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">器材資訊（可選）</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="camera">相機</Label>
                      <Input
                        id="camera"
                        name="camera"
                        defaultValue={editingPhoto?.camera || ""}
                        placeholder="例如：Sony A1ii"
                      />
                    </div>

                    <div>
                      <Label htmlFor="lens">鏡頭</Label>
                      <Input
                        id="lens"
                        name="lens"
                        defaultValue={editingPhoto?.lens || ""}
                        placeholder="例如：Sony 35mm f/1.4 GM"
                      />
                    </div>

                    <div>
                      <Label htmlFor="settings">拍攝參數</Label>
                      <Input
                        id="settings"
                        name="settings"
                        defaultValue={editingPhoto?.settings || ""}
                        placeholder="例如：ISO 400, f/1.4, 1/200s"
                      />
                    </div>
                  </div>
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
                  <div key={photo.id} className="relative">
                    {isBatchMode && (
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="checkbox"
                          checked={selectedPhotoIds.has(photo.id)}
                          onChange={() => togglePhotoSelection(photo.id)}
                          className="w-5 h-5 cursor-pointer"
                        />
                      </div>
                    )}
                    <SortablePhotoCard
                      photo={photo}
                      categories={categories || []}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleVisibility={toggleVisibility}
                      onToggleFeatured={toggleFeatured}
                      onQuickUpdate={handleQuickUpdate}
                      onAddToCarousel={handleAddToCarousel}
                      isInCarousel={carouselPhotoUrls.has(photo.src)}
                      isAddingToCarousel={addToCarouselMutation.isPending}
                      isSorting={isSorting}
                    />
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Batch Category Dialog */}
      <Dialog open={isBatchCategoryDialogOpen} onOpenChange={setIsBatchCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>批次修改分類</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="batchCategory">選擇新分類</Label>
              <Select value={batchCategory} onValueChange={setBatchCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇分類" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBatchCategoryDialogOpen(false)}>
                取消
              </Button>
              <Button 
                onClick={handleBatchUpdateCategory}
                disabled={!batchCategory || batchUpdateCategoryMutation.isPending}
              >
                {batchUpdateCategoryMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 處理中...</>
                ) : (
                  "確定"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Batch Title Dialog */}
      <Dialog open={isBatchTitleDialogOpen} onOpenChange={setIsBatchTitleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>批次修改標題</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="batchTitleMode">修改模式</Label>
              <Select value={batchTitleMode} onValueChange={(value: any) => setBatchTitleMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="replace">替換模式：完全替換為新標題</SelectItem>
                  <SelectItem value="prefix">前綴模式：在現有標題前加入文字</SelectItem>
                  <SelectItem value="suffix">後綴模式：在現有標題後加入文字</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="batchTitleValue">
                {batchTitleMode === 'replace' ? '新標題' : batchTitleMode === 'prefix' ? '前綴文字' : '後綴文字'}
              </Label>
              <Input
                id="batchTitleValue"
                value={batchTitleValue}
                onChange={(e) => setBatchTitleValue(e.target.value)}
                placeholder={
                  batchTitleMode === 'replace' 
                    ? '輸入新標題' 
                    : batchTitleMode === 'prefix' 
                    ? '輸入要加在前面的文字' 
                    : '輸入要加在後面的文字'
                }
              />
            </div>
            <div className="bg-neutral-900 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">預覽效果：</p>
              <div className="space-y-1">
                {batchTitleMode === 'replace' && batchTitleValue && (
                  <p className="text-sm">所有選中照片的標題將變為：<span className="text-amber-500 font-medium">{batchTitleValue}</span></p>
                )}
                {batchTitleMode === 'prefix' && batchTitleValue && (
                  <p className="text-sm">原標題：「照片標題」 → 新標題：「<span className="text-amber-500 font-medium">{batchTitleValue}</span>照片標題」</p>
                )}
                {batchTitleMode === 'suffix' && batchTitleValue && (
                  <p className="text-sm">原標題：「照片標題」 → 新標題：「照片標題<span className="text-amber-500 font-medium">{batchTitleValue}</span>」</p>
                )}
                {!batchTitleValue && (
                  <p className="text-sm text-muted-foreground">請輸入內容以查看預覽</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                將影響 <span className="text-amber-500 font-medium">{selectedPhotoIds.size}</span> 張照片
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsBatchTitleDialogOpen(false);
                setBatchTitleValue('');
              }}>
                取消
              </Button>
              <Button 
                onClick={handleBatchUpdateTitle}
                disabled={!batchTitleValue.trim() || batchQuickUpdateMutation.isPending}
              >
                {batchQuickUpdateMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 處理中...</>
                ) : (
                  "確定"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
    </AdminLayout>
  );
}
