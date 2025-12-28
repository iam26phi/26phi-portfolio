import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";
import { Loader2, Calendar, Eye } from "lucide-react";
import { motion } from "framer-motion";

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

export default function Blog() {
  const [, setLocation] = useLocation();
  const { data: posts = [], isLoading } = trpc.blog.list.useQuery();

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 sm:py-24 md:py-32 container px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4 sm:mb-6">
            BLOG
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base md:text-lg max-w-2xl font-mono">
            攀影筆記、創作心得與旅行故事
          </p>
        </motion.div>
      </section>

      {/* Posts List */}
      <section className="py-8 sm:py-10 md:py-12 container px-4 sm:px-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-500 font-mono">尚無文章發布</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setLocation(`/blog/${post.slug}`)}
                className="group cursor-pointer"
              >
                {/* Cover Image */}
                {post.coverImage ? (
                  <div className="relative aspect-[4/3] overflow-hidden bg-neutral-900 mb-3 sm:mb-4">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                  </div>
                ) : (
                  <div className="relative aspect-[4/3] bg-neutral-900 mb-3 sm:mb-4 flex items-center justify-center">
                    <span className="text-neutral-700 font-mono text-xs sm:text-sm">NO IMAGE</span>
                  </div>
                )}

                {/* Category */}
                {post.category && (
                  <span className="text-[10px] sm:text-xs font-mono text-neutral-500 tracking-widest uppercase">
                    {post.category}
                  </span>
                )}

                {/* Title */}
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight mt-2 mb-2 sm:mb-3 group-hover:text-neutral-300 transition-colors">
                  {post.title}
                </h2>

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-neutral-400 text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4">
                    {post.excerpt}
                  </p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs font-mono text-neutral-500">
                  {post.publishedAt && (
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Eye size={12} />
                    <span>{post.viewCount}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
