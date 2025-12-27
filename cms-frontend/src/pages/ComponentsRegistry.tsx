import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

type Comp = { name: string; description?: string };

export default function ComponentsRegistry() {
  const [components, setComponents] = useState<Comp[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getComponents();
        const items = res.data?.items ?? res.data ?? [];
        setComponents(items);
      } catch {
        // Ignore errors
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!query) return components;
    const q = query.toLowerCase();
    return components.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q)
    );
  }, [components, query]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold">Components Registry</h2>
            <p className="text-sm text-gray-500">
              Manage reusable components used across pages
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search components"
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-black text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button
              onClick={() => nav("/admin/components/new")}
              className="px-4 py-2 rounded-lg bg-white text-black border border-gray-200"
            >
              New Component
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 bg-white rounded shadow">
            Loading components...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c) => (
              <div
                key={c.name}
                className="bg-white rounded-lg border p-4 shadow hover:shadow-md transition"
              >
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-sm text-gray-500 mt-2">
                  {c.description || "No description"}
                </p>
                <div className="mt-4 flex justify-end">
                  <button className="text-sm text-blue-600 hover:underline">
                    Edit
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full p-6 text-center text-gray-500">
                No components found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
