import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import { photoGridContainerVariants, photoGridItemVariants } from "@/lib/animations";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import Lightbox from "@/components/Lightbox";

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading } = trpc.projects.getBySlug.useQuery({ slug: slug || "" });
  const { data: relatedProjects } = trpc.projects.getRelated.useQuery(
    { projectId: project?.id || 0, limit: 3 },
    { enabled: !!project?.id }
  );
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin h-8 w-8 text-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <h1 className="text-2xl font-bold mb-4">專案不存在</h1>
        <Link href="/projects">
          <a className="text-primary hover:underline">返回專案列表</a>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Project Hero */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-14 md:pb-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <Link href="/projects">
            <a className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">
              ← 返回專案列表
            </a>
          </Link>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
            {project.title}
          </h1>
          {project.description && (
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              {project.description}
            </p>
          )}
        </div>
      </section>

      {/* Project Photos - Masonry Grid */}
      <section className="pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6">
        <div className="container mx-auto">
          {project.photos && project.photos.length > 0 ? (
            <motion.div
              variants={photoGridContainerVariants}
              initial="hidden"
              animate="visible"
              className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6"
            >
              {project.photos.map((photo: any, index: number) => (
                <motion.div
                  key={photo.id}
                  variants={photoGridItemVariants}
                  custom={index}
                  className="break-inside-avoid mb-4 sm:mb-6 group cursor-pointer"
                  onClick={() => openLightbox(index)}
                >
                  <div className="relative overflow-hidden rounded-lg bg-neutral-900">
                    <ProgressiveImage
                      src={photo.src}
                      alt={photo.alt || photo.displayTitle || `Photo ${index + 1}`}
                      className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    
                    {/* Photo Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {photo.displayTitle && (
                        <p className="text-sm font-semibold text-white mb-1">
                          {photo.displayTitle}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-white/80">
                        {photo.category && <span>{photo.category}</span>}
                        {photo.location && (
                          <>
                            <span>·</span>
                            <span>{photo.location}</span>
                          </>
                        )}
                        {photo.date && (
                          <>
                            <span>·</span>
                            <span>{new Date(photo.date).toLocaleDateString('zh-TW')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
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
            displayTitle: project.photos[lightboxIndex].displayTitle,
            category: project.photos[lightboxIndex].category || '',
            location: project.photos[lightboxIndex].location || null,
            date: project.photos[lightboxIndex].date || null,
            description: project.photos[lightboxIndex].description || null,
            camera: project.photos[lightboxIndex].camera || null,
            lens: project.photos[lightboxIndex].lens || null,
            settings: project.photos[lightboxIndex].settings || null,
            isVisible: 1,
            sortOrder: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          }}
          onClose={() => setLightboxOpen(false)}
          onNext={() => {
            if (lightboxIndex < project.photos.length - 1) {
              setLightboxIndex(lightboxIndex + 1);
            }
          }}
          onPrev={() => {
            if (lightboxIndex > 0) {
              setLightboxIndex(lightboxIndex - 1);
            }
          }}
          hasNext={lightboxIndex < project.photos.length - 1}
          hasPrev={lightboxIndex > 0}
          nextPhotoSrc={lightboxIndex < project.photos.length - 1 ? project.photos[lightboxIndex + 1].src : undefined}
          prevPhotoSrc={lightboxIndex > 0 ? project.photos[lightboxIndex - 1].src : undefined}
        />
      )}

      {/* Related Projects */}
      {relatedProjects && relatedProjects.length > 0 && (
        <section className="pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6 border-t border-border pt-12">
          <div className="container mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-center">
              相關專案
            </h2>
            <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {relatedProjects.map((relatedProject) => (
                <Link key={relatedProject.id} href={`/projects/${relatedProject.slug}`}>
                  <a className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-900 mb-4">
                      {relatedProject.coverImage ? (
                        <img
                          src={relatedProject.coverImage}
                          alt={relatedProject.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-600">
                          <span className="text-sm">No Cover Image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                      {relatedProject.title}
                    </h3>
                    {relatedProject.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {relatedProject.description}
                      </p>
                    )}
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </section>
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
