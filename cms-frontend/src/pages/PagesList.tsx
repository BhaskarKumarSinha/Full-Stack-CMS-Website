import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import { Link } from "react-router-dom";
import type { ErrorResponse } from "../types";

type AdminPage = {
  id?: string;
  _id?: string;
  slug?: string;
  path: string;
  title?: string;
  status?: string;
  updatedAt?: string;
};

export default function PagesList() {
  const [pages, setPages] = useState<AdminPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPages = async () => {
      setLoading(true);
      try {
        const res = await api.getPages();
        // backend may return { items, count } or raw array
        const items = res.data?.items ?? res.data ?? [];
        setPages(items);
      } catch (err: unknown) {
        const error = err as ErrorResponse;
        setError(
          error?.response?.data?.message || error?.message || "Failed to load"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPages();
  }, []);

  const handleDelete = async (pageId: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${
          title || "this page"
        }"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(pageId);
    try {
      await api.deletePage(pageId);
      setPages(pages.filter((p) => (p.id || p._id) !== pageId));
      setError("");
    } catch (err: unknown) {
      const error = err as ErrorResponse;
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete page"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    if (!query) return pages;
    const q = query.toLowerCase();
    return pages.filter(
      (p) =>
        String(p.title || "")
          .toLowerCase()
          .includes(q) ||
        String(p.path || "")
          .toLowerCase()
          .includes(q) ||
        String(p.slug || "")
          .toLowerCase()
          .includes(q)
    );
  }, [pages, query]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold">Pages</h2>
            <p className="text-sm text-gray-500">
              Create, edit and publish pages
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages by title, path or slug"
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <Link
              to="/admin/pages/new"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
            >
              ➕ New Page
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-8 bg-white rounded shadow">Loading pages...</div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded">
            {error}
          </div>
        ) : (
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                    Path
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                    Updated
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const pageId = p.id || p._id || "";
                  return (
                    <tr key={pageId} className="border-t">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {p.title || "(no title)"}
                        </div>
                        <div className="text-sm text-gray-500">{p.slug}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {p.path}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            p.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {p.updatedAt
                          ? new Date(p.updatedAt).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/admin/pages/builder/${pageId}`}
                            className="text-blue-600 hover:underline text-sm font-medium"
                          >
                            Edit
                          </Link>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleDelete(pageId, p.title || "")}
                            disabled={deletingId === pageId}
                            className="text-red-600 hover:underline text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingId === pageId ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No pages found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
