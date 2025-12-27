import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import type { ErrorResponse } from "../types";

export default function ComponentEditor() {
  const [type, setType] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!type.trim()) {
      alert("Type is required");
      return;
    }

    setLoading(true);
    try {
      console.log("Creating component:", { type, displayName, category });
      const res = await api.createComponent({ type, displayName, category });
      console.log("Component created:", res.data);
      // created - go back to list
      nav("/admin/components");
    } catch (err: unknown) {
      const error = err as ErrorResponse;
      console.error("Create component error:", err);
      let message = "Failed to create component";

      // Handle 401 specifically
      const status = (error?.response as Record<string, unknown>)?.status as
        | number
        | undefined;
      if (status === 401) {
        message = "Session expired. Please login again.";
        localStorage.removeItem("cms_token");
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      }

      const data = error?.response?.data as Record<string, unknown>;
      if (Array.isArray(data?.issues)) {
        message = (data.issues as string[]).join(", ");
      }

      console.error("Final error message:", message);
      alert(error?.message || message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-black">New Component</h2>
        <form
          onSubmit={submit}
          className="bg-white p-6 rounded shadow space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <input
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Display name
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => nav("/admin/components")}
              className="px-4 py-2 mr-2 border rounded"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
