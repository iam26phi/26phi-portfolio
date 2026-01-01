import { Star } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function ReviewsSection() {
  const { data: testimonials, isLoading } = trpc.testimonials.list.useQuery();

  // 如果載入中或沒有評價，不顯示此區塊
  if (isLoading || !testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-24 md:py-32 bg-neutral-900 text-white">
      <div className="container">
        <h2 className="text-xs sm:text-sm font-mono tracking-widest text-neutral-500 mb-8 sm:mb-12 md:mb-16">
          CLIENT WORDS
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="flex flex-col gap-6">
              {/* 評分星級 */}
              <div className="flex gap-1 text-white">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < testimonial.rating ? "currentColor" : "none"}
                    className={i < testimonial.rating ? "text-white" : "text-neutral-600"}
                  />
                ))}
              </div>

              {/* 評價內容 */}
              <p className="text-xl leading-relaxed font-light text-neutral-300">
                "{testimonial.content}"
              </p>

              {/* 客戶資訊 */}
              <div className="flex items-center gap-4">
                {testimonial.clientAvatar ? (
                  <img
                    src={testimonial.clientAvatar}
                    alt={testimonial.clientName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold text-lg">
                    {testimonial.clientName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-bold">{testimonial.clientName}</p>
                  {testimonial.clientTitle && (
                    <p className="text-sm text-neutral-500 font-mono">
                      {testimonial.clientTitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
