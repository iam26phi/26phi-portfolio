import { AdminLayout } from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Image, Eye, EyeOff, Upload, TrendingUp, BarChart3 } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.dashboard.getStats.useQuery();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">儀表板</h1>
          <p className="text-muted-foreground mt-2">歡迎回來！這裡是您的作品集概覽。</p>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">照片總數</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPhotos || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                作品集中的所有照片
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">可見照片</CardTitle>
              <Eye className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.visiblePhotos || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                前台展示的照片數量
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">隱藏照片</CardTitle>
              <EyeOff className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats?.hiddenPhotos || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                暫時不顯示的照片
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">最近上傳</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.recentUploads || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                過去 7 天內上傳
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 最近上傳的照片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              最近上傳的照片
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentUploadsList && stats.recentUploadsList.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {stats.recentUploadsList.map((photo) => (
                  <Link key={photo.id} href="/admin">
                    <div className="group cursor-pointer">
                      <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm font-medium truncate">{photo.alt}</p>
                        <p className="text-xs text-muted-foreground">{photo.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(photo.createdAt).toLocaleDateString('zh-TW')}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                過去 7 天內沒有上傳照片
              </p>
            )}
          </CardContent>
        </Card>

        {/* 分類分布統計 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              分類分布統計
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.categoryStats && Object.keys(stats.categoryStats).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(stats.categoryStats)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => {
                    const percentage = ((count / (stats.totalPhotos || 1)) * 100).toFixed(1);
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{category}</span>
                          <span className="text-muted-foreground">
                            {count} 張 ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                尚無分類統計資料
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
