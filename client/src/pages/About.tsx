import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-white selection:text-black">
      <Navigation />

      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* Left Column: Image */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-5/12"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900">
              <img 
                src="/images/portfolio/portrait/KILLER_劇照_1.jpg" 
                alt="26phi Portrait" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </motion.div>

          {/* Right Column: Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full lg:w-7/12 flex flex-col justify-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-12">
              BEHIND <br /> THE LENS
            </h1>

            <div className="space-y-8 text-lg md:text-xl font-light text-neutral-300 leading-relaxed">
              <p>
                I am 26phi, a photographer based in Taipei and Tokyo. My work is an exploration of the raw, unfiltered moments that define our existence.
              </p>
              
              <p>
                "Living itself is a havoc, dreaming is the only relief in this world." This philosophy drives every shutter click. I seek to capture the tension between the chaos of reality and the serenity of our dreams.
              </p>

              <p>
                Specializing in portrait, editorial, and travel photography, I strive to reveal the authentic narrative within each subject. Whether it's the neon-lit streets of Shinjuku or the quiet intimacy of a studio session, my goal is to freeze time in its most honest form.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-2 gap-8 font-mono text-sm tracking-widest text-neutral-500">
              <div>
                <h3 className="text-white mb-4">SERVICES</h3>
                <ul className="space-y-2">
                  <li>Portrait Photography</li>
                  <li>Editorial & Fashion</li>
                  <li>Brand Campaign</li>
                  <li>Travel & Lifestyle</li>
                </ul>
              </div>
              <div>
                <h3 className="text-white mb-4">LOCATIONS</h3>
                <ul className="space-y-2">
                  <li>Taipei, Taiwan</li>
                  <li>Tokyo, Japan</li>
                  <li>Available Worldwide</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
