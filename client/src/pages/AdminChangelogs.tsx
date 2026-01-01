import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

export default function AdminChangelogs() {
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    version: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    type: "feature" as "feature" | "improvement" | "bugfix" | "design",
    isVisible: 1,
    sortOrder: 0,
  });

  const { data: changelogs = [], refetch } = trpc.changelogs.listAll.useQuery();
  const createMutation = trpc.changelogs.create.useMutation();
  const updateMutation = trpc.changelogs.update.useMutation();
  const deleteMutation = trpc.changelogs.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...formData,
        });
        toast.success("更新日誌已更新");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("更新日誌已建立");
      }
      
      refetch();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("操作失敗：" + (error as Error).message);
    }
  };

  const handleEdit = (changelog: any) => {
    setEditingId(changelog.id);
    setFormData({
      version: changelog.version,
      date: new Date(changelog.date).toISOString().split("T")[0],
      description: changelog.description,
      type: changelog.type,
      isVisible: changelog.isVisible,
      sortOrder: changelog.sortOrder,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("確定要刪除這個更新日誌嗎？")) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("更新日誌已刪除");
      refetch();
    } catch (error) {
      toast.error("刪除失敗：" + (error as Error).message);
    }
  };

  const toggleVisibility = async (id: number, currentVisibility: number) => {
    try {
      await updateMutation.mutateAsync({
        id,
        isVisible: currentVisibility === 1 ? 0 : 1,
      });
      toast.success(currentVisibility === 1 ? "已隱藏" : "已顯示");
      refetch();
    } catch (error) {
      toast.error("操作失敗：" + (error as Error).message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      version: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      type: "feature",
      isVisible: 1,
      sortOrder: 0,
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      feature: "新功能",
      improvement: "改進",
      bugfix: "修復",
      design: "設計",
    };
    return labels[type] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      feature: "bg-blue-500/10 text-blue-500",
      improvement: "bg-green-500/10 text-green-500",
      bugfix: "bg-red-500/10 text-red-500",
      design: "bg-purple-500/10 text-purple-500",
    };
    return colors[type] || "bg-black0/10 text-gray-500";
  };

  return (
    <AdminLayout>
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/admin")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold">更新日誌管理</h1>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                新增更新日誌
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "編輯更新日誌" : "新增更新日誌"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">版本號</label>
                    <Input
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      placeholder="例如：v1.0.0"
                      required
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">日期</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">類型</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="feature">新功能</SelectItem>
                      <SelectItem value="improvement">改進</SelectItem>
                      <SelectItem value="bugfix">修復</SelectItem>
                      <SelectItem value="design">設計</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">描述</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="簡短描述這次更新的內容..."
                    required
                    rows={4}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">排序順序</label>
                    <Input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">可見性</label>
                    <Select
                      value={formData.isVisible.toString()}
                      onValueChange={(value) => setFormData({ ...formData, isVisible: parseInt(value) })}
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        <SelectItem value="1">顯示</SelectItem>
                        <SelectItem value="0">隱藏</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    className="border-zinc-700"
                  >
                    取消
                  </Button>
                  <Button type="submit">
                    {editingId ? "更新" : "建立"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Changelogs List */}
        <div className="space-y-4">
          {changelogs.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
              <p className="text-zinc-400">尚無更新日誌</p>
            </Card>
          ) : (
            changelogs.map((changelog: any) => (
              <Card key={changelog.id} className="bg-zinc-900 border-zinc-800 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{changelog.version}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeBadgeColor(changelog.type)}`}>
                        {getTypeLabel(changelog.type)}
                      </span>
                      {changelog.isVisible === 0 && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-zinc-800 text-zinc-400">
                          已隱藏
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400 mb-3">
                      {new Date(changelog.date).toLocaleDateString("zh-TW")}
                    </p>
                    <p className="text-zinc-300">{changelog.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleVisibility(changelog.id, changelog.isVisible)}
                      title={changelog.isVisible === 1 ? "隱藏" : "顯示"}
                    >
                      {changelog.isVisible === 1 ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(changelog)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(changelog.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
    </AdminLayout>
  );
}