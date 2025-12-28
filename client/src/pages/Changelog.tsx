import { trpc } from "@/lib/trpc";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";

export default function Changelog() {
  const { data: changelogs = [] } = trpc.changelogs.list.useQuery();

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      feature: "新功能",
      improvement: "改進",
      bugfix: "修復",
      design: "設計",
    };
    return labels[type] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      feature: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      improvement: "bg-green-500/20 text-green-400 border-green-500/30",
      bugfix: "bg-red-500/20 text-red-400 border-red-500/30",
      design: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    };
    return colors[type] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 py-20 sm:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 tracking-tight">
            更新日誌
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-400 max-w-2xl mx-auto px-4">
            記錄網站的每一次進化與改進
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          {changelogs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-zinc-400 text-lg">尚無更新記錄</p>
            </motion.div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-2 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-zinc-800 via-zinc-700 to-zinc-800 transform md:-translate-x-1/2" />

              {/* Timeline items */}
              <div className="space-y-8 sm:space-y-10 md:space-y-12">
                {changelogs.map((changelog: any, index: number) => (
                  <motion.div
                    key={changelog.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`relative flex items-start gap-8 ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-2 md:left-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full border-2 sm:border-4 border-black transform -translate-x-1/2 md:-translate-x-1/2 z-10" />

                    {/* Content */}
                    <div className={`flex-1 pl-8 sm:pl-10 md:pl-0 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                      <div className={`inline-block ${index % 2 === 0 ? "md:text-right" : "md:text-left"} text-left`}>
                        {/* Date */}
                        <div className="text-sm text-zinc-500 mb-2 font-mono">
                          {new Date(changelog.date).toLocaleDateString("zh-TW", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>

                        {/* Version and Type */}
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <h3 className="text-2xl font-bold tracking-tight">
                            {changelog.version}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeBadgeColor(
                              changelog.type
                            )}`}
                          >
                            {getTypeLabel(changelog.type)}
                          </span>
                        </div>

                        {/* Description */}
                        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6 shadow-xl">
                          <p className="text-zinc-300 leading-relaxed">
                            {changelog.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Spacer for alternating layout */}
                    <div className="hidden md:block flex-1" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-20 pt-12 border-t border-zinc-800"
        >
          <p className="text-zinc-500 text-sm">
            持續優化中，敬請期待更多功能更新
          </p>
        </motion.div>
      </div>
    </div>
  );
}
