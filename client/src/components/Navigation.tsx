import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

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
        isScrolled ? "py-4" : "py-8"
      )}
    >
      <div className="container flex justify-between items-center">
        <Link href="/">
          <a className="text-2xl font-bold tracking-tighter font-sans hover:opacity-80 transition-opacity">
            26phi
          </a>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-12">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href}>
              <a
                className={cn(
                  "text-sm font-mono tracking-widest hover:line-through decoration-1 underline-offset-4 transition-all",
                  location === link.href && "line-through"
                )}
              >
                {link.name}
              </a>
            </Link>
          ))}
          <a 
            href="mailto:contact@26phi.com"
            className="text-sm font-mono tracking-widest hover:line-through decoration-1 underline-offset-4 transition-all"
          >
            CONTACT
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center gap-8 md:hidden">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href}>
              <a
                className="text-2xl font-mono tracking-widest hover:text-gray-400 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            </Link>
          ))}
          <a 
            href="mailto:contact@26phi.com"
            className="text-2xl font-mono tracking-widest hover:text-gray-400 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            CONTACT
          </a>
        </div>
      )}
    </nav>
  );
}
