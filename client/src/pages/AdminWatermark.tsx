import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Loader2, Upload, Check } from "lucide-react";
import { toast } from "sonner";
import imageCompression from 'browser-image-compression';

export default function AdminWatermark() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [position, setPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'>('bottom-right');
  const [opacity, setOpacity] = useState(0.7);
  const [scale, setScale] = useState(0.15);

  const { data: settings, isLoading: loadingSettings, refetch } = trpc.settings.getWatermarkSettings.useQuery();
  const uploadWatermark = trpc.settings.uploadWatermark.useMutation();
  const updateSettings = trpc.settings.updateWatermarkSettings.useMutation();

  useEffect(() => {
    if (settings) {
      setPreviewUrl(settings.watermarkImage || "");
      setPosition(settings.position as any);
      setOpacity(settings.opacity);
      setScale(settings.scale);
    }
  }, [settings]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('請選擇圖片檔案');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('請先選擇浮水印圖片');
      return;
    }

    try {
      setUploading(true);

      // Compress image if larger than 5MB
      let fileToUpload = selectedFile;
      const maxSizeMB = 5;
      
      if (selectedFile.size > maxSizeMB * 1024 * 1024) {
        setCompressing(true);
        toast.info(`圖片大小 ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB，正在壓縮...`);
        
        try {
          const compressed = await imageCompression(selectedFile, {
            maxSizeMB,
            maxWidthOrHeight: 1200,
            useWebWorker: true,
            initialQuality: 0.85,
          });
          
          const originalSize = (selectedFile.size / 1024 / 1024).toFixed(2);
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
          
          const result = await uploadWatermark.mutateAsync({
            file: base64,
            filename: fileToUpload.name,
          });

          toast.success('浮水印圖片上傳成功！');
          setPreviewUrl(result.url);
          setSelectedFile(null);
          refetch();
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

  const handleSaveSettings = async () => {
    try {
      await updateSettings.mutateAsync({
        position,
        opacity,
        scale,
      });
      toast.success('浮水印設定已儲存！');
      refetch();
    } catch (error: any) {
      console.error('Save settings error:', error);
      toast.error(error.message || '儲存失敗');
    }
  };

  if (loadingSettings) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <AdminLayout>
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">浮水印設定</h1>
        <p className="text-neutral-400">上傳自訂浮水印圖片，並設定顯示位置和透明度</p>
      </div>

      <div className="grid gap-6">
        {/* Upload Watermark Image */}
        <Card>
          <CardHeader>
            <CardTitle>浮水印圖片</CardTitle>
            <CardDescription>上傳您的浮水印圖片（建議使用 PNG 格式以支援透明背景）</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {previewUrl && (
              <div className="relative w-full h-48 bg-neutral-900 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={previewUrl}
                  alt="浮水印預覽"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}

            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="watermark-upload"
                />
                <label htmlFor="watermark-upload">
                  <Button variant="outline" className="w-full" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      選擇圖片
                    </span>
                  </Button>
                </label>
              </div>
              
              {selectedFile && (
                <Button 
                  onClick={handleUpload} 
                  disabled={uploading || compressing}
                  className="flex-1"
                >
                  {uploading || compressing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {compressing ? '壓縮中...' : '上傳中...'}
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      確認上傳
                    </>
                  )}
                </Button>
              )}
            </div>

            {selectedFile && (
              <p className="text-sm text-neutral-400">
                已選擇：{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </CardContent>
        </Card>

        {/* Watermark Settings */}
        <Card>
          <CardHeader>
            <CardTitle>浮水印設定</CardTitle>
            <CardDescription>調整浮水印的位置、透明度和大小</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>位置</Label>
              <Select value={position} onValueChange={(value: any) => setPosition(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-left">左上角</SelectItem>
                  <SelectItem value="top-right">右上角</SelectItem>
                  <SelectItem value="bottom-left">左下角</SelectItem>
                  <SelectItem value="bottom-right">右下角</SelectItem>
                  <SelectItem value="center">中央</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>透明度</Label>
                <span className="text-sm text-neutral-400">{Math.round(opacity * 100)}%</span>
              </div>
              <Slider
                value={[opacity]}
                onValueChange={(value) => setOpacity(value[0])}
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>大小（相對於圖片寬度）</Label>
                <span className="text-sm text-neutral-400">{Math.round(scale * 100)}%</span>
              </div>
              <Slider
                value={[scale]}
                onValueChange={(value) => setScale(value[0])}
                min={0.05}
                max={0.5}
                step={0.01}
                className="w-full"
              />
            </div>

            <Button 
              onClick={handleSaveSettings} 
              disabled={updateSettings.isPending}
              className="w-full"
            >
              {updateSettings.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  儲存中...
                </>
              ) : (
                '儲存設定'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Example */}
        {previewUrl && (
          <Card>
            <CardHeader>
              <CardTitle>預覽效果</CardTitle>
              <CardDescription>浮水印在不同位置的顯示效果（僅供參考）</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full aspect-video bg-neutral-800 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-neutral-600 text-lg font-mono">
                  SAMPLE IMAGE
                </div>
                <img
                  src={previewUrl}
                  alt="浮水印"
                  className="absolute"
                  style={{
                    opacity,
                    width: `${scale * 100}%`,
                    ...(position === 'top-left' && { top: '3%', left: '3%' }),
                    ...(position === 'top-right' && { top: '3%', right: '3%' }),
                    ...(position === 'bottom-left' && { bottom: '3%', left: '3%' }),
                    ...(position === 'bottom-right' && { bottom: '3%', right: '3%' }),
                    ...(position === 'center' && { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }),
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </AdminLayout>
  );
}