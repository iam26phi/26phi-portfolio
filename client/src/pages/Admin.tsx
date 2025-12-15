import { useState } from "react";
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
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { getLoginUrl } from "@/const";

type PhotoFormData = {
  id?: number;
  src: string;
  alt: string;
  category: "Portrait" | "Travel" | "Editorial";
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

  const { data: photos, isLoading, refetch } = trpc.photos.listAll.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      src: formData.get("src") as string,
      alt: formData.get("alt") as string,
      category: formData.get("category") as "Portrait" | "Travel" | "Editorial",
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
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingPhoto(null);
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                新增照片
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
                  <Select name="category" defaultValue={editingPhoto?.category || "Portrait"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Portrait">Portrait</SelectItem>
                      <SelectItem value="Travel">Travel</SelectItem>
                      <SelectItem value="Editorial">Editorial</SelectItem>
                    </SelectContent>
                  </Select>
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

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos?.map((photo) => (
              <div
                key={photo.id}
                className="border rounded-lg overflow-hidden bg-card"
              >
                <div className="relative aspect-[4/3]">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover"
                  />
                  {photo.isVisible === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <EyeOff className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg">{photo.alt}</h3>
                    <p className="text-sm text-muted-foreground">
                      {photo.category} • {photo.location} • {photo.date}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleVisibility(photo)}
                    >
                      {photo.isVisible === 1 ? (
                        <><Eye className="h-4 w-4 mr-1" /> 顯示中</>
                      ) : (
                        <><EyeOff className="h-4 w-4 mr-1" /> 已隱藏</>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(photo)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(photo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
