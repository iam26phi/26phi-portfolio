import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Camera, Award, Users, MapPin, Calendar, Mail } from "lucide-react";

const timeline = [
  {
    year: "2024",
    title: "東京據點成立",
    description: "正式在東京設立工作室，拓展日本市場的人像與商業攝影業務"
  },
  {
    year: "2023",
    title: "品牌合作突破",
    description: "與多個時尚品牌展開合作，作品刊登於各大時尚雜誌"
  },
  {
    year: "2022",
    title: "專業攝影師之路",
    description: "全職投入攝影事業，專注於人像與編輯攝影領域"
  },
  {
    year: "2020",
    title: "攝影生涯起點",
    description: "開始系統性學習攝影，從街頭攝影逐步發展個人風格"
  }
];

const stats = [
  { icon: Camera, value: "500+", label: "完成專案" },
  { icon: Users, value: "200+", label: "服務客戶" },
  { icon: Award, value: "5+", label: "年經驗" },
  { icon: MapPin, value: "2", label: "工作據點" }
];

const equipment = [
  { category: "相機", items: ["Sony A7R V", "Sony A1", "Fujifilm X-T5"] },
  { category: "鏡頭", items: ["Sony 35mm f/1.4 GM", "Sony 85mm f/1.4 GM", "Sony 24-70mm f/2.8 GM II"] },
  { category: "燈光", items: ["Profoto B10X", "Godox AD600 Pro", "Aputure 600d Pro"] },
  { category: "配件", items: ["DJI RS3 Pro", "Peak Design 背帶", "Shimoda 背包"] }
];

const faqs = [
  {
    question: "如何預約拍攝？",
    answer: "您可以透過網站的聯絡表單或直接發送 Email 預約。我會在 24 小時內回覆您，討論拍攝細節與檔期。"
  },
  {
    question: "拍攝費用如何計算？",
    answer: "費用依據拍攝類型、時長、地點和後製需求而定。請聯繫我獲取詳細報價，我會根據您的需求提供客製化方案。"
  },
  {
    question: "照片多久可以收到？",
    answer: "一般人像拍攝約 7-14 個工作天交件，商業專案依複雜度約 2-4 週。急件可另外討論加急費用。"
  },
  {
    question: "可以到其他城市拍攝嗎？",
    answer: "當然可以！除了台北和東京，我也接受全球各地的拍攝邀約，差旅費用另計。"
  }
];

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-white selection:text-black">
      <Navigation />

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-32 pb-20">
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
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-neutral-900">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-4 text-neutral-500" />
                  <div className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">{stat.value}</div>
                  <div className="text-sm font-mono tracking-widest text-neutral-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-32 container mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-mono tracking-widest text-neutral-500 mb-16"
          >
            JOURNEY
          </motion.h2>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-neutral-800 transform md:-translate-x-1/2" />
            
            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative flex flex-col md:flex-row items-start mb-16 ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pl-16' : 'md:pr-16 md:text-right'} pl-8 md:pl-0`}>
                  <div className="flex items-center gap-4 mb-4">
                    <Calendar className="w-5 h-5 text-neutral-500 md:hidden" />
                    <span className="text-2xl font-bold tracking-tighter">{item.year}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-neutral-400">{item.description}</p>
                </div>
                
                {/* Timeline Dot */}
                <div className="absolute left-0 md:left-1/2 w-3 h-3 bg-white rounded-full transform -translate-x-1/2 mt-2" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Equipment Section */}
        <section className="py-32 bg-neutral-900">
          <div className="container mx-auto px-6">
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-mono tracking-widest text-neutral-500 mb-16"
            >
              GEAR
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {equipment.map((category, index) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-xl font-bold tracking-tight mb-6">{category.category}</h3>
                  <ul className="space-y-3 text-neutral-400">
                    {category.items.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-neutral-500 rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-32 container mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-mono tracking-widest text-neutral-500 mb-16"
          >
            FAQ
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="border-l-2 border-neutral-800 pl-6"
              >
                <h3 className="text-xl font-bold mb-4">{faq.question}</h3>
                <p className="text-neutral-400 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-white text-black">
          <div className="container mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8">
                LET'S WORK<br />TOGETHER
              </h2>
              <p className="text-xl text-neutral-600 mb-12 max-w-2xl mx-auto">
                無論是個人肖像、品牌形象還是創意專案，我都期待與您合作，創造獨特的視覺故事。
              </p>
              <a
                href="mailto:contact@26phi.com"
                className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 font-mono text-sm tracking-widest hover:bg-neutral-800 transition-colors"
              >
                <Mail className="w-5 h-5" />
                GET IN TOUCH
              </a>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
