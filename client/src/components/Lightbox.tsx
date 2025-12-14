import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Photo } from "@/lib/data";
import { useEffect } from "react";

interface LightboxProps {
  photo: Photo;
  onClose: () => void;
}

export default function Lightbox({ photo, onClose }: LightboxProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-10 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-50 p-2"
      >
        <X size={32} />
      </button>

      <div
        className="relative w-full h-full max-w-7xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex-1 w-full h-[60vh] md:h-full flex items-center justify-center">
          <motion.img
            layoutId={`image-${photo.id}`}
            src={photo.src}
            alt={photo.alt}
            className="max-w-full max-h-full object-contain shadow-2xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full md:w-[300px] lg:w-[400px] flex flex-col gap-6 text-white shrink-0"
        >
          <div>
            <p className="text-xs font-mono text-neutral-500 mb-2 tracking-widest uppercase">
              {photo.category}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter leading-none text-white">
              {photo.alt}
            </h2>
          </div>

          <div className="h-px w-full bg-neutral-800" />

          <div className="grid grid-cols-2 gap-6 text-sm font-mono text-neutral-400">
            <div>
              <span className="block text-neutral-600 text-xs mb-1 uppercase">Date</span>
              {photo.date || "Unknown"}
            </div>
            <div>
              <span className="block text-neutral-600 text-xs mb-1 uppercase">Location</span>
              {photo.location || "Unknown"}
            </div>
          </div>
          
          <div className="text-neutral-400 text-sm leading-relaxed font-light">
            <p>
              Captured in {photo.location}, this piece is part of the {photo.category} collection. 
              It reflects the raw and unfiltered perspective that defines 26phi's work.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
