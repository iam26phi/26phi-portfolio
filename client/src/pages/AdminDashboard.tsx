import { AdminLayout } from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Image, Eye, EyeOff, Upload, TrendingUp, BarChart3, ArrowUp, ArrowDown } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.dashboard.getStats.useQuery();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  // 計算趨勢（這裡是示例，實際應該從後端獲取）
  const trends = {
    totalPhotos: { value: 0, isUp: true },
    visiblePhotos: { value: 0, isUp: true },
    hiddenPhotos: { value: 0, isUp: false },
    recentUploads: { value: stats?.recentUploads || 0, isUp: true }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* 標題區域 */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
            儀表板
          </h1>
          <p className="text-lg text-muted-foreground">歡迎回來！這裡是您的作品集概覽。</p>
        </div>

        {/* 統計卡片 - 升級版 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 照片總數 */}
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">照片總數</CardTitle>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Image className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold">{stats?.totalPhotos || 0}</div>
                {trends.totalPhotos.value > 0 && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${trends.totalPhotos.isUp ? 'text-green-600' : 'text-red-600'}`}>
                    {trends.totalPhotos.isUp ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    {trends.totalPhotos.value}
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                作品集中的所有照片
              </p>
            </CardContent>
          </Card>

          {/* 可見照片 */}
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">可見照片</CardTitle>
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-green-600">{stats?.visiblePhotos || 0}</div>
                {trends.visiblePhotos.value > 0 && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${trends.visiblePhotos.isUp ? 'text-green-600' : 'text-red-600'}`}>
                    {trends.visiblePhotos.isUp ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    {trends.visiblePhotos.value}
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                前台展示的照片數量
              </p>
              {stats?.totalPhotos && stats.totalPhotos > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>可見率</span>
                    <span>{((stats.visiblePhotos / stats.totalPhotos) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-400 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.visiblePhotos / stats.totalPhotos) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 隱藏照片 */}
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">隱藏照片</CardTitle>
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <EyeOff className="h-5 w-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-amber-600">{stats?.hiddenPhotos || 0}</div>
                {trends.hiddenPhotos.value > 0 && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${trends.hiddenPhotos.isUp ? 'text-green-600' : 'text-red-600'}`}>
                    {trends.hiddenPhotos.isUp ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    {trends.hiddenPhotos.value}
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                暫時不顯示的照片
              </p>
              {stats?.totalPhotos && stats.totalPhotos > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>隱藏率</span>
                    <span>{((stats.hiddenPhotos / stats.totalPhotos) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-400 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.hiddenPhotos / stats.totalPhotos) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 最近上傳 */}
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">最近上傳</CardTitle>
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-purple-600">{stats?.recentUploads || 0}</div>
                {trends.recentUploads.value > 0 && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${trends.recentUploads.isUp ? 'text-green-600' : 'text-red-600'}`}>
                    {trends.recentUploads.isUp ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    {trends.recentUploads.value}
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                過去 7 天內上傳
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 最近上傳的照片 */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-500/5 to-transparent">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Upload className="h-4 w-4 text-amber-600" />
              </div>
              最近上傳的照片
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {stats?.recentUploadsList && stats.recentUploadsList.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {stats.recentUploadsList.map((photo) => (
                  <Link key={photo.id} href="/admin">
                    <div className="group cursor-pointer">
                      <div className="aspect-square overflow-hidden rounded-xl bg-muted shadow-md group-hover:shadow-xl transition-all duration-300 ring-1 ring-black/5">
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="text-sm font-medium truncate group-hover:text-amber-600 transition-colors">{photo.alt}</p>
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
              <div className="text-center py-16">
                <div className="inline-flex h-16 w-16 rounded-full bg-muted items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">過去 7 天內沒有上傳照片</p>
                <p className="text-sm text-muted-foreground mt-2">開始上傳您的作品吧！</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 分類分布統計 */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              分類分布統計
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {stats?.categoryStats && Object.keys(stats.categoryStats).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(stats.categoryStats)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count], index) => {
                    const percentage = ((count / (stats.totalPhotos || 1)) * 100).toFixed(1);
                    const colors = [
                      'from-amber-500 to-amber-400',
                      'from-blue-500 to-blue-400',
                      'from-green-500 to-green-400',
                      'from-purple-500 to-purple-400',
                      'from-pink-500 to-pink-400',
                      'from-indigo-500 to-indigo-400',
                    ];
                    const colorClass = colors[index % colors.length];
                    
                    return (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-base">{category}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">
                              {count} 張
                            </span>
                            <span className="text-sm font-semibold min-w-[3rem] text-right">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                        <div className="relative w-full bg-muted/50 rounded-full h-3 overflow-hidden shadow-inner">
                          <div
                            className={`bg-gradient-to-r ${colorClass} h-3 rounded-full transition-all duration-700 ease-out shadow-sm`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex h-16 w-16 rounded-full bg-muted items-center justify-center mb-4">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">尚無分類統計資料</p>
                <p className="text-sm text-muted-foreground mt-2">開始為您的照片設定分類吧！</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
