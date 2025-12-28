import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "PORTFOLIO", href: "/" },
    { name: "ABOUT", href: "/about" },
    { name: "BLOG", href: "/blog" },
    { name: "PROJECTS", href: "/projects" },
    { name: "CHANGELOG", href: "/changelog" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 mix-blend-difference text-white",
        isScrolled ? "py-3 sm:py-4" : "py-6 sm:py-8"
      )}
    >
      <div className="container flex justify-between items-center px-4 sm:px-6">
        <Link href="/">
          <a className="text-xl sm:text-2xl font-bold tracking-tighter font-sans hover:opacity-80 transition-opacity active:opacity-60">
            26phi
          </a>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 lg:gap-12">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href}>
              <a
                className={cn(
                  "text-xs lg:text-sm font-mono tracking-widest hover:line-through decoration-1 underline-offset-4 transition-all",
                  location === link.href && "line-through"
                )}
              >
                {link.name}
              </a>
            </Link>
          ))}
          <a 
            href="mailto:contact@26phi.com"
            className="text-xs lg:text-sm font-mono tracking-widest hover:line-through decoration-1 underline-offset-4 transition-all"
          >
            CONTACT
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 -mr-2 active:opacity-60 transition-opacity"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center gap-6 sm:gap-8 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {navLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={link.href}>
                  <a
                    className={cn(
                      "text-xl sm:text-2xl font-mono tracking-widest active:text-gray-400 transition-colors",
                      location === link.href && "text-gray-400"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {link.name}
                  </a>
                </Link>
              </motion.div>
            ))}
            <motion.a 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navLinks.length * 0.05 }}
              href="mailto:contact@26phi.com"
              className="text-xl sm:text-2xl font-mono tracking-widest active:text-gray-400 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileMenuOpen(false);
              }}
            >
              CONTACT
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
