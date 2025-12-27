import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading } = trpc.projects.getBySlug.useQuery({ slug: slug || "" });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">專案不存在</h1>
        <Link href="/projects">
          <a className="text-primary hover:underline">返回專案列表</a>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <a className="text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity">
              26phi
            </a>
          </Link>
          <nav className="flex gap-8">
            <Link href="/">
              <a className="text-sm font-bold tracking-wider hover:text-primary transition-colors">
                PORTFOLIO
              </a>
            </Link>
            <Link href="/about">
              <a className="text-sm font-bold tracking-wider hover:text-primary transition-colors">
                ABOUT
              </a>
            </Link>
            <Link href="/blog">
              <a className="text-sm font-bold tracking-wider hover:text-primary transition-colors">
                BLOG
              </a>
            </Link>
            <Link href="/projects">
              <a className="text-sm font-bold tracking-wider text-primary">
                PROJECTS
              </a>
            </Link>
          </nav>
        </div>
      </header>

      {/* Project Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <Link href="/projects">
            <a className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">
              ← 返回專案列表
            </a>
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {project.title}
          </h1>
          {project.description && (
            <p className="text-xl text-muted-foreground leading-relaxed">
              {project.description}
            </p>
          )}
        </div>
      </section>

      {/* Project Photos */}
      <section className="pb-24 px-6">
        <div className="container mx-auto">
          {project.photos && project.photos.length > 0 ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
              {project.photos.map((photo: any, index: number) => (
                <div
                  key={photo.id}
                  className="break-inside-avoid cursor-pointer group"
                  onClick={() => openLightbox(index)}
                >
                  <div className="relative overflow-hidden rounded-lg bg-neutral-900">
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </div>
                  {photo.alt && (
                    <p className="mt-2 text-sm text-muted-foreground">{photo.alt}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">此專案尚無照片</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && project.photos && project.photos.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {lightboxIndex > 0 && (
            <button
              onClick={() => setLightboxIndex(lightboxIndex - 1)}
              className="absolute left-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {lightboxIndex < project.photos.length - 1 && (
            <button
              onClick={() => setLightboxIndex(lightboxIndex + 1)}
              className="absolute right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          <div className="relative w-full h-full flex items-center justify-center p-2 md:p-4">
            <img
              src={project.photos[lightboxIndex].src}
              alt={project.photos[lightboxIndex].alt}
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: 'calc(100vh - 4rem)' }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2024 26phi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
