import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-black">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview and quick actions</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/pages" className="block">
          <div className="rounded-lg border bg-white p-6 shadow hover:shadow-md transition">
            <h2 className="text-lg font-semibold">Pages</h2>
            <p className="text-sm text-gray-500 mt-2">
              Create, edit and publish site pages
            </p>
          </div>
        </Link>

        <Link to="/admin/pages/builder" className="block">
          <div className="rounded-lg border bg-white p-6 shadow hover:shadow-md transition">
            <h2 className="text-lg font-semibold">Page Builder</h2>
            <p className="text-sm text-gray-500 mt-2">
              Create a page with sections and custom navigation/footer
            </p>
          </div>
        </Link>

        <Link to="/admin/pages/simple" className="block">
          <div className="rounded-lg border bg-white p-6 shadow hover:shadow-md transition">
            <h2 className="text-lg font-semibold">New Page</h2>
            <p className="text-sm text-gray-500 mt-2">
              Create a new page for the site
            </p>
          </div>
        </Link>

        <Link to="/admin/media" className="block">
          <div className="rounded-lg border bg-white p-6 shadow hover:shadow-md transition">
            <h2 className="text-lg font-semibold">Image Manager</h2>
            <p className="text-sm text-gray-500 mt-2">
              Upload and manage images for pages
            </p>
          </div>
        </Link>
        <Link to="/admin/site-settings" className="block">
          <div className="rounded-lg border bg-white p-6 shadow hover:shadow-md transition">
            <h2 className="text-lg font-semibold">Site Settings</h2>
            <p className="text-sm text-gray-500 mt-2">
              Edit global nav, footer and styles
            </p>
          </div>
        </Link>
        <Link to="/admin/navbar-settings" className="block">
          <div className="rounded-lg border bg-white p-6 shadow hover:shadow-md transition">
            <h2 className="text-lg font-semibold">Navbar Settings</h2>
            <p className="text-sm text-gray-500 mt-2">
              Edit site navigation, logo and menu items
            </p>
          </div>
        </Link>

        <Link to="/admin/footer-settings" className="block">
          <div className="rounded-lg border bg-white p-6 shadow hover:shadow-md transition">
            <h2 className="text-lg font-semibold">Footer Settings</h2>
            <p className="text-sm text-gray-500 mt-2">
              Edit site footer columns, company info and links
            </p>
          </div>
        </Link>
      </section>
    </div>
  );
}
