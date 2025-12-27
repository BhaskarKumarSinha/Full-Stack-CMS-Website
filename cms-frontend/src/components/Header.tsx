import { Link } from "react-router-dom";
import useAuth from "../auth/useAuth";

export default function Header() {
  const { logout } = useAuth();
  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <Link to="/" className="font-bold text-lg">
        CMS Frontend
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
