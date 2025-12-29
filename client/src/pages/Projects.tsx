import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function Projects() {
  const { data: projects, isLoading } = trpc.projects.list.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
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

      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-14 md:pb-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
            攝影專案
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            專案記錄（文字待更新）
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6">
        <div className="container mx-auto">
          {projects && projects.length > 0 ? (
            <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.slug}`}>
                  <a className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-900 mb-4">
                      {project.coverImage ? (
                        <img
                          src={project.coverImage}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-600">
                          <span className="text-sm">No Cover Image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </a>
                </Link>
              ))}
            </div>
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
