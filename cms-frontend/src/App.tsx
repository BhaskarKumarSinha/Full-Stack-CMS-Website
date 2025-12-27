import { Routes, Route } from "react-router-dom";
import api from "./api/api";
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLayout from "./pages/AdminLayout";
import PublicHome from "./pages/PublicHome";
import Login from "./pages/Login";
import PagesList from "./pages/PagesList";
import PageEditor from "./pages/PageEditor";
import PageBuilder from "./pages/PageBuilder";
import NewPageChooser from "./pages/NewPageChooser";
import HybridPageEditor from "./pages/HybridPageEditor";
import PageEditorWrapper from "./pages/page-builder/PageEditorWrapper";
import ImageManager from "./pages/ImageManager";
import AdminContacts from "./pages/AdminContacts";
import SiteSettings from "./pages/SiteSettings";
import NavbarSettings from "./pages/NavbarSettings";
import FooterSettings from "./pages/FooterSettings";
// import LandingPage from "./pages/LandingPage";

export default function App() {
  return (
    <Routes>
      {/* <Route path="/" element={<LandingPage />} /> */}
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="pages" element={<PagesList />} />
        <Route path="pages/new" element={<NewPageChooser />} />
        <Route path="pages/builder" element={<PageBuilder />} />
        <Route path="pages/builder/:id" element={<PageBuilder />} />
        <Route path="pages/hybrid" element={<HybridPageEditor />} />
        <Route path="media" element={<ImageManager />} />
        <Route path="contacts" element={<AdminContacts />} />
        <Route path="site-settings" element={<SiteSettings />} />
        <Route path="navbar-settings" element={<NavbarSettings />} />
        <Route path="footer-settings" element={<FooterSettings />} />
        <Route
          path="pages/pro-editor"
          element={
            <PageEditorWrapper
              onSavePage={async (html) => {
                try {
                  await api.createPage({
                    title: "New Page",
                    path: "/new-page",
                    content: html,
                  });
                  alert("Page saved successfully!");
                } catch (error) {
                  console.error("Failed to save page:", error);
                  alert("Failed to save page");
                }
              }}
            />
          }
        />
        <Route path="pages/simple" element={<PageEditor />} />
        <Route path="pages/:id" element={<PageEditor />} />
      </Route>

      {/* All other routes are public pages - fetch from backend */}
      <Route path="/*" element={<PublicHome />} />
    </Routes>
  );
}
