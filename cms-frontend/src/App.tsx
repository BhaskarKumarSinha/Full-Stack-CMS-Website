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
