import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminHero() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch current hero image
  const { data: heroSetting, refetch } = trpc.settings.get.useQuery({ key: "hero_background_image" });
  const uploadMutation = trpc.settings.uploadHeroImage.useMutation();

  useEffect(() => {
    if (heroSetting?.settingValue) {
      setCurrentImage(heroSetting.settingValue);
    }
  }, [heroSetting]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("請選擇圖片檔案");
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("圖片大小不能超過 100MB");
      return;
    }

    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;

        const result = await uploadMutation.mutateAsync({
          file: base64,
          filename: file.name,
        });

        if (result.success) {
          toast.success("英雄背景圖片已更新");
          setCurrentImage(result.url);
          setPreviewImage(null);
          refetch();
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast.error(error.message || "上傳失敗");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => window.location.href = "/admin"}
            className="mb-4 font-mono text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2" size={16} />
            返回照片管理
          </Button>
          <h1 className="text-4xl font-bold tracking-tight mb-2">英雄區域設定</h1>
          <p className="text-muted-foreground">管理首頁英雄區域的背景圖片</p>
        </div>

        {/* Current Image Preview */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">目前的背景圖片</h2>
          {currentImage ? (
            <div className="relative aspect-[21/9] overflow-hidden bg-neutral-900 rounded-lg">
              <img
                src={currentImage}
                alt="Hero Background"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="relative aspect-[21/9] bg-neutral-900 rounded-lg flex items-center justify-center">
              <p className="text-neutral-500 font-mono">尚未設定背景圖片</p>
            </div>
          )}
        </Card>

        {/* Upload Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">上傳新的背景圖片</h2>
          
          {previewImage && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">預覽：</p>
              <div className="relative aspect-[21/9] overflow-hidden bg-neutral-900 rounded-lg">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
                id="hero-upload"
              />
              <label
                htmlFor="hero-upload"
                className={`cursor-pointer flex flex-col items-center gap-2 ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {uploading ? (
                  <Loader2 className="w-12 h-12 text-muted-foreground animate-spin" />
                ) : (
                  <Upload className="w-12 h-12 text-muted-foreground" />
                )}
                <p className="text-sm font-medium">
                  {uploading ? "上傳中..." : "點擊選擇圖片或拖曳檔案到此處"}
                </p>
                <p className="text-xs text-muted-foreground">
                  支援 JPG、PNG、WebP 格式，檔案大小不超過 100MB
                </p>
                <p className="text-xs text-muted-foreground">
                  建議尺寸：2400 x 1028 像素（21:9 比例）
                </p>
              </label>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="text-sm font-bold mb-2">💡 提示</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 選擇高解析度的圖片以確保在大螢幕上清晰顯示</li>
                <li>• 建議使用暗色調的圖片，以確保白色文字清晰可讀</li>
                <li>• 上傳後圖片會自動套用快取，回訪使用者載入速度更快</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
