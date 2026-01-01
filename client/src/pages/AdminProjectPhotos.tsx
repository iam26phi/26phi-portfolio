import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useParams } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function AdminProjectPhotos() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id || "0");
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: project, isLoading: loadingProject } = trpc.projects.getById.useQuery({ id: projectId });
  const { data: allPhotos, isLoading: loadingPhotos } = trpc.projects.getAvailablePhotos.useQuery({ projectId });
  const setPhotos = trpc.projects.setPhotos.useMutation();

  useEffect(() => {
    if (project && project.photos) {
      setSelectedPhotoIds(project.photos.map((p: any) => p.id));
    }
  }, [project]);

  const handleTogglePhoto = (photoId: number) => {
    setSelectedPhotoIds(prev =>
      prev.includes(photoId)
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await setPhotos.mutateAsync({
        projectId,
        photoIds: selectedPhotoIds,
      });
      toast.success('專案照片已更新！');
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || '儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loadingProject || loadingPhotos) {
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

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">專案不存在</h1>
      </div>
    );
  }

  return (
    <AdminLayout>
    <div className="min-h-screen bg-black">
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">管理專案照片</h1>
            <p className="text-muted-foreground">{project.title}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.href = "/admin/projects"}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回專案列表
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  儲存中...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  儲存變更
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mb-6 p-4 bg-muted rounded-lg">
          <p className="text-sm">
            已選擇 <span className="font-bold">{selectedPhotoIds.length}</span> 張照片
          </p>
        </div>

        {allPhotos && allPhotos.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {allPhotos.map((photo) => {
              const isSelected = selectedPhotoIds.includes(photo.id);
              return (
                <Card
                  key={photo.id}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleTogglePhoto(photo.id)}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-square">
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleTogglePhoto(photo.id)}
                          className="bg-white"
                        />
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium line-clamp-1">{photo.alt}</p>
                      <p className="text-xs text-muted-foreground">{photo.category}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-lg font-semibold mb-2">尚無可用照片</h3>
              <p className="text-muted-foreground mb-4">所有照片都已分配到其他專案，或尚未上傳照片</p>
              <Button onClick={() => window.location.href = "/admin"}>
                前往照片管理
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </AdminLayout>
  );
}