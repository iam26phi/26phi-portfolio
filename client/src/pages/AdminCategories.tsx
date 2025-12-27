import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function AdminCategories() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: number; name: string; slug: string; sortOrder: number } | null>(null);

  const { data: categories, isLoading, refetch } = trpc.photoCategories.list.useQuery();
  const createMutation = trpc.photoCategories.create.useMutation();
  const updateMutation = trpc.photoCategories.update.useMutation();
  const deleteMutation = trpc.photoCategories.delete.useMutation();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sortOrder: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          ...formData,
        });
        toast.success("分類已更新");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("分類已新增");
      }

      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", slug: "", sortOrder: 0 });
      refetch();
    } catch (error: any) {
      toast.error(error.message || "操作失敗");
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      sortOrder: category.sortOrder,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("確定要刪除此分類嗎？此操作無法復原。")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("分類已刪除");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "刪除失敗");
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", slug: "", sortOrder: 0 });
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">您沒有權限訪問此頁面</p>
        {!isAuthenticated && (
          <Button onClick={() => window.location.href = getLoginUrl()}>
            登入
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.href = "/admin"}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-4xl font-bold tracking-tight">分類管理</h1>
            </div>
            <p className="text-muted-foreground ml-14">管理照片分類</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleDialogClose()}>
                <Plus className="w-4 h-4 mr-2" />
                新增分類
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? "編輯分類" : "新增分類"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">分類名稱</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    placeholder="例如：人像攝影"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">URL 識別碼</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    required
                    placeholder="例如：portrait"
                    pattern="[a-z0-9-]+"
                    title="只能包含小寫字母、數字和連字號"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    用於 URL 和篩選，只能包含小寫字母、數字和連字號
                  </p>
                </div>

                <div>
                  <Label htmlFor="sortOrder">排序順序</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) }))}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    數字越小越靠前
                  </p>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    取消
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingCategory ? "更新" : "新增"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories?.map((category) => (
              <div
                key={category.id}
                className="border rounded-lg p-6 hover:border-primary transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground font-mono">{category.slug}</p>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    順序: {category.sortOrder}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(category)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    編輯
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {categories?.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                尚無分類，點擊右上角新增第一個分類
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
