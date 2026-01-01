import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string | null;
  tags: string | null;
  status: "draft" | "published";
  publishedAt: Date | null;
  viewCount: number;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
};

export default function AdminBlog() {
  const [, setLocation] = useLocation();
  const { data: posts = [], isLoading, refetch } = trpc.blog.listAll.useQuery();
  const deleteMutation = trpc.blog.delete.useMutation({
    onSuccess: () => {
      toast.success("文章已刪除");
      refetch();
    },
    onError: (error) => {
      toast.error(`刪除失敗：${error.message}`);
    },
  });

  const updateStatusMutation = trpc.blog.update.useMutation({
    onSuccess: () => {
      toast.success("狀態已更新");
      refetch();
    },
    onError: (error) => {
      toast.error(`更新失敗：${error.message}`);
    },
  });

  const handleDelete = async (id: number, title: string) => {
    if (window.confirm(`確定要刪除文章「${title}」嗎？`)) {
      deleteMutation.mutate({ id });
    }
  };

  const toggleStatus = (post: BlogPost) => {
    const newStatus = post.status === "published" ? "draft" : "published";
    updateStatusMutation.mutate({
      id: post.id,
      status: newStatus,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter mb-2">部落格管理</h1>
            <p className="text-neutral-400 font-mono text-sm">
              管理您的文章內容
            </p>
          </div>
          <Button
            onClick={() => setLocation("/admin/blog/new")}
            className="bg-white text-black hover:bg-neutral-200 font-mono tracking-wider"
          >
            <Plus className="mr-2" size={16} />
            新增文章
          </Button>
        </div>

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-500 font-mono mb-6">尚無文章</p>
            <Button
              onClick={() => setLocation("/admin/blog/new")}
              variant="outline"
              className="font-mono"
            >
              建立第一篇文章
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="border border-neutral-800 p-6 hover:border-neutral-600 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold tracking-tight">
                        {post.title}
                      </h3>
                      <span
                        className={`text-xs font-mono px-2 py-1 ${
                          post.status === "published"
                            ? "bg-green-900 text-green-300"
                            : "bg-neutral-800 text-neutral-400"
                        }`}
                      >
                        {post.status === "published" ? "已發布" : "草稿"}
                      </span>
                    </div>
                    
                    <p className="text-neutral-400 text-sm mb-3 line-clamp-2">
                      {post.excerpt || "無摘要"}
                    </p>
                    
                    <div className="flex gap-4 text-xs font-mono text-neutral-500">
                      <span>瀏覽：{post.viewCount}</span>
                      {post.category && <span>分類：{post.category}</span>}
                      {post.publishedAt && (
                        <span>
                          發布：{new Date(post.publishedAt).toLocaleDateString("zh-TW")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(post)}
                      className="font-mono"
                    >
                      {post.status === "published" ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation(`/admin/blog/edit/${post.id}`)}
                      className="font-mono"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(post.id, post.title)}
                      className="font-mono text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </AdminLayout>
  );
}