import { useState, useEffect, useMemo } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import imageCompression from "browser-image-compression";

export default function AdminBlogEditor() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const postId = params.id ? parseInt(params.id) : null;
  const isEditMode = postId !== null;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  // Fetch post data if editing
  const { data: post, isLoading } = trpc.blog.getById.useQuery(
    { id: postId! },
    { enabled: isEditMode }
  );

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setSlug(post.slug);
      setContent(post.content);
      setExcerpt(post.excerpt || "");
      setCategory(post.category || "");
      setTags(post.tags || "");
      setCoverImage(post.coverImage || "");
      setStatus(post.status);
    }
  }, [post]);

  const createMutation = trpc.blog.create.useMutation({
    onSuccess: () => {
      toast.success("文章已建立");
      setLocation("/admin/blog");
    },
    onError: (error) => {
      toast.error(`建立失敗：${error.message}`);
    },
  });

  const updateMutation = trpc.blog.update.useMutation({
    onSuccess: () => {
      toast.success("文章已更新");
      setLocation("/admin/blog");
    },
    onError: (error) => {
      toast.error(`更新失敗：${error.message}`);
    },
  });

  const uploadCoverMutation = trpc.blog.uploadCover.useMutation({
    onSuccess: (data) => {
      setCoverImage(data.url);
      toast.success("封面圖片已上傳");
    },
    onError: (error) => {
      toast.error(`上傳失敗：${error.message}`);
    },
  });

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEditMode || !slug) {
      setSlug(generateSlug(value));
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("檔案大小不能超過 100MB");
      return;
    }

    let fileToUpload = file;
    const fileSizeMB = file.size / (1024 * 1024);

    // Compress image if larger than 10MB
    if (fileSizeMB > 10) {
      toast.info("正在壓縮圖片...");

      const options = {
        maxSizeMB: 10,
        maxWidthOrHeight: 2400,
        useWebWorker: true,
        fileType: file.type,
      };

      try {
        fileToUpload = await imageCompression(file, options);
        const compressedSizeMB = fileToUpload.size / (1024 * 1024);
        toast.success(`壓縮完成：${fileSizeMB.toFixed(2)}MB → ${compressedSizeMB.toFixed(2)}MB`);
      } catch (compressionError) {
        console.error("Compression error:", compressionError);
        toast.warning("壓縮失敗，將使用原始檔案上傳");
      }
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      uploadCoverMutation.mutate({
        file: base64,
        filename: file.name,
      });
    };
    reader.readAsDataURL(fileToUpload);
  };

  const handleSubmit = (e: React.FormEvent, publishStatus: "draft" | "published") => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("請輸入標題");
      return;
    }

    if (!slug.trim()) {
      toast.error("請輸入網址代稱");
      return;
    }

    if (!content.trim()) {
      toast.error("請輸入內容");
      return;
    }

    const postData = {
      title,
      slug,
      content,
      excerpt: excerpt || undefined,
      category: category || undefined,
      tags: tags || undefined,
      coverImage: coverImage || undefined,
      status: publishStatus,
    };

    if (isEditMode) {
      updateMutation.mutate({ id: postId, ...postData });
    } else {
      createMutation.mutate(postData);
    }
  };

  const editorOptions = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: "在此輸入文章內容（支援 Markdown 語法）...",
      status: false,
      toolbar: [
        "bold",
        "italic",
        "heading",
        "|",
        "quote",
        "unordered-list",
        "ordered-list",
        "|",
        "link",
        "image",
        "|",
        "preview",
        "side-by-side",
        "fullscreen",
        "|",
        "guide",
      ] as any,
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tighter mb-2">
            {isEditMode ? "編輯文章" : "新增文章"}
          </h1>
          <p className="text-neutral-400 font-mono text-sm">
            填寫文章資訊並使用 Markdown 編寫內容
          </p>
        </div>

        <form onSubmit={(e) => handleSubmit(e, status)} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-mono text-neutral-300">
              標題 *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="輸入文章標題"
              className="mt-2 bg-neutral-900 border-neutral-800 text-white"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="slug" className="text-sm font-mono text-neutral-300">
              網址代稱 (Slug) *
            </Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="article-url-slug"
              className="mt-2 bg-neutral-900 border-neutral-800 text-white font-mono text-sm"
              required
            />
            <p className="text-xs text-neutral-500 mt-1 font-mono">
              文章網址：/blog/{slug || "article-url-slug"}
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <Label htmlFor="excerpt" className="text-sm font-mono text-neutral-300">
              摘要
            </Label>
            <Input
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="簡短描述文章內容（選填）"
              className="mt-2 bg-neutral-900 border-neutral-800 text-white"
            />
          </div>

          {/* Category and Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="text-sm font-mono text-neutral-300">
                分類
              </Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="例如：攝影技巧"
                className="mt-2 bg-neutral-900 border-neutral-800 text-white"
              />
            </div>
            <div>
              <Label htmlFor="tags" className="text-sm font-mono text-neutral-300">
                標籤
              </Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="用逗號分隔，例如：旅行,東京"
                className="mt-2 bg-neutral-900 border-neutral-800 text-white"
              />
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <Label htmlFor="cover" className="text-sm font-mono text-neutral-300">
              封面圖片
            </Label>
            <div className="mt-2 space-y-3">
              {coverImage && (
                <div className="relative w-full h-48 bg-neutral-900 border border-neutral-800">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <Input
                id="cover"
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="bg-neutral-900 border-neutral-800 text-white"
                disabled={uploadCoverMutation.isPending}
              />
              {uploadCoverMutation.isPending && (
                <p className="text-xs text-neutral-500 font-mono">上傳中...</p>
              )}
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <Label htmlFor="content" className="text-sm font-mono text-neutral-300 mb-2 block">
              內容 * (Markdown)
            </Label>
            <div className="border border-neutral-800 rounded overflow-hidden">
              <SimpleMDE
                value={content}
                onChange={setContent}
                options={editorOptions}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-neutral-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/admin/blog")}
              className="font-mono"
            >
              取消
            </Button>
            <Button
              type="button"
              onClick={(e) => {
                setStatus("draft");
                handleSubmit(e, "draft");
              }}
              variant="outline"
              className="font-mono"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              儲存草稿
            </Button>
            <Button
              type="button"
              onClick={(e) => {
                setStatus("published");
                handleSubmit(e, "published");
              }}
              className="bg-white text-black hover:bg-neutral-200 font-mono"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {isEditMode ? "更新並發布" : "發布文章"}
            </Button>
          </div>
        </form>
      </div>
    </div>
    </AdminLayout>
  );
}