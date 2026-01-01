import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface HeroSlide {
  id: number;
  imageUrl: string;
  title: string | null;
  sortOrder: number;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
}

interface HeroQuote {
  id: number;
  textZh: string;
  textEn: string;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
}

interface HeroSectionProps {
  heroSlides: HeroSlide[];
  heroQuotes: HeroQuote[];
}

export function HeroSection({ heroSlides, heroQuotes }: HeroSectionProps) {
  // Fetch hero opacity setting
  const { data: opacitySetting } = trpc.settings.get.useQuery({ key: "hero_opacity" });
  const heroOpacity = opacitySetting?.settingValue ? parseFloat(opacitySetting.settingValue) : 0.7;
  
  // Select a random quote on mount
  const [currentQuote, setCurrentQuote] = useState<{ textZh: string; textEn: string } | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  useEffect(() => {
    if (heroQuotes.length > 0 && !currentQuote) {
      const randomQuote = heroQuotes[Math.floor(Math.random() * heroQuotes.length)];
      setCurrentQuote({ textZh: randomQuote.textZh, textEn: randomQuote.textEn });
    }
  }, [heroQuotes, currentQuote]);
  
  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [heroSlides.length]);
  
  // Fallback to default background if no slides
  const currentSlide = heroSlides.length > 0 ? heroSlides[currentSlideIndex] : null;
  const heroBackgroundUrl = currentSlide?.imageUrl || "https://d2xsxph8kpxj0f.cloudfront.net/310519663123146573/3s8FCUF9BWUfzRwVV77JBG/hero-bg-real.jpg";

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlideIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <motion.img 
              src={heroBackgroundUrl}
              alt="Hero Background" 
              className="w-full h-full object-cover"
              style={{ opacity: heroOpacity }}
              initial={{ scale: 1 }}
              animate={{ scale: 1.1 }}
              transition={{ duration: 10, ease: "linear" }}
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 h-full flex flex-col justify-center items-start">
        {/* Dynamic Quote */}
        {currentQuote && (
          <motion.h1 
            key={currentQuote.textZh}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-tight mb-4 sm:mb-6 mix-blend-difference"
          >
            {currentQuote.textZh.split('，').map((line, i) => (
              <span key={i} className="block">{line}{i === 0 ? '，' : ''}</span>
            ))}
          </motion.h1>
        )}
        
        {currentQuote && (
          <motion.p 
            key={currentQuote.textEn}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl font-mono max-w-md text-neutral-300 mb-8 sm:mb-12"
          >
            "{currentQuote.textEn}"
          </motion.p>
        )}

        <motion.a
          href="#portfolio"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="group flex items-center gap-2 sm:gap-4 text-white font-mono tracking-widest text-xs sm:text-sm hover:text-neutral-300 transition-colors"
        >
          EXPLORE WORKS
          <ArrowRight className="group-hover:translate-x-2 transition-transform w-4 h-4 sm:w-5 sm:h-5" />
        </motion.a>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ 
          opacity: { delay: 1.2, duration: 0.8 },
          y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/60"
      >
        <span className="text-xs font-mono tracking-widest">SCROLL</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/60 to-transparent" />
      </motion.div>
    </section>
  );
}
