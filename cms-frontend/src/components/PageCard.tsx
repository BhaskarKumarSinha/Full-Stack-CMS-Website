import { Link } from "react-router-dom";
import type { Page } from "../types";

export default function PageCard({ page }: { page: Page }) {
  return (
    <div className="border p-3 rounded bg-white">
      <h3 className="font-semibold">{page.title}</h3>
      <p className="text-sm text-gray-600">{page.path}</p>
      <div className="mt-2 flex gap-2">
        <Link to={`/admin/pages/${page._id}`} className="text-sm underline">
          Edit
        </Link>
      </div>
    </div>
  );
}
