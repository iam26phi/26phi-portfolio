import { Star } from "lucide-react";

interface Review {
  id: number;
  name: string;
  role: string;
  text: string;
}

interface ReviewsSectionProps {
  reviews: Review[];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  return (
    <section className="py-16 sm:py-24 md:py-32 bg-neutral-900 text-white">
      <div className="container">
        <h2 className="text-xs sm:text-sm font-mono tracking-widest text-neutral-500 mb-8 sm:mb-12 md:mb-16">CLIENT WORDS</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
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
  );
}
