import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import type { ErrorResponse } from "../types";

export default function PageEditor() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [path, setPath] = useState("/");
  const [content, setContent] = useState("<h1>Hello</h1>");
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await api.getPageById(id);
        const found = res.data;
        if (found) {
          setTitle(found.title || "");
          setPath(found.path || "/");

          // Convert layout (Block array) to content (HTML string)
          let contentHtml = "";
          if (found.layout && Array.isArray(found.layout)) {
            contentHtml = found.layout
              .map(
                (block: { type: string; props?: Record<string, string> }) =>
                  block.props?.html || ""
              )
              .join("");
          }
          setContent(contentHtml || found.content || "");

          // Convert status string to published boolean
          setPublished(
            found.status === "published" || Boolean(found.published)
          );
        }
      } catch {
        // Ignore load errors
      }
    })();
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await api.updatePage(id, { title, path, content, published });
      } else {
        console.log("Creating page with:", { title, path, content });
        const created = await api.createPage({
          title,
          path,
          content,
          published: true,
        });
        console.log("Created page:", created.data);
        // Auto-publish the page immediately
        if (created.data?.id) {
          const publishRes = await api.publishPage(created.data.id);
          console.log("Published page:", publishRes.data);
        } else if (created.data?._id) {
          const publishRes = await api.publishPage(created.data._id);
          console.log("Published page (via _id):", publishRes.data);
        }
      }
      nav("/admin/pages");
    } catch (err: unknown) {
      const error = err as ErrorResponse;
      alert(
        error?.response?.data?.message || error?.message || "Failed to save"
      );
    } finally {
      setLoading(false);
    }
  };

  const doPublish = async () => {
    if (!id) return;
    try {
      await api.publishPage(id);
      setPublished(true);
      alert("Page published");
    } catch (err: unknown) {
      const error = err as ErrorResponse;
      alert(
        error?.response?.data?.message || error?.message || "Publish failed"
      );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">{id ? "Edit" : "New"} Page</h2>
          <p className="text-sm text-gray-500">
            Create or update a page and preview changes
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={doPublish}
            disabled={!id || published}
            className={`px-4 py-2 rounded-lg text-white ${
              published ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {published ? "Published" : "Publish"}
          </button>
          <button
            onClick={() => nav("/admin/pages")}
            className="px-4 py-2 rounded-lg border"
          >
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form
          onSubmit={submit}
          className="lg:col-span-2 bg-white rounded shadow p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded border-gray-200 px-3 py-2 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Path
            </label>
            <input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="mt-1 block w-full rounded border-gray-200 px-3 py-2 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Content (HTML)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="mt-1 block w-full rounded border-gray-200 px-3 py-2 font-mono text-black"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              <span className="text-sm text-gray-700">Published</span>
            </label>
            <div>
              <button
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>

        <aside className="bg-white rounded shadow p-6">
          <h3 className="text-lg font-semibold mb-3">Preview</h3>
          <div
            className="bg-gray-50 p-4 rounded border border-gray-200"
            style={{ color: "#111" }}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: content || "<p style='color: #999;'>No content</p>",
              }}
              style={{ color: "#111" }}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
