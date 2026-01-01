export function BookingSection() {
  return (
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
  );
}
