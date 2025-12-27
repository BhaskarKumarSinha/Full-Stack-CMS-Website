import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-56 p-4 border-r hidden md:block">
      <nav className="flex flex-col gap-3">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) => (isActive ? "font-semibold" : "")}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/admin/pages"
          className={({ isActive }) => (isActive ? "font-semibold" : "")}
        >
          Pages
        </NavLink>
        <NavLink
          to="/admin/pages/new"
          className={({ isActive }) => (isActive ? "font-semibold" : "")}
        >
          New Page
        </NavLink>
        <NavLink
          to="/admin/media"
          className={({ isActive }) => (isActive ? "font-semibold" : "")}
        >
          Media Manager
        </NavLink>
        <NavLink
          to="/admin/navbar-settings"
          className={({ isActive }) => (isActive ? "font-semibold" : "")}
        >
          Navbar Settings
        </NavLink>
        <NavLink
          to="/admin/site-settings"
          className={({ isActive }) => (isActive ? "font-semibold" : "")}
        >
          Site Settings
        </NavLink>
        <NavLink
          to="/admin/footer-settings"
          className={({ isActive }) => (isActive ? "font-semibold" : "")}
        >
          Footer Settings
        </NavLink>
        <NavLink
          to="/admin/contacts"
          className={({ isActive }) => (isActive ? "font-semibold" : "")}
        >
          Contact Submissions
        </NavLink>
      </nav>
    </aside>
  );
}
