import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import { AnimatedPhotoGrid } from "@/components/AnimatedPhotoGrid";
import Lightbox from "@/components/Lightbox";

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
            <AnimatedPhotoGrid
              photos={project.photos.map((photo: any) => ({
                id: photo.id,
                src: photo.src,
                alt: photo.alt,
                category: photo.category,
                location: photo.location,
                date: photo.date,
              }))}
              onPhotoClick={(photo) => {
                const index = project.photos.findIndex((p: any) => p.id === photo.id);
                openLightbox(index);
              }}
              columns={{ default: 1, md: 2, lg: 3 }}
            />
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">此專案尚無照片</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && project.photos && project.photos.length > 0 && project.photos[lightboxIndex] && (
        <Lightbox
          photo={{
            id: project.photos[lightboxIndex].id,
            src: project.photos[lightboxIndex].src,
            alt: project.photos[lightboxIndex].alt,
            category: project.photos[lightboxIndex].category || '',
            location: project.photos[lightboxIndex].location || null,
            date: project.photos[lightboxIndex].date || null,
            description: project.photos[lightboxIndex].description || null,
            isVisible: 1,
            sortOrder: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          }}
          onClose={() => setLightboxOpen(false)}
          onNext={() => setLightboxIndex(lightboxIndex + 1)}
          onPrev={() => setLightboxIndex(lightboxIndex - 1)}
          hasNext={lightboxIndex < project.photos.length - 1}
          hasPrev={lightboxIndex > 0}
          nextPhotoSrc={lightboxIndex < project.photos.length - 1 ? project.photos[lightboxIndex + 1].src : undefined}
          prevPhotoSrc={lightboxIndex > 0 ? project.photos[lightboxIndex - 1].src : undefined}
        />
      )}
    </div>
  );
}
