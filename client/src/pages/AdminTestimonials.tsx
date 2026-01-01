import { AdminLayout } from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminTestimonials() {
  const { data: testimonials, isLoading, refetch } = trpc.testimonials.listAll.useQuery();
  const createMutation = trpc.testimonials.create.useMutation();
  const updateMutation = trpc.testimonials.update.useMutation();
  const deleteMutation = trpc.testimonials.delete.useMutation();
  const updateVisibilityMutation = trpc.testimonials.updateVisibility.useMutation();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<any>(null);

  const [formData, setFormData] = useState({
    clientName: "",
    clientTitle: "",
    clientAvatar: "",
    content: "",
    rating: 5,
    isVisible: 1,
  });

  const resetForm = () => {
    setFormData({
      clientName: "",
      clientTitle: "",
      clientAvatar: "",
      content: "",
      rating: 5,
      isVisible: 1,
    });
  };

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(formData);
      toast.success("評價新增成功！");
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error.message || "新增失敗");
    }
  };

  const handleEdit = async () => {
    if (!selectedTestimonial) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedTestimonial.id,
        ...formData,
      });
      toast.success("評價更新成功！");
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedTestimonial(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "更新失敗");
    }
  };

  const handleDelete = async () => {
    if (!selectedTestimonial) return;
    try {
      await deleteMutation.mutateAsync({ id: selectedTestimonial.id });
      toast.success("評價刪除成功！");
      setIsDeleteDialogOpen(false);
      setSelectedTestimonial(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "刪除失敗");
    }
  };

  const handleToggleVisibility = async (id: number, currentVisibility: number) => {
    try {
      await updateVisibilityMutation.mutateAsync({
        id,
        isVisible: currentVisibility === 1 ? 0 : 1,
      });
      toast.success(currentVisibility === 1 ? "已隱藏評價" : "已顯示評價");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "操作失敗");
    }
  };

  const openEditDialog = (testimonial: any) => {
    setSelectedTestimonial(testimonial);
    setFormData({
      clientName: testimonial.clientName,
      clientTitle: testimonial.clientTitle || "",
      clientAvatar: testimonial.clientAvatar || "",
      content: testimonial.content,
      rating: testimonial.rating,
      isVisible: testimonial.isVisible,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (testimonial: any) => {
    setSelectedTestimonial(testimonial);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 標題區域 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">客戶評價管理</h1>
            <p className="text-muted-foreground mt-1">管理客戶的評價和推薦</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            新增評價
          </Button>
        </div>

        {/* 評價列表 */}
        {testimonials && testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="relative overflow-hidden">
                <CardContent className="pt-6">
                  {/* 可見性標記 */}
                  <div className="absolute top-4 right-4">
                    {testimonial.isVisible === 1 ? (
                      <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <Eye className="h-3 w-3" />
                        顯示中
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        <EyeOff className="h-3 w-3" />
                        已隱藏
                      </div>
                    )}
                  </div>

                  {/* 客戶資訊 */}
                  <div className="flex items-start gap-4 mb-4">
                    {testimonial.clientAvatar ? (
                      <img
                        src={testimonial.clientAvatar}
                        alt={testimonial.clientName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold text-lg">
                        {testimonial.clientName.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{testimonial.clientName}</h3>
                      {testimonial.clientTitle && (
                        <p className="text-sm text-muted-foreground truncate">{testimonial.clientTitle}</p>
                      )}
                    </div>
                  </div>

                  {/* 評分 */}
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    ))}
                  </div>

                  {/* 評價內容 */}
                  <p className="text-sm text-muted-foreground line-clamp-4 mb-4">
                    {testimonial.content}
                  </p>

                  {/* 操作按鈕 */}
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleVisibility(testimonial.id, testimonial.isVisible)}
                      className="flex-1"
                    >
                      {testimonial.isVisible === 1 ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          隱藏
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          顯示
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(testimonial)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(testimonial)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium mb-2">尚無客戶評價</p>
              <p className="text-sm text-muted-foreground mb-4">開始新增您的第一個客戶評價</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                新增評價
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 新增評價對話框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增客戶評價</DialogTitle>
            <DialogDescription>新增一則客戶的評價和推薦</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">客戶姓名 *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="例如：王小明"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientTitle">客戶職稱/身份</Label>
              <Input
                id="clientTitle"
                value={formData.clientTitle}
                onChange={(e) => setFormData({ ...formData, clientTitle: e.target.value })}
                placeholder="例如：新娘、企業主管"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientAvatar">客戶頭像 URL</Label>
              <Input
                id="clientAvatar"
                value={formData.clientAvatar}
                onChange={(e) => setFormData({ ...formData, clientAvatar: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">評價內容 *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="客戶的評價內容..."
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">評分</Label>
              <Select
                value={formData.rating.toString()}
                onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                        <span>({rating} 星)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isVisible">立即顯示</Label>
              <Switch
                id="isVisible"
                checked={formData.isVisible === 1}
                onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked ? 1 : 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.clientName || !formData.content || createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              新增
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 編輯評價對話框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>編輯客戶評價</DialogTitle>
            <DialogDescription>修改客戶的評價資訊</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-clientName">客戶姓名 *</Label>
              <Input
                id="edit-clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="例如：王小明"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-clientTitle">客戶職稱/身份</Label>
              <Input
                id="edit-clientTitle"
                value={formData.clientTitle}
                onChange={(e) => setFormData({ ...formData, clientTitle: e.target.value })}
                placeholder="例如：新娘、企業主管"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-clientAvatar">客戶頭像 URL</Label>
              <Input
                id="edit-clientAvatar"
                value={formData.clientAvatar}
                onChange={(e) => setFormData({ ...formData, clientAvatar: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">評價內容 *</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="客戶的評價內容..."
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rating">評分</Label>
              <Select
                value={formData.rating.toString()}
                onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                        <span>({rating} 星)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-isVisible">立即顯示</Label>
              <Switch
                id="edit-isVisible"
                checked={formData.isVisible === 1}
                onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked ? 1 : 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleEdit}
              disabled={!formData.clientName || !formData.content || updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              儲存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 刪除確認對話框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogDescription>
              確定要刪除「{selectedTestimonial?.clientName}」的評價嗎？此操作無法復原。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              刪除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
