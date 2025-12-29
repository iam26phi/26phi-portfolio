import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";

type AboutContent = {
  intro: string;
  profileImage?: string;
  timeline: Array<{ year: string; title: string; description: string }>;
  stats: Array<{ icon: string; value: string; label: string }>;
  equipment: Array<{ category: string; items: string[] }>;
  faqs: Array<{ question: string; answer: string }>;
  contact: { email: string; location: string };
};

const defaultContent: AboutContent = {
  intro: "I am 26phi, a photographer based in Taipei and Tokyo. My work is an exploration of the raw, unfiltered moments that define our existence.",
  profileImage: "/images/portfolio/portrait/KILLER_劇照_1.jpg",
  timeline: [
    { year: "2024", title: "東京據點成立", description: "正式在東京設立工作室，拓展日本市場的人像與商業攝影業務" },
    { year: "2023", title: "品牌合作突破", description: "與多個時尚品牌展開合作，作品刊登於各大時尚雜誌" },
  ],
  stats: [
    { icon: "Camera", value: "500+", label: "完成專案" },
    { icon: "Users", value: "200+", label: "服務客戶" },
  ],
  equipment: [
    { category: "相機", items: ["Sony A7R V", "Sony A1"] },
    { category: "鏡頭", items: ["Sony 35mm f/1.4 GM", "Sony 85mm f/1.4 GM"] },
  ],
  faqs: [
    { question: "如何預約拍攝？", answer: "您可以透過網站的聯絡表單或直接發送 Email 預約。" },
  ],
  contact: { email: "contact@26phi.com", location: "Taipei & Tokyo" },
};

