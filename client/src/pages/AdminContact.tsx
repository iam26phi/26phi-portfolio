import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Mail, Phone, Calendar, DollarSign, Trash2, Eye, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";

export default function AdminContact() {
  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(null);
  
  const { data: submissions = [], refetch } = trpc.contact.listAll.useQuery();
  
  const updateStatusMutation = trpc.contact.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("狀態已更新");
      refetch();
    },
    onError: (error) => {
      toast.error(`更新失敗：${error.message}`);
    },
  });

  const deleteMutation = trpc.contact.delete.useMutation({
    onSuccess: () => {
      toast.success("聯絡請求已刪除");
      setSelectedSubmission(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`刪除失敗：${error.message}`);
    },
  });

  const handleStatusChange = (id: number, status: 'new' | 'read' | 'replied' | 'archived') => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = (id: number) => {
    if (confirm("確定要刪除這個聯絡請求嗎？")) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      new: { variant: "default", label: "新訊息" },
      read: { variant: "secondary", label: "已讀" },
      replied: { variant: "outline", label: "已回覆" },
      archived: { variant: "destructive", label: "已封存" },
    };
    const config = variants[status] || variants.new;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getShootingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      portrait: "人像攝影",
      wedding: "婚禮紀錄",
      commercial: "商業攝影",
      event: "活動紀錄",
      product: "商品攝影",
      other: "其他",
    };
    return labels[type] || type;
  };

  const selectedSubmissionData = submissions.find(s => s.id === selectedSubmission);

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin">
              <a className="inline-flex items-center text-neutral-400 hover:text-white mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回管理後台
              </a>
            </Link>
            <h1 className="text-4xl font-bold">聯絡表單管理</h1>
            <p className="text-neutral-400 mt-2">查看和管理所有聯絡請求</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-400">總共</p>
            <p className="text-3xl font-bold">{submissions.length}</p>
            <p className="text-sm text-neutral-400">個請求</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions List */}
          <div className="lg:col-span-2 space-y-4">
            {submissions.length === 0 ? (
              <Card className="bg-neutral-900 border-neutral-800">
                <CardContent className="pt-6 text-center text-neutral-400">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>目前沒有聯絡請求</p>
                </CardContent>
              </Card>
            ) : (
              submissions.map((submission) => (
                <Card
                  key={submission.id}
                  className={`bg-neutral-900 border-neutral-800 cursor-pointer transition-all hover:border-neutral-700 ${
                    selectedSubmission === submission.id ? "ring-2 ring-white" : ""
                  }`}
                  onClick={() => setSelectedSubmission(submission.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{submission.name}</CardTitle>
                          {getStatusBadge(submission.status)}
                        </div>
                        <CardDescription className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {submission.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true, locale: zhTW })}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-400 mb-1">拍攝類型</p>
                        <p className="font-medium">{getShootingTypeLabel(submission.shootingType)}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400 mb-1">預算範圍</p>
                        <p className="font-medium">{submission.budget}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-neutral-400 text-sm mb-1">訊息內容</p>
                      <p className="text-sm line-clamp-2">{submission.message}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selectedSubmissionData ? (
              <Card className="bg-neutral-900 border-neutral-800 sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>詳細資訊</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(selectedSubmissionData.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status */}
                  <div>
                    <label className="text-sm text-neutral-400 mb-2 block">狀態</label>
                    <Select
                      value={selectedSubmissionData.status}
                      onValueChange={(value: 'new' | 'read' | 'replied' | 'archived') =>
                        handleStatusChange(selectedSubmissionData.id, value)
                      }
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger className="bg-neutral-800 border-neutral-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">新訊息</SelectItem>
                        <SelectItem value="read">已讀</SelectItem>
                        <SelectItem value="replied">已回覆</SelectItem>
                        <SelectItem value="archived">已封存</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-neutral-400 mb-1">姓名</p>
                      <p className="font-medium">{selectedSubmissionData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400 mb-1">電子郵件</p>
                      <a
                        href={`mailto:${selectedSubmissionData.email}`}
                        className="font-medium text-blue-400 hover:underline"
                      >
                        {selectedSubmissionData.email}
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400 mb-1">拍攝類型</p>
                      <p className="font-medium">{getShootingTypeLabel(selectedSubmissionData.shootingType)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400 mb-1">預算範圍</p>
                      <p className="font-medium">{selectedSubmissionData.budget}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400 mb-1">提交時間</p>
                      <p className="font-medium">
                        {new Date(selectedSubmissionData.createdAt).toLocaleString("zh-TW")}
                      </p>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <p className="text-sm text-neutral-400 mb-2">訊息內容</p>
                    <div className="bg-neutral-800 rounded-lg p-4 text-sm whitespace-pre-wrap">
                      {selectedSubmissionData.message}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-neutral-800 space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => {
                        window.location.href = `mailto:${selectedSubmissionData.email}?subject=回覆：您的拍攝詢問`;
                        handleStatusChange(selectedSubmissionData.id, "replied");
                      }}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      回覆郵件
                    </Button>
                    {selectedSubmissionData.status !== "archived" && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleStatusChange(selectedSubmissionData.id, "archived")}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        封存請求
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-neutral-900 border-neutral-800">
                <CardContent className="pt-6 text-center text-neutral-400">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>選擇一個請求以查看詳細資訊</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
