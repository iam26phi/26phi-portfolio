import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, Upload, Image as ImageIcon } from "lucide-react";
import imageCompression from "browser-image-compression";
import { getLoginUrl } from "@/const";

type ProjectFormData = {
  id?: number;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  isVisible: number;
  sortOrder: number;
};

export default function AdminProjects() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectFormData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);

  const { data: projects, isLoading, refetch } = trpc.projects.listAll.useQuery();
  const createProject = trpc.projects.create.useMutation();
  const updateProject = trpc.projects.update.useMutation();
  const deleteProject = trpc.projects.delete.useMutation();
  const uploadCoverImage = trpc.projects.uploadCoverImage.useMutation();

  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    slug: "",
    description: "",
    coverImage: "",
    isVisible: 1,
    sortOrder: 0,
  });

  const handleOpenDialog = (project?: ProjectFormData) => {
    if (project) {
      setEditingProject(project);
      setFormData(project);
    } else {
      setEditingProject(null);
      setFormData({
        title: "",
        slug: "",
        description: "",
        coverImage: "",
        isVisible: 1,
        sortOrder: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData({ ...formData, title, slug: generateSlug(title) });
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('請選擇圖片檔案');
      return;
    }

    try {
      setUploading(true);

      // Compress image if larger than 5MB
      let fileToUpload = file;
      const maxSizeMB = 5;
      
      if (file.size > maxSizeMB * 1024 * 1024) {
        setCompressing(true);
        toast.info(`圖片大小 ${(file.size / 1024 / 1024).toFixed(2)} MB，正在壓縮...`);
        
        try {
          const compressed = await imageCompression(file, {
            maxSizeMB,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            initialQuality: 0.85,
          });
          
          const originalSize = (file.size / 1024 / 1024).toFixed(2);
          const compressedSize = (compressed.size / 1024 / 1024).toFixed(2);
          toast.success(`壓縮完成：${originalSize} MB → ${compressedSize} MB`);
          
          fileToUpload = compressed;
        } catch (compressionError) {
          console.error('Compression error:', compressionError);
          toast.warning('壓縮失敗，使用原始檔案上傳');
        } finally {
          setCompressing(false);
        }
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = e.target?.result as string;
          
          const result = await uploadCoverImage.mutateAsync({
            file: base64,
            filename: fileToUpload.name,
          });

          setFormData({ ...formData, coverImage: result.url });
          toast.success('封面圖片上傳成功！');
        } catch (error: any) {
          console.error('Upload error:', error);
          toast.error(error.message || '上傳失敗');
        } finally {
          setUploading(false);
        }
      };
      reader.onerror = () => {
        toast.error('讀取檔案失敗');
        setUploading(false);
      };
      reader.readAsDataURL(fileToUpload);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || '上傳失敗');
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug) {
      toast.error('請填寫專案標題');
      return;
    }

    try {
      if (editingProject) {
        await updateProject.mutateAsync({
          id: editingProject.id!,
          ...formData,
        });
        toast.success('專案已更新！');
      } else {
        await createProject.mutateAsync(formData);
        toast.success('專案已建立！');
      }
      setIsDialogOpen(false);
      refetch();
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || '操作失敗');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除此專案嗎？這將同時移除所有照片關聯。')) return;

    try {
      await deleteProject.mutateAsync({ id });
      toast.success('專案已刪除！');
      refetch();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || '刪除失敗');
    }
  };

  const toggleVisibility = async (project: any) => {
    try {
      await updateProject.mutateAsync({
        id: project.id,
        isVisible: project.isVisible === 1 ? 0 : 1,
      });
      toast.success(project.isVisible === 1 ? '專案已隱藏' : '專案已顯示');
      refetch();
    } catch (error: any) {
      console.error('Toggle visibility error:', error);
      toast.error(error.message || '操作失敗');
    }
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
            <h1 className="text-4xl font-bold tracking-tight mb-2">專案管理</h1>
            <p className="text-muted-foreground">管理您的攝影專案</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.href = "/admin"}
              className="font-mono"
            >
              返回照片管理
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  新增專案
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProject ? '編輯專案' : '新增專案'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">專案標題 *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="例如：東京夜景系列"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="tokyo-night-series"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      將用於專案頁面的 URL，例如：/projects/{formData.slug || 'slug'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">專案描述</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="描述這個專案的故事、拍攝背景等..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverImage">封面圖片</Label>
                    {formData.coverImage && (
                      <div className="relative w-full h-48 bg-neutral-900 rounded-lg overflow-hidden mb-2">
                        <img
                          src={formData.coverImage}
                          alt="封面預覽"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        className="hidden"
                        id="cover-image-upload"
                      />
                      <label htmlFor="cover-image-upload" className="flex-1">
                        <Button type="button" variant="outline" className="w-full" asChild>
                          <span>
                            {uploading || compressing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {compressing ? '壓縮中...' : '上傳中...'}
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                {formData.coverImage ? '更換封面' : '上傳封面'}
                              </>
                            )}
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sortOrder">排序順序</Label>
                      <Input
                        id="sortOrder"
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="isVisible">顯示狀態</Label>
                      <select
                        id="isVisible"
                        value={formData.isVisible}
                        onChange={(e) => setFormData({ ...formData, isVisible: parseInt(e.target.value) })}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      >
                        <option value={1}>顯示</option>
                        <option value={0}>隱藏</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      取消
                    </Button>
                    <Button type="submit" disabled={createProject.isPending || updateProject.isPending}>
                      {(createProject.isPending || updateProject.isPending) ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          處理中...
                        </>
                      ) : (
                        editingProject ? '更新專案' : '建立專案'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-8 w-8" />
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <div className="relative h-48 bg-neutral-900">
                  {project.coverImage ? (
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600">
                      <ImageIcon className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => toggleVisibility(project)}
                    >
                      {project.isVisible === 1 ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description || '尚無描述'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      排序: {project.sortOrder}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = `/admin/projects/${project.id}/photos`}
                      >
                        管理照片
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDialog(project as any)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">尚無專案</h3>
              <p className="text-muted-foreground mb-4">開始建立您的第一個攝影專案</p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                新增專案
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </AdminLayout>
  );
}