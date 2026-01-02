/**
 * @file App.tsx
 * @description Main Application Component - Root Router Configuration
 *
 * This component defines the entire routing structure of the CMS frontend:
 *
 * @routes
 * PUBLIC ROUTES:
 * - /login - User authentication page
 * - /* - Dynamic public pages (fetched from backend)
 *
 * ADMIN ROUTES (Protected):
 * - /admin - Dashboard overview
 * - /admin/pages - Page listing and management
 * - /admin/pages/builder - Visual page builder (drag-and-drop)
 * - /admin/pages/builder/:id - Edit existing page in builder
 * - /admin/media - Image/media asset manager
 * - /admin/contacts - Contact form submissions
 * - /admin/site-settings - Global site configuration
 * - /admin/navbar-settings - Navigation bar customization
 * - /admin/footer-settings - Footer customization
 * - /admin/page-code - Code-based page editor
 *
 * @authentication
 * Admin routes are wrapped in ProtectedRoute component which:
 * - Checks for valid JWT token in localStorage
 * - Redirects to /login if unauthenticated
 * - Passes through if authenticated
 *
 * @layout
 * AdminLayout provides consistent sidebar and header for all admin pages.
 *
 * @hooks
 * useSiteFont() - Applies global font family from site config
 */

import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLayout from "./pages/AdminLayout";
import PublicHome from "./pages/PublicHome";
import Login from "./pages/Login";
import PagesList from "./pages/PagesList";
import PageEditor from "./pages/PageEditor";
import PageBuilder from "./pages/PageBuilder";
import ImageManager from "./pages/ImageManager";
import AdminContacts from "./pages/AdminContacts";
import SiteSettings from "./pages/SiteSettings";
import NavbarSettings from "./pages/NavbarSettings";
import FooterSettings from "./pages/FooterSettings";
import PageCodeEditor from "./pages/PageCodeEditor";
import { useSiteFont } from "./hooks/useSiteFont";
// import LandingPage from "./pages/LandingPage";

export default function App() {
  // Apply global font family from site configuration
  useSiteFont();

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
        <Route path="pages/builder" element={<PageBuilder />} />
        <Route path="pages/builder/:id" element={<PageBuilder />} />
        <Route path="media" element={<ImageManager />} />
        <Route path="contacts" element={<AdminContacts />} />
        <Route path="site-settings" element={<SiteSettings />} />
        <Route path="navbar-settings" element={<NavbarSettings />} />
        <Route path="footer-settings" element={<FooterSettings />} />
        <Route path="page-code" element={<PageCodeEditor />} />
        <Route path="page-code/:id" element={<PageCodeEditor />} />
        <Route path="pages/simple" element={<PageEditor />} />
        <Route path="pages/:id" element={<PageEditor />} />
      </Route>

      {/* All other routes are public pages - fetch from backend */}
      <Route path="/*" element={<PublicHome />} />
    </Routes>
  );
}
