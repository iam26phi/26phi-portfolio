import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Lightbox from "@/components/Lightbox";
import { photos, reviews, Category, Photo } from "@/lib/data";
import { ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const filteredPhotos = activeCategory === "All" 
    ? photos 
    : photos.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-white selection:text-black">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-bg-real.jpg" 
            alt="Tokyo Bar Background" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black" />
        </div>

        <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center items-start">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight mb-6 mix-blend-difference whitespace-pre-line"
          >
            活著本身就是一場浩劫，<br />
            夢是這世界唯一的解脫。
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg md:text-xl font-mono max-w-md text-neutral-300 mb-12"
          >
            "Living itself is a havoc, dreaming is the only relief in this world."
          </motion.p>

          <motion.a
            href="#portfolio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="group flex items-center gap-4 text-white font-mono tracking-widest text-sm hover:text-neutral-300 transition-colors"
          >
            EXPLORE WORKS
            <ArrowRight className="group-hover:translate-x-2 transition-transform" />
          </motion.a>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-32 container">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">SELECTED <br /> WORKS</h2>
          
          <div className="flex gap-8 font-mono text-sm tracking-widest">
            {(["All", "Portrait", "Travel", "Editorial"] as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "hover:line-through decoration-1 underline-offset-4 transition-all",
                  activeCategory === cat ? "line-through text-white" : "text-neutral-500"
                )}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <motion.div 
          layout
          className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8"
        >
          <AnimatePresence>
            {filteredPhotos.map((photo) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                key={photo.id}
                className="relative group break-inside-avoid cursor-pointer overflow-hidden"
                onMouseEnter={() => setHoveredPhoto(photo.id)}
                onMouseLeave={() => setHoveredPhoto(null)}
                onClick={() => setSelectedPhoto(photo)}
              >
                <motion.img
                  layoutId={`image-${photo.id}`}
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-700 ease-out scale-100 group-hover:scale-105"
                />
                
                <div className={cn(
                  "absolute inset-0 bg-black/60 flex flex-col justify-end p-6 transition-opacity duration-300",
                  hoveredPhoto === photo.id ? "opacity-100" : "opacity-0"
                )}>
                  <p className="text-xs font-mono text-neutral-400 mb-2">
                    {photo.date} — {photo.location}
                  </p>
                  <h3 className="text-xl font-bold tracking-tight text-white">
                    {photo.alt}
                  </h3>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Reviews Section */}
      <section className="py-32 bg-neutral-900 text-white">
        <div className="container">
          <h2 className="text-sm font-mono tracking-widest text-neutral-500 mb-16">CLIENT WORDS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {reviews.map((review) => (
              <div key={review.id} className="flex flex-col gap-6">
                <div className="flex gap-1 text-white">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-xl leading-relaxed font-light text-neutral-300">
                  "{review.text}"
                </p>
                <div>
                  <p className="font-bold">{review.name}</p>
                  <p className="text-sm text-neutral-500 font-mono">{review.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-32 container flex flex-col items-center text-center">
        <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8">
          LET'S CREATE <br /> TOGETHER
        </h2>
        <p className="text-neutral-400 max-w-xl mb-12 text-lg">
          Available for portraits, editorials, and travel assignments in Taiwan and Tokyo.
        </p>
        <a 
          href="mailto:contact@26phi.com"
          className="px-12 py-4 bg-white text-black font-bold tracking-widest hover:bg-neutral-200 transition-colors"
        >
          BOOK A SESSION
        </a>
      </section>

      <Footer />

      <AnimatePresence>
        {selectedPhoto && (
          <Lightbox 
            photo={selectedPhoto} 
            onClose={() => setSelectedPhoto(null)}
            onNext={() => {
              const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
              if (currentIndex < filteredPhotos.length - 1) {
                setSelectedPhoto(filteredPhotos[currentIndex + 1]);
              }
            }}
            onPrev={() => {
              const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
              if (currentIndex > 0) {
                setSelectedPhoto(filteredPhotos[currentIndex - 1]);
              }
            }}
            hasNext={filteredPhotos.findIndex(p => p.id === selectedPhoto.id) < filteredPhotos.length - 1}
            hasPrev={filteredPhotos.findIndex(p => p.id === selectedPhoto.id) > 0}
            nextPhotoSrc={
              filteredPhotos.findIndex(p => p.id === selectedPhoto.id) < filteredPhotos.length - 1
                ? filteredPhotos[filteredPhotos.findIndex(p => p.id === selectedPhoto.id) + 1].src
                : undefined
            }
            prevPhotoSrc={
              filteredPhotos.findIndex(p => p.id === selectedPhoto.id) > 0
                ? filteredPhotos[filteredPhotos.findIndex(p => p.id === selectedPhoto.id) - 1].src
                : undefined
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
