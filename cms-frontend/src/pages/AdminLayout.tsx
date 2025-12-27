import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/SideBar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen w-screen bg-slate-50 text-black">
      <Header />
      <div className="flex">
        <aside className="w-64 hidden md:block">
          <Sidebar />
        </aside>

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
