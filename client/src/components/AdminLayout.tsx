import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Image, 
  Palette, 
  FileText, 
  FolderOpen, 
  Users, 
  Settings, 
  History, 
  Mail, 
  Package,
  ChevronLeft,
  ChevronRight,
  Home,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: "作品集照片",
    href: "/admin",
    icon: Image,
  },
  {
    title: "分類管理",
    href: "/admin/categories",
    icon: FolderOpen,
  },
  {
    title: "英雄區域",
    href: "/admin/hero",
    icon: Sparkles,
  },
  {
    title: "關於我",
    href: "/admin/about",
    icon: FileText,
  },
  {
    title: "部落格",
    href: "/admin/blog",
    icon: FileText,
  },
  {
    title: "專案管理",
    href: "/admin/projects",
    icon: FolderOpen,
  },
  {
    title: "合作對象",
    href: "/admin/collaborators",
    icon: Users,
  },
  {
    title: "拍攝方案",
    href: "/admin/packages",
    icon: Package,
  },
  {
    title: "浮水印",
    href: "/admin/watermark",
    icon: Palette,
  },
  {
    title: "聯絡表單",
    href: "/admin/contact",
    icon: Mail,
  },
  {
    title: "更新日誌",
    href: "/admin/changelogs",
    icon: History,
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location === "/admin" || location === "/admin/";
    }
    return location.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-[#1a1a1a] text-white transition-all duration-300 z-50 flex flex-col",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {!collapsed && (
            <Link href="/">
              <a className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Home className="w-5 h-5" />
                <span className="font-mono font-bold">26phi</span>
              </a>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-white hover:bg-gray-800 ml-auto"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex items-center gap-3 px-4 py-3 transition-colors relative",
                  isActive(item.href)
                    ? "bg-gray-800 text-[#f59e0b]"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
                title={collapsed ? item.title : undefined}
              >
                {isActive(item.href) && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#f59e0b]" />
                )}
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.title}</span>
                )}
              </a>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-800 p-4">
          {!collapsed && (
            <div className="text-xs text-gray-500">
              <p>© 2026 26phi</p>
              <p>管理員後台 v2.0</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          collapsed ? "ml-16" : "ml-60"
        )}
      >
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
