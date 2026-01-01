import { trpc } from "@/lib/trpc";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useParams, useLocation } from "wouter";
import { Loader2, Calendar, Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { useTextAnimation } from "@/hooks/useTextAnimation";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export default function BlogPost() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const slug = params.slug as string;
  
  // Apply text animation to blog content paragraphs
  useTextAnimation('.blog-content-text');

  const { data: post, isLoading, error } = trpc.blog.getBySlug.useQuery({ slug });

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="container py-32 text-center">
          <h1 className="text-4xl font-bold mb-4">文章不存在</h1>
          <Button
            variant="outline"
            onClick={() => setLocation("/blog")}
            className="font-mono"
          >
            <ArrowLeft className="mr-2" size={16} />
            返回部落格
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <article className="container py-16">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setLocation("/blog")}
          className="mb-8 font-mono text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="mr-2" size={16} />
          返回部落格
        </Button>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative aspect-[21/9] overflow-hidden bg-neutral-900 mb-12">
            <img
              src={post.coverImage}
              alt={post.title}
              loading="eager"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="max-w-3xl mx-auto mb-12">
          {/* Category */}
          {post.category && (
            <span className="text-xs font-mono text-neutral-500 tracking-widest uppercase">
              {post.category}
            </span>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mt-4 mb-6">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-6 text-sm font-mono text-neutral-500 pb-8 border-b border-neutral-800">
            {post.publishedAt && (
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Eye size={14} />
              <span>{post.viewCount} 次瀏覽</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-3xl mx-auto prose prose-invert prose-lg">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="text-4xl font-bold tracking-tight mt-12 mb-6" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-3xl font-bold tracking-tight mt-10 mb-4" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-2xl font-bold tracking-tight mt-8 mb-3" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="blog-content-text text-neutral-300 leading-relaxed mb-6" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a
                  className="text-white underline underline-offset-4 hover:text-neutral-300 transition-colors"
                  {...props}
                />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-inside space-y-2 mb-6 text-neutral-300" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-inside space-y-2 mb-6 text-neutral-300" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-4 border-neutral-700 pl-6 italic text-neutral-400 my-6"
                  {...props}
                />
              ),
              code: ({ node, inline, ...props }: any) =>
                inline ? (
                  <code
                    className="bg-neutral-900 px-2 py-1 rounded text-sm font-mono text-neutral-300"
                    {...props}
                  />
                ) : (
                  <code
                    className="block bg-neutral-900 p-4 rounded font-mono text-sm overflow-x-auto mb-6"
                    {...props}
                  />
                ),
              img: ({ node, ...props }) => (
                <img className="w-full rounded my-8" loading="lazy" {...props} />
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Tags */}
        {post.tags && (
          <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-neutral-800">
            <div className="flex flex-wrap gap-2">
              {post.tags.split(",").map((tag, index) => (
                <span
                  key={index}
                  className="text-xs font-mono px-3 py-1 bg-neutral-900 text-neutral-400 tracking-wider"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>

      <Footer />
    </div>
  );
}
