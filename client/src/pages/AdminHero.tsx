import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Eye, EyeOff, Upload, ArrowLeft } from "lucide-react";

export default function AdminHero() {
  const utils = trpc.useUtils();
  
  // Fetch hero slides and quotes
  const { data: slides = [], isLoading: slidesLoading } = trpc.hero.listAllSlides.useQuery();
  const { data: quotes = [], isLoading: quotesLoading } = trpc.hero.listAllQuotes.useQuery();

  // Mutations for slides
  const createSlideMutation = trpc.hero.createSlide.useMutation({
    onSuccess: () => {
      utils.hero.listAllSlides.invalidate();
      utils.hero.getActiveSlides.invalidate();
      toast.success("輪播照片已新增");
    },
    onError: (error) => {
      toast.error(`新增失敗：${error.message}`);
    },
  });

  const updateSlideMutation = trpc.hero.updateSlide.useMutation({
    onSuccess: () => {
      utils.hero.listAllSlides.invalidate();
      utils.hero.getActiveSlides.invalidate();
      toast.success("輪播照片已更新");
    },
    onError: (error) => {
      toast.error(`更新失敗：${error.message}`);
    },
  });

  const deleteSlideMutation = trpc.hero.deleteSlide.useMutation({
    onSuccess: () => {
      utils.hero.listAllSlides.invalidate();
      utils.hero.getActiveSlides.invalidate();
      toast.success("輪播照片已刪除");
    },
    onError: (error) => {
      toast.error(`刪除失敗：${error.message}`);
    },
  });

  // Mutations for quotes
  const createQuoteMutation = trpc.hero.createQuote.useMutation({
    onSuccess: () => {
      utils.hero.listAllQuotes.invalidate();
      utils.hero.getActiveQuotes.invalidate();
      toast.success("標語已新增");
      setNewQuote({ textZh: "", textEn: "" });
      setIsQuoteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`新增失敗：${error.message}`);
    },
  });

  const updateQuoteMutation = trpc.hero.updateQuote.useMutation({
    onSuccess: () => {
      utils.hero.listAllQuotes.invalidate();
      utils.hero.getActiveQuotes.invalidate();
      toast.success("標語已更新");
      setEditingQuote(null);
    },
    onError: (error) => {
      toast.error(`更新失敗：${error.message}`);
    },
  });

  const deleteQuoteMutation = trpc.hero.deleteQuote.useMutation({
    onSuccess: () => {
      utils.hero.listAllQuotes.invalidate();
      utils.hero.getActiveQuotes.invalidate();
      toast.success("標語已刪除");
    },
    onError: (error) => {
      toast.error(`刪除失敗：${error.message}`);
    },
  });

  // Photo upload mutation
  const uploadMutation = trpc.photos.uploadAvatar.useMutation({
    onSuccess: (data) => {
      createSlideMutation.mutate({
        imageUrl: data.url,
        title: `Slide ${slides.length + 1}`,
        isActive: 1,
        sortOrder: slides.length,
      });
      setIsUploading(false);
    },
    onError: (error) => {
      toast.error(`上傳失敗：${error.message}`);
      setIsUploading(false);
    },
  });

  // State
  const [isUploading, setIsUploading] = useState(false);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [newQuote, setNewQuote] = useState({ textZh: "", textEn: "" });
  const [editingQuote, setEditingQuote] = useState<{ id: number; textZh: string; textEn: string } | null>(null);

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("請選擇圖片檔案");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("檔案大小不能超過 10MB");
      return;
    }

    setIsUploading(true);
    toast.info("正在上傳照片...");

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        await uploadMutation.mutateAsync({
          file: base64,
          filename: file.name,
          category: "hero",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      setIsUploading(false);
    }

    // Reset input
    e.target.value = "";
  };

  // Toggle slide active status
  const toggleSlideActive = (id: number, currentStatus: number) => {
    updateSlideMutation.mutate({
      id,
      isActive: currentStatus === 1 ? 0 : 1,
    });
  };

  // Delete slide
  const deleteSlide = (id: number) => {
    if (confirm("確定要刪除這張輪播照片嗎？")) {
      deleteSlideMutation.mutate(id);
    }
  };

  // Toggle quote active status
  const toggleQuoteActive = (id: number, currentStatus: number) => {
    updateQuoteMutation.mutate({
      id,
      isActive: currentStatus === 1 ? 0 : 1,
    });
  };

  // Delete quote
  const deleteQuote = (id: number) => {
    if (confirm("確定要刪除這條標語嗎？")) {
      deleteQuoteMutation.mutate(id);
    }
  };

  // Create new quote
  const handleCreateQuote = () => {
    if (!newQuote.textZh.trim() || !newQuote.textEn.trim()) {
      toast.error("請填寫中英文標語");
      return;
    }

    createQuoteMutation.mutate({
      textZh: newQuote.textZh,
      textEn: newQuote.textEn,
      isActive: 1,
    });
  };

  // Update existing quote
  const handleUpdateQuote = () => {
    if (!editingQuote) return;

    if (!editingQuote.textZh.trim() || !editingQuote.textEn.trim()) {
      toast.error("請填寫中英文標語");
      return;
    }

    updateQuoteMutation.mutate({
      id: editingQuote.id,
      textZh: editingQuote.textZh,
      textEn: editingQuote.textEn,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12 max-w-6xl">
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
          <h1 className="text-4xl font-bold tracking-tight mb-2">首頁英雄區域管理</h1>
          <p className="text-muted-foreground">管理首頁輪播照片和標語</p>
        </div>

        {/* Hero Slides Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>輪播照片管理</CardTitle>
                <CardDescription>上傳和管理首頁背景輪播照片（每 5 秒自動切換）</CardDescription>
              </div>
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="photo-upload"
                />
                <Label htmlFor="photo-upload">
                  <Button asChild disabled={isUploading}>
                    <span className="cursor-pointer">
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          上傳中...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          上傳照片
                        </>
                      )}
                    </span>
                  </Button>
                </Label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {slidesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : slides.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-2">尚無輪播照片，請上傳第一張照片</p>
                <p className="text-sm">建議尺寸：2400 x 1028 像素（21:9 比例）</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slides.map((slide) => (
                  <Card key={slide.id} className="overflow-hidden">
                    <div className="relative aspect-video">
                      <img
                        src={slide.imageUrl}
                        alt={slide.title || "Hero slide"}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          size="icon"
                          variant={slide.isActive === 1 ? "default" : "secondary"}
                          onClick={() => toggleSlideActive(slide.id, slide.isActive)}
                          title={slide.isActive === 1 ? "點擊停用" : "點擊啟用"}
                        >
                          {slide.isActive === 1 ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => deleteSlide(slide.id)}
                          title="刪除照片"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium">{slide.title || "未命名"}</p>
                      <p className="text-xs text-muted-foreground">
                        排序：{slide.sortOrder} | {slide.isActive === 1 ? "✓ 啟用" : "✗ 停用"}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hero Quotes Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>標語管理</CardTitle>
                <CardDescription>管理首頁顯示的中英文標語（隨機顯示）</CardDescription>
              </div>
              <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    新增標語
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>新增標語</DialogTitle>
                    <DialogDescription>輸入中英文標語內容</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="quote-zh">中文標語</Label>
                      <Textarea
                        id="quote-zh"
                        placeholder="例如：活著本身就是一場浩劫，夢是這世界唯一的解脫。"
                        value={newQuote.textZh}
                        onChange={(e) => setNewQuote({ ...newQuote, textZh: e.target.value })}
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quote-en">英文標語</Label>
                      <Textarea
                        id="quote-en"
                        placeholder="Example: Living itself is a havoc, dreaming is the only relief in this world."
                        value={newQuote.textEn}
                        onChange={(e) => setNewQuote({ ...newQuote, textEn: e.target.value })}
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                    <Button
                      onClick={handleCreateQuote}
                      disabled={createQuoteMutation.isPending}
                      className="w-full"
                    >
                      {createQuoteMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          新增中...
                        </>
                      ) : (
                        "新增標語"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {quotesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : quotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                尚無標語，請新增第一條標語
              </div>
            ) : (
              <div className="space-y-4">
                {quotes.map((quote) => (
                  <Card key={quote.id}>
                    <CardContent className="pt-6">
                      {editingQuote?.id === quote.id ? (
                        <div className="space-y-4">
                          <div>
                            <Label>中文標語</Label>
                            <Textarea
                              value={editingQuote.textZh}
                              onChange={(e) =>
                                setEditingQuote({ ...editingQuote, textZh: e.target.value })
                              }
                              rows={2}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>英文標語</Label>
                            <Textarea
                              value={editingQuote.textEn}
                              onChange={(e) =>
                                setEditingQuote({ ...editingQuote, textEn: e.target.value })
                              }
                              rows={2}
                              className="mt-2"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleUpdateQuote} disabled={updateQuoteMutation.isPending}>
                              {updateQuoteMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  儲存中...
                                </>
                              ) : (
                                "儲存"
                              )}
                            </Button>
                            <Button variant="outline" onClick={() => setEditingQuote(null)}>
                              取消
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <p className="font-medium text-lg">{quote.textZh}</p>
                            <p className="text-sm text-muted-foreground italic">"{quote.textEn}"</p>
                            <p className="text-xs text-muted-foreground">
                              {quote.isActive === 1 ? "✓ 啟用中" : "✗ 已停用"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setEditingQuote({
                                  id: quote.id,
                                  textZh: quote.textZh,
                                  textEn: quote.textEn,
                                })
                              }
                            >
                              編輯
                            </Button>
                            <Button
                              size="sm"
                              variant={quote.isActive === 1 ? "secondary" : "default"}
                              onClick={() => toggleQuoteActive(quote.id, quote.isActive)}
                            >
                              {quote.isActive === 1 ? "停用" : "啟用"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteQuote(quote.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