export default function AdminAbout() {
  const [, setLocation] = useLocation();
  const [content, setContent] = useState<AboutContent>(defaultContent);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const { data: aboutData, isLoading } = trpc.about.get.useQuery();
  const updateMutation = trpc.about.update.useMutation({
    onSuccess: () => {
      toast.success("About 內容已更新");
    },
    onError: (error) => {
      toast.error(`更新失敗: ${error.message}`);
    },
  });

  useEffect(() => {
    if (aboutData) {
      setContent(aboutData);
      if (aboutData.profileImage) {
        setProfileImagePreview(aboutData.profileImage);
      }
    }
  }, [aboutData]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfileImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file: base64,
              filename: file.name,
              folder: 'about',
            }),
          });
          
          if (!response.ok) throw new Error('Upload failed');
          
          const data = await response.json();
          resolve(data.url);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsUploading(true);
      
      let profileImageUrl = content.profileImage;
      
      // If user selected a new profile image, upload it
      if (profileImageFile) {
        profileImageUrl = await uploadProfileImage(profileImageFile);
      }

      const dataToSubmit = {
        ...content,
        profileImage: profileImageUrl,
      };

      updateMutation.mutate(dataToSubmit);
    } catch (error) {
      toast.error("照片上傳失敗");
    } finally {
      setIsUploading(false);
    }
  };

  const addTimelineItem = () => {
    setContent({
      ...content,
      timeline: [...content.timeline, { year: "", title: "", description: "" }],
    });
  };

  const removeTimelineItem = (index: number) => {
    setContent({
      ...content,
      timeline: content.timeline.filter((_, i) => i !== index),
    });
  };

  const updateTimelineItem = (index: number, field: keyof typeof content.timeline[0], value: string) => {
    const newTimeline = [...content.timeline];
    newTimeline[index] = { ...newTimeline[index], [field]: value };
    setContent({ ...content, timeline: newTimeline });
  };

  const addStat = () => {
    setContent({
      ...content,
      stats: [...content.stats, { icon: "Camera", value: "", label: "" }],
    });
  };

  const removeStat = (index: number) => {
    setContent({
      ...content,
      stats: content.stats.filter((_, i) => i !== index),
    });
  };

  const updateStat = (index: number, field: keyof typeof content.stats[0], value: string) => {
    const newStats = [...content.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setContent({ ...content, stats: newStats });
  };

  const addEquipment = () => {
    setContent({
      ...content,
      equipment: [...content.equipment, { category: "", items: [] }],
    });
  };

  const removeEquipment = (index: number) => {
    setContent({
      ...content,
      equipment: content.equipment.filter((_, i) => i !== index),
    });
  };

  const updateEquipmentCategory = (index: number, value: string) => {
    const newEquipment = [...content.equipment];
    newEquipment[index] = { ...newEquipment[index], category: value };
    setContent({ ...content, equipment: newEquipment });
  };

  const updateEquipmentItems = (index: number, value: string) => {
    const newEquipment = [...content.equipment];
    newEquipment[index] = { ...newEquipment[index], items: value.split(',').map(s => s.trim()) };
    setContent({ ...content, equipment: newEquipment });
  };

  const addFAQ = () => {
    setContent({
      ...content,
      faqs: [...content.faqs, { question: "", answer: "" }],
    });
  };

  const removeFAQ = (index: number) => {
    setContent({
      ...content,
      faqs: content.faqs.filter((_, i) => i !== index),
    });
  };

  const updateFAQ = (index: number, field: keyof typeof content.faqs[0], value: string) => {
    const newFAQs = [...content.faqs];
    newFAQs[index] = { ...newFAQs[index], [field]: value };
    setContent({ ...content, faqs: newFAQs });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => setLocation("/admin")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回管理頁面
        </Button>

        <h1 className="text-3xl font-bold mb-8">編輯 About 頁面</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Image Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">個人照片</h2>
            <div className="space-y-4">
              {profileImagePreview && (
                <div className="flex justify-center">
                  <img
                    src={profileImagePreview}
                    alt="個人照片預覽"
                    className="w-64 h-80 object-cover border-2 border-border"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="profileImage">上傳照片</Label>
                <Input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  建議尺寸：3:4 比例（例如 900x1200px），支援 JPG、PNG 等格式
                </p>
              </div>
            </div>
          </Card>

          {/* Intro Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">個人簡介</h2>
            <Textarea
              value={content.intro}
              onChange={(e) => setContent({ ...content, intro: e.target.value })}
              rows={4}
              placeholder="輸入個人簡介..."
            />
          </Card>

          {/* Timeline Section */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">時間軸</h2>
              <Button type="button" onClick={addTimelineItem} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                新增
              </Button>
            </div>
            <div className="space-y-4">
              {content.timeline.map((item, index) => (
                <div key={index} className="flex gap-3 items-start border-b pb-4">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="年份"
                      value={item.year}
                      onChange={(e) => updateTimelineItem(index, 'year', e.target.value)}
                    />
                    <Input
                      placeholder="標題"
                      value={item.title}
                      onChange={(e) => updateTimelineItem(index, 'title', e.target.value)}
                    />
                    <Textarea
                      placeholder="描述"
                      value={item.description}
                      onChange={(e) => updateTimelineItem(index, 'description', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTimelineItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Stats Section */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">統計數據</h2>
              <Button type="button" onClick={addStat} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                新增
              </Button>
            </div>
            <div className="space-y-4">
              {content.stats.map((stat, index) => (
                <div key={index} className="flex gap-3 items-start border-b pb-4">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <Input
                      placeholder="圖示 (Camera, Users, Award, MapPin)"
                      value={stat.icon}
                      onChange={(e) => updateStat(index, 'icon', e.target.value)}
                    />
                    <Input
                      placeholder="數值"
                      value={stat.value}
                      onChange={(e) => updateStat(index, 'value', e.target.value)}
                    />
                    <Input
                      placeholder="標籤"
                      value={stat.label}
                      onChange={(e) => updateStat(index, 'label', e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStat(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Equipment Section */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">設備清單</h2>
              <Button type="button" onClick={addEquipment} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                新增
              </Button>
            </div>
            <div className="space-y-4">
              {content.equipment.map((eq, index) => (
                <div key={index} className="flex gap-3 items-start border-b pb-4">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="類別"
                      value={eq.category}
                      onChange={(e) => updateEquipmentCategory(index, e.target.value)}
                    />
                    <Input
                      placeholder="項目（用逗號分隔）"
                      value={eq.items.join(', ')}
                      onChange={(e) => updateEquipmentItems(index, e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEquipment(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* FAQs Section */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">常見問題</h2>
              <Button type="button" onClick={addFAQ} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                新增
              </Button>
            </div>
            <div className="space-y-4">
              {content.faqs.map((faq, index) => (
                <div key={index} className="flex gap-3 items-start border-b pb-4">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="問題"
                      value={faq.question}
                      onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                    />
                    <Textarea
                      placeholder="回答"
                      value={faq.answer}
                      onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFAQ(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Contact Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">聯絡資訊</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={content.contact.email}
                  onChange={(e) => setContent({ ...content, contact: { ...content.contact, email: e.target.value } })}
                />
              </div>
              <div>
                <Label htmlFor="location">地點</Label>
                <Input
                  id="location"
                  value={content.contact.location}
                  onChange={(e) => setContent({ ...content, contact: { ...content.contact, location: e.target.value } })}
                />
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/admin")}
            >
              取消
            </Button>
            <Button type="submit" disabled={updateMutation.isPending || isUploading}>
              {(updateMutation.isPending || isUploading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              儲存變更
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
