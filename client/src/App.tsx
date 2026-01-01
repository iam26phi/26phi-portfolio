import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Lazy load pages for better code splitting
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminBlog = lazy(() => import("./pages/AdminBlog"));
const AdminBlogEditor = lazy(() => import("./pages/AdminBlogEditor"));
const AdminHero = lazy(() => import("./pages/AdminHero"));
const AdminAbout = lazy(() => import("./pages/AdminAbout"));
const AdminCategories = lazy(() => import("./pages/AdminCategories"));
const AdminWatermark = lazy(() => import("./pages/AdminWatermark"));
const AdminProjects = lazy(() => import("./pages/AdminProjects"));
const AdminProjectPhotos = lazy(() => import("./pages/AdminProjectPhotos"));
const AdminChangelogs = lazy(() => import("./pages/AdminChangelogs"));
const AdminContact = lazy(() => import("./pages/AdminContact"));
const AdminCollaborators = lazy(() => import("./pages/AdminCollaborators"));
const AdminPackages = lazy(() => import("./pages/AdminPackages"));
const AdminTestimonials = lazy(() => import("./pages/AdminTestimonials"));
const Packages = lazy(() => import("./pages/Packages"));
const CollaboratorDetail = lazy(() => import("./pages/CollaboratorDetail"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Changelog = lazy(() => import("./pages/Changelog"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Contact = lazy(() => import("./pages/Contact"));

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={null}>
      <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/about"} component={About} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/:slug"} component={BlogPost} />
      <Route path={"/projects"} component={Projects} />
      <Route path={"/projects/:slug"} component={ProjectDetail} />
      <Route path={"/changelog"} component={Changelog} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/packages"} component={Packages} />
      <Route path={"/collaborators/:slug"} component={CollaboratorDetail} />
      <Route path={"/admin/dashboard"} component={AdminDashboard} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/admin/hero"} component={AdminHero} />
      <Route path={"/admin/about"} component={AdminAbout} />
      <Route path={"/admin/categories"} component={AdminCategories} />
      <Route path={"/admin/watermark"} component={AdminWatermark} />
      <Route path={"/admin/projects"} component={AdminProjects} />
      <Route path={"/admin/projects/:id/photos"} component={AdminProjectPhotos} />
      <Route path={"/admin/changelogs"} component={AdminChangelogs} />
      <Route path={"/admin/contact"} component={AdminContact} />
      <Route path={"/admin/packages"} component={AdminPackages} />
      <Route path={"/admin/collaborators"} component={AdminCollaborators} />
      <Route path={"/admin/testimonials"} component={AdminTestimonials} />
      <Route path={"/admin/blog"} component={AdminBlog} />
      <Route path={"/admin/blog/new"} component={AdminBlogEditor} />
      <Route path={"/admin/blog/edit/:id"} component={AdminBlogEditor} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
