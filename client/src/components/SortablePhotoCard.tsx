import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, EyeOff, GripVertical, Star } from "lucide-react";

type Photo = {
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
};

type SortablePhotoCardProps = {
  photo: Photo;
  onEdit: (photo: Photo) => void;
  onDelete: (id: number) => void;
  onToggleVisibility: (photo: Photo) => void;
  onToggleFeatured: (photo: Photo) => void;
  isSorting: boolean;
};

export function SortablePhotoCard({
  photo,
  onEdit,
  onDelete,
  onToggleVisibility,
  onToggleFeatured,
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
      <div className="p-4 space-y-2">
        <div>
          <h3 className="font-medium truncate">{photo.alt}</h3>
          <p className="text-sm text-muted-foreground">{photo.category}</p>
        </div>
        {!isSorting && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(photo)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={photo.featured === 1 ? "default" : "outline"}
              onClick={() => onToggleFeatured(photo)}
              title={photo.featured === 1 ? "取消精選" : "設為精選"}
            >
              <Star className={`h-4 w-4 ${photo.featured === 1 ? "fill-current" : ""}`} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onToggleVisibility(photo)}
            >
              {photo.isVisible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(photo.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
