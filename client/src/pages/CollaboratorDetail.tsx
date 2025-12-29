import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Globe, Instagram, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Lightbox from "@/components/Lightbox";
import { motion } from "framer-motion";
import { photoItemVariants } from "@/lib/animations";

export default function CollaboratorDetail() {
  const [, params] = useRoute("/collaborators/:slug");
  const slug = params?.slug || "";
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { data, isLoading, error } = trpc.collaborators.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">找不到合作對象</h1>
          <Link href="/about">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回 About
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { collaborator, photos } = data;

  const handlePhotoClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-14 md:pb-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <Link href="/about">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回 About
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {collaborator.avatar && (
              <img
                src={collaborator.avatar}
                alt={collaborator.name}
                className="w-32 h-32 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
                {collaborator.name}
              </h1>
              {collaborator.description && (
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6">
                  {collaborator.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4">
                {collaborator.website && (
                  <a
                    href={collaborator.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    個人網站
                  </a>
                )}
                {collaborator.instagram && (
                  <a
                    href={`https://instagram.com/${collaborator.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:underline"
                  >
                    <Instagram className="w-4 h-4" />
                    {collaborator.instagram}
                  </a>
                )}
                {collaborator.email && (
                  <a
                    href={`mailto:${collaborator.email}`}
                    className="flex items-center gap-2 text-sm hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    聯絡
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photos Section */}
      <section className="pb-16 px-4 sm:px-6">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">合作作品</h2>

          {photos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">尚無合作作品</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  variants={photoItemVariants}
                  initial="hidden"
                  whileInView="visible"
                  exit="exit"
                  viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                  whileHover="hover"
                  className="break-inside-avoid cursor-pointer group relative overflow-hidden"
                  onClick={() => handlePhotoClick(index)}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {lightboxOpen && photos[lightboxIndex] && (
        <Lightbox
          photo={photos[lightboxIndex]}
          onClose={() => setLightboxOpen(false)}
          onNext={() => setLightboxIndex((prev) => Math.min(prev + 1, photos.length - 1))}
          onPrev={() => setLightboxIndex((prev) => Math.max(prev - 1, 0))}
          hasNext={lightboxIndex < photos.length - 1}
          hasPrev={lightboxIndex > 0}
          nextPhotoSrc={lightboxIndex < photos.length - 1 ? photos[lightboxIndex + 1].src : undefined}
          prevPhotoSrc={lightboxIndex > 0 ? photos[lightboxIndex - 1].src : undefined}
        />
      )}
    </div>
  );
}
