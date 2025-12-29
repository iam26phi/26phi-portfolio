import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type Collaborator = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  avatar: string | null;
  website: string | null;
  instagram: string | null;
  email: string | null;
  isVisible: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export default function AdminCollaborators() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    avatar: "",
    website: "",
    instagram: "",
    email: "",
    isVisible: 1,
    sortOrder: 0,
  });

  const utils = trpc.useUtils();
  const { data: collaborators, isLoading } = trpc.collaborators.listAll.useQuery();

  const createMutation = trpc.collaborators.create.useMutation({
    onSuccess: () => {
      utils.collaborators.listAll.invalidate();
      toast.success("合作對象已建立");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`建立失敗：${error.message}`);
    },
  });

  const updateMutation = trpc.collaborators.update.useMutation({
    onSuccess: () => {
      utils.collaborators.listAll.invalidate();
      toast.success("合作對象已更新");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`更新失敗：${error.message}`);
    },
  });

  const deleteMutation = trpc.collaborators.delete.useMutation({
    onSuccess: () => {
      utils.collaborators.listAll.invalidate();
      toast.success("合作對象已刪除");
    },
    onError: (error) => {
      toast.error(`刪除失敗：${error.message}`);
    },
  });

  const handleOpenDialog = (collaborator?: Collaborator) => {
    if (collaborator) {
      setEditingCollaborator(collaborator);
      setAvatarPreview(collaborator.avatar || "");
      setAvatarFile(null);
      setFormData({
        name: collaborator.name,
        slug: collaborator.slug,
        description: collaborator.description || "",
        avatar: collaborator.avatar || "",
        website: collaborator.website || "",
        instagram: collaborator.instagram || "",
        email: collaborator.email || "",
        isVisible: collaborator.isVisible,
        sortOrder: collaborator.sortOrder,
      });
    } else {
      setEditingCollaborator(null);
      setAvatarPreview("");
      setAvatarFile(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        avatar: "",
        website: "",
        instagram: "",
        email: "",
        isVisible: 1,
        sortOrder: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCollaborator(null);
    setAvatarFile(null);
    setAvatarPreview("");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file: base64,
              filename: file.name,
              folder: 'collaborators',
            }),
          });
          
          if (!response.ok) throw new Error('Upload failed');
          
          const data = await response.json();
          resolve(data.url);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug) {
      toast.error("請填寫必填欄位");
      return;
    }

    try {
      setIsUploading(true);
      
      let avatarUrl = formData.avatar;
      
      // If user selected a new avatar file, upload it
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      const dataToSubmit = {
        ...formData,
        avatar: avatarUrl || undefined,
      };

      if (editingCollaborator) {
        updateMutation.mutate({
          id: editingCollaborator.id,
          ...dataToSubmit,
        });
      } else {
        createMutation.mutate(dataToSubmit);
      }
    } catch (error) {
      toast.error("頭像上傳失敗");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("確定要刪除此合作對象嗎？")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleVisibility = (collaborator: Collaborator) => {
    updateMutation.mutate({
      id: collaborator.id,
      isVisible: collaborator.isVisible === 1 ? 0 : 1,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">合作對象管理</h1>
            <p className="text-muted-foreground mt-2">管理所有合作對象資訊</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            新增合作對象
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collaborators?.map((collaborator) => (
            <Card key={collaborator.id} className="p-6">
              <div className="flex items-start gap-4">
                {collaborator.avatar && (
                  <img
                    src={collaborator.avatar}
                    alt={collaborator.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{collaborator.name}</h3>
                    {collaborator.isVisible === 0 && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">隱藏</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    /{collaborator.slug}
                  </p>
                  {collaborator.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {collaborator.description}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDialog(collaborator)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleVisibility(collaborator)}
                    >
                      {collaborator.isVisible === 1 ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(collaborator.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {collaborators?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">尚無合作對象</p>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCollaborator ? "編輯合作對象" : "新增合作對象"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">名稱 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">網址代碼 * (例如: john-doe)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="avatar">頭像圖片</Label>
                <div className="space-y-4">
                  {avatarPreview && (
                    <div className="flex justify-center">
                      <img
                        src={avatarPreview}
                        alt="頭像預覽"
                        className="w-32 h-32 rounded-full object-cover border-2 border-border"
                      />
                    </div>
                  )}
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-muted-foreground">
                    支援 JPG、PNG、GIF 等圖片格式
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="website">個人網站</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="instagram">Instagram 帳號</Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) =>
                    setFormData({ ...formData, instagram: e.target.value })
                  }
                  placeholder="@username"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="sortOrder">排序順序</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="flex-1">
                  <Label htmlFor="isVisible">顯示狀態</Label>
                  <select
                    id="isVisible"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.isVisible}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isVisible: parseInt(e.target.value),
                      })
                    }
                  >
                    <option value={1}>顯示</option>
                    <option value={0}>隱藏</option>
                  </select>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                取消
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending || isUploading}
              >
                {(createMutation.isPending || updateMutation.isPending || isUploading) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    處理中...
                  </>
                ) : (
                  "儲存"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
