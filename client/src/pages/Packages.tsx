import { trpc } from "@/lib/trpc";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Clock, DollarSign, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function Packages() {
  const { data: packages, isLoading } = trpc.bookingPackages.list.useQuery();

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <main className="container mx-auto px-4 py-20 sm:py-24 md:py-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6">
            拍攝方案
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto">
            選擇最適合您的拍攝方案，讓我們一起創造難忘的視覺故事
          </p>
        </motion.div>

        {/* Packages Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-neutral-400" />
          </div>
        ) : packages && packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <PackageCard package={pkg} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-400">目前沒有可用的拍攝方案</p>
          </div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 sm:mt-20 md:mt-24 text-center"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 sm:p-10 md:p-12 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              找不到合適的方案？
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-neutral-400 mb-6 sm:mb-8">
              我們提供客製化拍攝服務，歡迎與我們聯繫討論您的需求
            </p>
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-neutral-200 text-sm sm:text-base h-11 sm:h-12 px-6 sm:px-8"
              >
                聯絡我們
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

// Package Card Component
type PackageCardProps = {
  package: {
    id: number;
    name: string;
    price: number;
    duration: number;
    description: string | null;
    isActive: number;
    sortOrder: number;
  };
};

function PackageCard({ package: pkg }: PackageCardProps) {
  const features = pkg.description?.split('\n').filter(line => line.trim()) || [];
  const isSpecialOffer = pkg.name.includes("第一組") || pkg.price < 3000;

  return (
    <div className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 h-full flex flex-col">
      {/* Special Badge */}
      {isSpecialOffer && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          優惠方案
        </div>
      )}

      {/* Package Name */}
      <div className="mb-4">
        <h3 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-white transition-colors">
          {pkg.name}
        </h3>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono">
            ${pkg.price.toLocaleString()}
          </span>
          <span className="text-sm sm:text-base text-neutral-400">NTD</span>
        </div>
      </div>

      {/* Duration */}
      <div className="flex items-center gap-2 mb-6 text-sm sm:text-base text-neutral-300">
        <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
        <span>{pkg.duration} 分鐘拍攝時間</span>
      </div>

      {/* Description / Features */}
      {features.length > 0 && (
        <div className="mb-6 flex-1">
          <ul className="space-y-2 sm:space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-neutral-300">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA Button */}
      <Link href="/contact">
        <Button
          className="w-full bg-white text-black hover:bg-neutral-200 group-hover:scale-105 transition-transform text-sm sm:text-base h-10 sm:h-11"
        >
          立即預約
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
