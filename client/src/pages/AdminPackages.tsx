import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, GripVertical, ArrowLeft } from "lucide-react";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

type PackageFormData = {
  id?: number;
  name: string;
  price: number;
  duration: number;
  description?: string;
  isActive: number;
  sortOrder: number;
};

export default function AdminPackages() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageFormData | null>(null);
  const [isSorting, setIsSorting] = useState(false);
  const [sortedPackages, setSortedPackages] = useState<Array<{
    id: number;
    name: string;
    price: number;
    duration: number;
    description: string | null;
    isActive: number;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
  }>>([]);

  const { data: packages, isLoading, refetch } = trpc.bookingPackages.listAll.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateOrderMutation = trpc.bookingPackages.updateOrder.useMutation({
    onSuccess: () => {
      toast.success("排序已更新");
      refetch();
      setIsSorting(false);
    },
    onError: (error) => {
      toast.error(`更新排序失敗: ${error.message}`);
    },
  });

  // Update sorted packages when data changes
  useEffect(() => {
    if (packages) {
      setSortedPackages([...packages]);
    }
  }, [packages]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSortedPackages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const saveSortOrder = async () => {
    const updates = sortedPackages.map((pkg, index) => ({
      id: pkg.id,
      sortOrder: index,
    }));
    await updateOrderMutation.mutateAsync(updates);
  };

  const createMutation = trpc.bookingPackages.create.useMutation({
    onSuccess: () => {
      toast.success("方案已成功新增");
      refetch();
      setIsDialogOpen(false);
      setEditingPackage(null);
    },
    onError: (error) => {
      toast.error(`新增失敗: ${error.message}`);
    },
  });

  const updateMutation = trpc.bookingPackages.update.useMutation({
    onSuccess: () => {
      toast.success("方案已成功更新");
      refetch();
      setIsDialogOpen(false);
      setEditingPackage(null);
    },
    onError: (error) => {
      toast.error(`更新失敗: ${error.message}`);
    },
  });

  const deleteMutation = trpc.bookingPackages.delete.useMutation({
    onSuccess: () => {
      toast.success("方案已成功刪除");
      refetch();
    },
    onError: (error) => {
      toast.error(`刪除失敗: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: PackageFormData = {
      name: formData.get("name") as string,
      price: parseInt(formData.get("price") as string),
      duration: parseInt(formData.get("duration") as string),
      description: formData.get("description") as string || undefined,
      isActive: parseInt(formData.get("isActive") as string),
      sortOrder: editingPackage?.sortOrder || 0,
    };

    if (editingPackage?.id) {
      updateMutation.mutate({ id: editingPackage.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (pkg: any) => {
    setEditingPackage(pkg);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("確定要刪除這個方案嗎？")) {
      deleteMutation.mutate(id);
    }
  };

  const toggleActive = (pkg: any) => {
    updateMutation.mutate({
      id: pkg.id,
      isActive: pkg.isActive === 1 ? 0 : 1,
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
    <AdminLayout>
    <div className="min-h-screen bg-black">
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/admin"}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回照片管理
              </Button>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">拍攝方案管理</h1>
            <p className="text-muted-foreground">管理預約表單的拍攝方案選項</p>
          </div>
          <div className="flex gap-2">
            {isSorting ? (
              <>
                <Button variant="outline" onClick={() => {
                  setIsSorting(false);
                  if (packages) setSortedPackages([...packages]);
                }}>
                  <X className="h-4 w-4 mr-2" />
                  取消
                </Button>
                <Button onClick={saveSortOrder} disabled={updateOrderMutation.isPending}>
                  {updateOrderMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="h-4 w-4 mr-2" />
                  儲存排序
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsSorting(true)}>
                  <GripVertical className="h-4 w-4 mr-2" />
                  排序
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingPackage(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      新增方案
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingPackage ? "編輯方案" : "新增方案"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">方案名稱</Label>
                        <Input
                          id="name"
                          name="name"
                          defaultValue={editingPackage?.name || ""}
                          placeholder="例如：每月第一組拍攝"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="price">價格（NTD）</Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            defaultValue={editingPackage?.price || ""}
                            placeholder="2000"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="duration">時長（分鐘）</Label>
                          <Input
                            id="duration"
                            name="duration"
                            type="number"
                            defaultValue={editingPackage?.duration || ""}
                            placeholder="60"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">描述（可選）</Label>
                        <Textarea
                          id="description"
                          name="description"
                          defaultValue={editingPackage?.description || ""}
                          placeholder="方案詳細說明..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="isActive">狀態</Label>
                        <Select name="isActive" defaultValue={String(editingPackage?.isActive ?? 1)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">啟用</SelectItem>
                            <SelectItem value="0">停用</SelectItem>
                          </SelectContent>
                        </Select>
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
                          {editingPackage ? "更新" : "新增"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            )}
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
              items={sortedPackages.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {sortedPackages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={toggleActive}
                    isSorting={isSorting}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
    </AdminLayout>
  );
}

// Package Card Component
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Save, X } from "lucide-react";

type PackageCardProps = {
  pkg: {
    id: number;
    name: string;
    price: number;
    duration: number;
    description: string | null;
    isActive: number;
    sortOrder: number;
  };
  onEdit: (pkg: any) => void;
  onDelete: (id: number) => void;
  onToggleActive: (pkg: any) => void;
  isSorting: boolean;
};

function PackageCard({
  pkg,
  onEdit,
  onDelete,
  onToggleActive,
  isSorting,
}: PackageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pkg.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border rounded-lg p-6 ${
        isDragging ? "shadow-lg" : ""
      } ${!pkg.isActive ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {isSorting && (
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <h3 className="text-xl font-semibold">{pkg.name}</h3>
            {!pkg.isActive && (
              <span className="text-xs bg-muted px-2 py-1 rounded">已停用</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
            <span className="font-mono font-semibold text-lg text-foreground">
              ${pkg.price.toLocaleString()} NTD
            </span>
            <span>•</span>
            <span>{pkg.duration} 分鐘</span>
          </div>
          {pkg.description && (
            <p className="text-sm text-muted-foreground">{pkg.description}</p>
          )}
        </div>
        {!isSorting && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(pkg)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onToggleActive(pkg)}
            >
              {pkg.isActive ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(pkg.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}