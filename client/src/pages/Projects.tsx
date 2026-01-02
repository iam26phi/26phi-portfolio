import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import { photoGridContainerVariants, photoGridItemVariants } from "@/lib/animations";
import { ProgressiveImage } from "@/components/ProgressiveImage";

export default function Projects() {
  const { data: projects, isLoading } = trpc.projects.list.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin h-8 w-8 text-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-14 md:pb-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
            攝影專案
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            探索我的攝影專案集錦
          </p>
        </div>
      </section>

      {/* Projects Masonry Grid */}
      <section className="pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6">
        <div className="container mx-auto">
          {projects && projects.length > 0 ? (
            <motion.div
              variants={photoGridContainerVariants}
              initial="hidden"
              animate="visible"
              className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6"
            >
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  variants={photoGridItemVariants}
                  custom={index}
                  className="break-inside-avoid mb-4 sm:mb-6"
                >
                  <Link href={`/projects/${project.slug}`}>
                    <a className="group block">
                      <div className="relative overflow-hidden rounded-lg bg-neutral-900">
                        {project.coverImage ? (
                          <ProgressiveImage
                            src={project.coverImage}
                            alt={project.title}
                            className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full aspect-[4/3] flex items-center justify-center text-neutral-600">
                            <span className="text-sm">No Cover Image</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                        
                        {/* Project Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <h3 className="text-xl font-bold text-white mb-1">
                            {project.title}
                          </h3>
                          {project.description && (
                            <p className="text-sm text-white/80 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Project Title Below (Always Visible) */}
                      <div className="mt-3 px-1">
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                      </div>
                    </a>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">尚無專案</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2024 26phi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
