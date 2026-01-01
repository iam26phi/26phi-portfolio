import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, EyeOff, GripVertical, Star, PlayCircle, Loader2, CheckCircle } from "lucide-react";
import { InlineEditableText } from "@/components/InlineEditableText";
import { InlineEditableSelect } from "@/components/InlineEditableSelect";
import { InlineToggle } from "@/components/InlineToggle";

type Photo = {
  id: number;
  src: string;
  alt: string;
  displayTitle?: string | null;
  category: string;
  location: string | null;
  date: string | null;
  description: string | null;
  featured: number;
  isVisible: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
};

type SortablePhotoCardProps = {
  photo: Photo;
  categories: Category[];
  onEdit: (photo: Photo) => void;
  onDelete: (id: number) => void;
  onToggleVisibility: (photo: Photo) => void;
  onToggleFeatured: (photo: Photo) => void;
  onQuickUpdate: (photoId: number, field: string, value: string | number) => Promise<void>;
  onAddToCarousel?: (photoId: number) => void;
  isInCarousel?: boolean;
  isAddingToCarousel?: boolean;
  isSorting: boolean;
};

export function SortablePhotoCard({
  photo,
  categories,
  onEdit,
  onDelete,
  onToggleVisibility,
  onToggleFeatured,
  onQuickUpdate,
  onAddToCarousel,
  isInCarousel = false,
  isAddingToCarousel = false,
  isSorting,
}: SortablePhotoCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border rounded-lg overflow-hidden ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      <div className="relative group">
        <img
          src={photo.src}
          alt={photo.alt}
          className="w-full h-48 object-cover"
        />
        {photo.featured === 1 && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white p-1.5 rounded-full">
            <Star className="h-4 w-4 fill-current" />
          </div>
        )}
        {!photo.isVisible && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <EyeOff className="h-8 w-8 text-white" />
          </div>
        )}
        {isSorting && (
          <div
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 bg-background/90 p-2 rounded cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">標題</p>
            <InlineEditableText
              value={photo.displayTitle || photo.alt}
              onSave={async (newValue) => {
                await onQuickUpdate(photo.id, 'displayTitle', newValue);
              }}
              placeholder="點擊編輯標題"
              emptyText={photo.alt}
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">分類</p>
            <InlineEditableSelect
              value={photo.category}
              options={categories.map(cat => ({ value: cat.name, label: cat.name }))}
              onSave={async (newValue) => {
                await onQuickUpdate(photo.id, 'category', newValue);
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">顯示狀態</p>
              <InlineToggle
                value={photo.isVisible === 1}
                onSave={async (newValue) => {
                  await onQuickUpdate(photo.id, 'isVisible', newValue ? 1 : 0);
                }}
                onLabel="顯示"
                offLabel="隱藏"
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">精選</p>
              <InlineToggle
                value={photo.featured === 1}
                onSave={async (newValue) => {
                  await onQuickUpdate(photo.id, 'featured', newValue ? 1 : 0);
                }}
                onLabel="精選"
                offLabel="一般"
                className="w-full"
              />
            </div>
          </div>
        </div>
        {!isSorting && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(photo)}
                title="編輯詳細資訊"
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-1" />
                詳細編輯
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(photo.id)}
                title="刪除照片"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {onAddToCarousel && (
              <Button
                size="sm"
                variant={isInCarousel ? "outline" : "secondary"}
                className="w-full"
                onClick={() => !isInCarousel && onAddToCarousel(photo.id)}
                disabled={isInCarousel || isAddingToCarousel}
                title={isInCarousel ? "已在首頁輪播中" : "加入首頁輪播"}
              >
                {isAddingToCarousel ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    加入中...
                  </>
                ) : isInCarousel ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    已在輪播
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    加入輪播
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
