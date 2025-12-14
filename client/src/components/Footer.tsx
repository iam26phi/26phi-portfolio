import { Instagram, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-20 border-t border-neutral-900">
      <div className="container flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="flex flex-col gap-4">
          <h2 className="text-4xl font-bold tracking-tighter">26phi</h2>
          <p className="text-neutral-500 font-mono text-sm max-w-xs">
            "Living itself is a havoc, dreaming is the only relief in this world."
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <h3 className="font-mono text-sm text-neutral-500 tracking-widest">CONNECT</h3>
          <div className="flex gap-6">
            <a
              href="https://instagram.com/26phi"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-400 transition-colors"
            >
              <Instagram size={24} />
            </a>
            <a
              href="mailto:contact@26phi.com"
              className="hover:text-neutral-400 transition-colors"
            >
              <Mail size={24} />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h3 className="font-mono text-sm text-neutral-500 tracking-widest">LOCATION</h3>
          <p className="font-sans text-lg">
            Taiwan / Tokyo
          </p>
        </div>
      </div>
      
      <div className="container mt-20 pt-8 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-4 text-neutral-600 font-mono text-xs">
        <p>&copy; {new Date().getFullYear()} 26phi Photography. All rights reserved.</p>
        <p>Designed by Manus</p>
      </div>
    </footer>
  );
}
