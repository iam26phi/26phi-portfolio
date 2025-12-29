import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Camera, Award, Users, MapPin, Calendar, Mail } from "lucide-react";
import { trpc } from "@/lib/trpc";

// Default fallback data
const defaultTimeline = [
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
];

const defaultStats = [
  { icon: "Camera", value: "500+", label: "完成專案" },
  { icon: "Users", value: "200+", label: "服務客戶" },
];

const defaultEquipment = [
  { category: "相機", items: ["Sony A7R V", "Sony A1"] },
  { category: "鏡頭", items: ["Sony 35mm f/1.4 GM", "Sony 85mm f/1.4 GM"] },
];

const defaultFaqs = [
  {
    question: "如何預約拍攝？",
    answer: "您可以透過網站的聯絡表單或直接發送 Email 預約。"
  },
];

const defaultIntro = "I am 26phi, a photographer based in Taipei and Tokyo. My work is an exploration of the raw, unfiltered moments that define our existence.";
const defaultContact = { email: "contact@26phi.com", location: "Taipei & Tokyo" };

const iconMap: Record<string, any> = {
  Camera,
  Users,
  Award,
  MapPin,
  Calendar,
  Mail,
};

export default function About() {
  const { data: aboutData } = trpc.about.get.useQuery();
  const { data: collaborators } = trpc.collaborators.list.useQuery();

  const timeline = aboutData?.timeline || defaultTimeline;
  const stats = (aboutData?.stats || defaultStats).map((s: any) => ({ ...s, icon: iconMap[s.icon] || Camera }));
  const equipment = aboutData?.equipment || defaultEquipment;
  const faqs = aboutData?.faqs || defaultFaqs;
  const intro = aboutData?.intro || defaultIntro;
  const contact = aboutData?.contact || defaultContact;
  const profileImage = aboutData?.profileImage || "/images/portfolio/portrait/KILLER_劇照_1.jpg";
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-white selection:text-black">
      <Navigation />

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20">
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
                  src={profileImage} 
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
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-8 sm:mb-10 md:mb-12">
                BEHIND <br /> THE LENS
              </h1>

              <div className="space-y-6 sm:space-y-8 text-base sm:text-lg md:text-xl font-light text-neutral-300 leading-relaxed">
                <p>{intro}</p>
              </div>

              <div className="mt-10 sm:mt-12 md:mt-16 grid grid-cols-2 gap-6 sm:gap-8 font-mono text-xs sm:text-sm tracking-widest text-neutral-500">
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
        <section className="py-12 sm:py-16 md:py-20 bg-neutral-900">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat: any, index: number) => (
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
        <section className="py-16 sm:py-24 md:py-32 container mx-auto px-4 sm:px-6">
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
            
            {timeline.map((item: any, index: number) => (
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
        <section className="py-16 sm:py-24 md:py-32 bg-neutral-900">
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
              {equipment.map((category: any, index: number) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-xl font-bold tracking-tight mb-6">{category.category}</h3>
                  <ul className="space-y-3 text-neutral-400">
                    {category.items.map((item: string) => (
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

        {/* Collaborators Section */}
        {collaborators && collaborators.length > 0 && (
          <section className="py-16 sm:py-24 md:py-32 bg-neutral-900">
            <div className="container mx-auto px-6">
              <motion.h2 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-sm font-mono tracking-widest text-neutral-500 mb-16"
              >
                COLLABORATORS
              </motion.h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {collaborators.map((collaborator: any, index: number) => (
                  <motion.a
                    key={collaborator.id}
                    href={`/collaborators/${collaborator.slug}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-square overflow-hidden bg-neutral-800 mb-4">
                      {collaborator.avatar ? (
                        <img
                          src={collaborator.avatar}
                          alt={collaborator.name}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-600">
                          <Users className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-bold tracking-tight mb-1 group-hover:text-neutral-300 transition-colors">
                      {collaborator.name}
                    </h3>
                    {collaborator.description && (
                      <p className="text-sm text-neutral-500 line-clamp-2">
                        {collaborator.description}
                      </p>
                    )}
                  </motion.a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="py-16 sm:py-24 md:py-32 container mx-auto px-4 sm:px-6">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-mono tracking-widest text-neutral-500 mb-16"
          >
            FAQ
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {faqs.map((faq: any, index: number) => (
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
        <section className="py-16 sm:py-24 md:py-32 bg-white text-black">
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
