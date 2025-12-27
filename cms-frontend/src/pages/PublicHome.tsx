import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/api";
import type { ErrorResponse } from "../types";

export default function PublicHome() {
  const loc = useLocation();
  const [html, setHtml] = useState<string>("");
  const [styles, setStyles] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const htmlRef = useRef<HTMLDivElement>(null);

  // Execute scripts when HTML is updated
  useEffect(() => {
    if (htmlRef.current && html) {
      try {
        // Find all script tags in the rendered HTML and execute them
        const scripts = htmlRef.current.querySelectorAll("script");
        scripts.forEach((oldScript: HTMLScriptElement) => {
          const newScript = document.createElement("script");
          Array.from(oldScript.attributes).forEach((attr: Attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });
          if (oldScript.textContent) {
            newScript.textContent = oldScript.textContent;
          }
          // Execute the script by replacing it
          oldScript.parentNode?.replaceChild(newScript, oldScript);
        });
      } catch (err) {
        console.error("Error executing scripts:", err);
      }
    }
  }, [html]);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      console.log("Fetching page for path:", loc.pathname);
      try {
        const res = await api.getPublicByPath(loc.pathname);
        const page = res.data;

        console.log("API Response:", res);
        console.log("Page object:", page);
        console.log("Page content exists:", !!page?.content);
        console.log("Page content length:", page?.content?.length || 0);

        if (!page) {
          setError("Page not found in database");
          setLoading(false);
          return;
        }

        const content = page.content;
        if (!content) {
          setError(
            "Page has no content. Please edit and save it in the admin dashboard."
          );
          setLoading(false);
          return;
        }

        console.log(
          "Fetched page from path:",
          loc.pathname,
          "Content length:",
          content.length,
          "Is HTML doc:",
          content.includes("<!DOCTYPE html>")
        );

        // If it's a full HTML document, render it directly in an iframe or extract properly
        if (content.includes("<!DOCTYPE html>")) {
          // For full HTML documents, extract both styles from head and body content
          // Extract head styles
          const headMatch = content.match(/<head[^>]*>([\s\S]*?)<\/head>/);
          const headContent = headMatch ? headMatch[1] : "";
          const styleMatch = headContent.match(
            /<style[^>]*>([\s\S]*?)<\/style>/
          );
          const extractedStyles = styleMatch ? styleMatch[1] : "";

          // Extract body content
          const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/);
          const bodyContent = bodyMatch ? bodyMatch[1] : "";
          console.log("Extracted body length:", bodyContent.length);
          console.log("Extracted styles length:", extractedStyles.length);

          // Set HTML to body content and styles separately
          if (bodyContent && bodyContent.trim().length > 0) {
            setHtml(bodyContent);
            setStyles(extractedStyles);
          } else {
            // Fallback: render entire content
            console.warn("Body extraction failed, using full content");
            setHtml(content);
            setStyles("");
          }
        } else {
          setHtml(content);
          setStyles("");
        }
        setError(null);
      } catch (e: unknown) {
        const err = e as ErrorResponse;
        const errorMsg =
          err?.response?.data?.message || err?.message || "Not found";
        console.error("Error fetching page:", errorMsg, "Path:", loc.pathname);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [loc.pathname]);

  if (loading) return <div className="p-8 text-center">Loading page...</div>;
  if (error)
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="border-l-4 border-red-600 bg-red-50 p-4">
          <div className="text-red-600 font-bold mb-2">Error: {error}</div>
          <div className="text-gray-600 text-sm">
            <p>
              Path requested:{" "}
              <code className="bg-white px-2 py-1">{loc.pathname}</code>
            </p>
          </div>
          <div className="mt-4 text-sm">
            <p className="mb-2">
              💡 <strong>Solution:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Go to{" "}
                <a
                  href="/admin/pages"
                  className="text-blue-600 hover:underline"
                >
                  Admin Dashboard
                </a>
              </li>
              <li>Click "Page Builder"</li>
              <li>
                Create a new page with path:{" "}
                <code className="bg-white px-2 py-1">{loc.pathname}</code>
              </li>
              <li>Add content to all sections</li>
              <li>Click "Save Page"</li>
              <li>Return here to view it</li>
            </ol>
          </div>
        </div>
      </div>
    );
  if (!html)
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="border-l-4 border-yellow-600 bg-yellow-50 p-4">
          <div className="text-yellow-600 font-bold mb-2">No Content</div>
          <p className="text-gray-600">
            The page was found but has no content.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <a href="/admin/pages" className="text-blue-600 hover:underline">
              Edit this page
            </a>{" "}
            in the admin dashboard to add content.
          </p>
        </div>
      </div>
    );
  // Render with extracted styles
  return (
    <>
      {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}
      <div ref={htmlRef} dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
