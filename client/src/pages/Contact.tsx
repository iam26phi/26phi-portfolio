import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    shootingType: "",
    budget: "",
    packageId: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{
    id: number;
    name: string;
    price: number;
    duration: number;
    description: string | null;
  } | null>(null);

  // Fetch active booking packages
  const { data: packages } = trpc.bookingPackages.list.useQuery();

  const submitMutation = trpc.contact.create.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("訊息已成功送出！我們會盡快與您聯繫。");
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          shootingType: "",
          budget: "",
          packageId: "",
          message: "",
        });
        setSelectedPackage(null);
        setIsSubmitted(false);
      }, 3000);
    },
    onError: (error: any) => {
      toast.error(`提交失敗：${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.shootingType || !formData.message) {
      toast.error("請填寫所有必填欄位");
      return;
    }

    if (formData.message.length < 10) {
      toast.error("訊息內容至少需要 10 個字元");
      return;
    }

    submitMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePackageChange = (packageId: string) => {
    handleInputChange("packageId", packageId);
    if (packageId && packages) {
      const pkg = packages.find(p => p.id === parseInt(packageId));
      setSelectedPackage(pkg || null);
      // Auto-fill budget based on package price
      if (pkg) {
        if (pkg.price < 10000) {
          handleInputChange("budget", "under-10k");
        } else if (pkg.price <= 30000) {
          handleInputChange("budget", "10k-30k");
        } else if (pkg.price <= 50000) {
          handleInputChange("budget", "30k-50k");
        } else if (pkg.price <= 100000) {
          handleInputChange("budget", "50k-100k");
        } else {
          handleInputChange("budget", "over-100k");
        }
      }
    } else {
      setSelectedPackage(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <main className="container mx-auto px-4 py-20 sm:py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6">
              聯絡我們
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto">
              讓我們一起創造難忘的視覺故事。填寫表單，我們會盡快與您聯繫。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6 sm:space-y-8"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">聯絡資訊</h2>
                <p className="text-sm sm:text-base text-neutral-400 mb-6 sm:mb-8">
                  無論是商業合作、個人拍攝或任何疑問，我們都很樂意聽到您的聲音。
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-1">電子郵件</h3>
                    <a href="mailto:contact@26phi.com" className="text-sm sm:text-base text-neutral-400 hover:text-white transition-colors">
                      contact@26phi.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-1">電話</h3>
                    <a href="tel:+886912345678" className="text-sm sm:text-base text-neutral-400 hover:text-white transition-colors">
                      +886 912-345-678
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-1">工作室地點</h3>
                    <p className="text-sm sm:text-base text-neutral-400">
                      台北市信義區<br />
                      （預約後提供詳細地址）
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 sm:pt-8 border-t border-white/10">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">營業時間</h3>
                <div className="space-y-2 text-sm sm:text-base text-neutral-400">
                  <p>週一至週五：10:00 - 19:00</p>
                  <p>週六：10:00 - 17:00</p>
                  <p>週日：預約制</p>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10"
            >
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-green-500 mb-4 sm:mb-6" />
                  <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">訊息已送出！</h3>
                  <p className="text-sm sm:text-base text-neutral-400 max-w-md">
                    感謝您的聯繫。我們已收到您的訊息，會在 24 小時內回覆您。
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-sm sm:text-base">姓名 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="請輸入您的姓名"
                      className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-neutral-500 text-sm sm:text-base h-10 sm:h-11"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm sm:text-base">電子郵件 *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your@email.com"
                      className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-neutral-500 text-sm sm:text-base h-10 sm:h-11"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="shootingType" className="text-sm sm:text-base">拍攝類型 *</Label>
                    <Select value={formData.shootingType} onValueChange={(value) => handleInputChange("shootingType", value)}>
                      <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white text-sm sm:text-base h-10 sm:h-11">
                        <SelectValue placeholder="請選擇拍攝類型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">人像攝影</SelectItem>
                        <SelectItem value="wedding">婚禮紀錄</SelectItem>
                        <SelectItem value="commercial">商業攝影</SelectItem>
                        <SelectItem value="event">活動紀錄</SelectItem>
                        <SelectItem value="product">商品攝影</SelectItem>
                        <SelectItem value="other">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {packages && packages.length > 0 && (
                    <div>
                      <Label htmlFor="package" className="text-sm sm:text-base">拍攝方案（可選）</Label>
                      <Select value={formData.packageId} onValueChange={handlePackageChange}>
                        <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white text-sm sm:text-base h-10 sm:h-11">
                          <SelectValue placeholder="選擇預設方案或自訂預算" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">自訂預算</SelectItem>
                          {packages.map((pkg) => (
                            <SelectItem key={pkg.id} value={String(pkg.id)}>
                              {pkg.name} - ${pkg.price.toLocaleString()} / {pkg.duration}分鐘
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedPackage && (
                        <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-sm">{selectedPackage.name}</h4>
                            <span className="font-mono font-bold text-sm">${selectedPackage.price.toLocaleString()} NTD</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
                            <span>時長：{selectedPackage.duration} 分鐘</span>
                          </div>
                          {selectedPackage.description && (
                            <p className="text-xs text-neutral-400">{selectedPackage.description}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="budget" className="text-sm sm:text-base">預算範圍{selectedPackage ? '' : ' *'}</Label>
                    <Select value={formData.budget} onValueChange={(value) => handleInputChange("budget", value)}>
                      <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white text-sm sm:text-base h-10 sm:h-11">
                        <SelectValue placeholder="請選擇預算範圍" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-10k">NT$ 10,000 以下</SelectItem>
                        <SelectItem value="10k-30k">NT$ 10,000 - 30,000</SelectItem>
                        <SelectItem value="30k-50k">NT$ 30,000 - 50,000</SelectItem>
                        <SelectItem value="50k-100k">NT$ 50,000 - 100,000</SelectItem>
                        <SelectItem value="over-100k">NT$ 100,000 以上</SelectItem>
                        <SelectItem value="flexible">彈性調整</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-sm sm:text-base">訊息內容 *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="請描述您的拍攝需求、日期、地點等詳細資訊..."
                      className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-neutral-500 min-h-[120px] sm:min-h-[150px] text-sm sm:text-base"
                      required
                    />
                    <p className="text-xs sm:text-sm text-neutral-500 mt-2">至少 10 個字元</p>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="w-full bg-white text-black hover:bg-neutral-200 transition-colors font-semibold text-sm sm:text-base h-11 sm:h-12"
                  >
                    {submitMutation.isPending ? (
                      "送出中..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        送出訊息
                      </>
                    )}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
