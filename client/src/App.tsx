import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Admin from "./pages/Admin";
import AdminBlog from "./pages/AdminBlog";
import AdminBlogEditor from "./pages/AdminBlogEditor";
import AdminHero from "./pages/AdminHero";
import AdminAbout from "./pages/AdminAbout";
import AdminCategories from "./pages/AdminCategories";
import AdminWatermark from "./pages/AdminWatermark";
import AdminProjects from "./pages/AdminProjects";
import AdminProjectPhotos from "./pages/AdminProjectPhotos";
import AdminChangelogs from "./pages/AdminChangelogs";
import AdminContact from "./pages/AdminContact";
import AdminCollaborators from "./pages/AdminCollaborators";
import AdminPackages from "./pages/AdminPackages";
import CollaboratorDetail from "./pages/CollaboratorDetail";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Changelog from "./pages/Changelog";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/about"} component={About} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/:slug"} component={BlogPost} />
      <Route path={"/projects"} component={Projects} />
      <Route path={"/projects/:slug"} component={ProjectDetail} />
      <Route path={"/changelog"} component={Changelog} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/collaborators/:slug"} component={CollaboratorDetail} />
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
      <Route path={"/admin/blog"} component={AdminBlog} />
      <Route path={"/admin/blog/new"} component={AdminBlogEditor} />
      <Route path={"/admin/blog/edit/:id"} component={AdminBlogEditor} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
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
