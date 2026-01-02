import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "../auth/useAuth";
import api from "../api/api";

export default function Header() {
  const { logout } = useAuth();
  const [brandName, setBrandName] = useState("Dashboard");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getSiteConfig();
        if (res && res.data && res.data.navConfig?.brandName) {
          setBrandName(res.data.navConfig.brandName);
        }
      } catch (err) {
        console.error("Failed to load site config:", err);
      }
    })();
  }, []);

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <Link to="/" className="font-bold text-lg">
        {brandName}
      </Link>
      <div className="flex items-center gap-3">
        <button
          onClick={logout}
          className="text-sm px-3 py-1 border rounded text-white bg-gray-800 hover:bg-gray-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
