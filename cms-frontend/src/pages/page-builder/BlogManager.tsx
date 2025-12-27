import { useState } from "react";
import BlogEditor, { type BlogContent } from "./BlogEditor";

export interface SectionWithBlogs {
  sectionId: string;
  sectionName: string;
  blogs: BlogContent[];
}

interface BlogManagerProps {
  section: SectionWithBlogs;
  onUpdate: (section: SectionWithBlogs) => void;
}

export default function BlogManager({ section, onUpdate }: BlogManagerProps) {
  const [expandedBlogIndex, setExpandedBlogIndex] = useState<number | null>(
    null
  );

  const addNewBlog = () => {
    const newBlog: BlogContent = {
      title: "New Blog Post",
      subtitle: "Add a compelling subtitle that draws readers in",
      author: "John Doe",
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      featuredImage:
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=600&fit=crop",
      blocks: [
        {
          id: `block-${Date.now()}-1`,
          type: "paragraph",
          content:
            "Welcome to your new blog post. Start writing your content here...",
        },
      ],
      styles: {
        headerBackground: "#ffffff",
        titleColor: "#1f2937",
        textColor: "#374151",
        accentColor: "#3b82f6",
      },
    };

    onUpdate({
      ...section,
      blogs: [...section.blogs, newBlog],
    });
    // Auto-expand the newly created blog (last index)
    setExpandedBlogIndex(section.blogs.length);
  };

  const updateBlog = (index: number, updatedBlog: BlogContent) => {
    const newBlogs = [...section.blogs];
    newBlogs[index] = updatedBlog;
    onUpdate({
      ...section,
      blogs: newBlogs,
    });
  };

  const deleteBlog = (index: number) => {
    onUpdate({
      ...section,
      blogs: section.blogs.filter((_, idx) => idx !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-purple-100 to-blue-100 border-2 border-purple-300 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              📚 Blog Posts Section
            </h3>
            <p className="text-gray-700">
              Create rich blog content with headings, paragraphs, images, and
              more
            </p>
          </div>
          <button
            onClick={addNewBlog}
            className="px-6 py-3 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all shadow-lg flex items-center gap-2"
          >
            ✨ Create New Blog
          </button>
        </div>

        {section.blogs.length > 0 && (
          <div className="mt-6 bg-white rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700">
              Total Blogs:{" "}
              <span className="text-purple-600">{section.blogs.length}</span>
            </p>
          </div>
        )}
      </div>

      {section.blogs.length === 0 && (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">
            No Blog Posts Yet
          </h4>
          <p className="text-gray-600 mb-4">
            Click "Create New Blog" to start writing your first blog post
          </p>
        </div>
      )}

      {/* Blog List */}
      <div className="space-y-6">
        {section.blogs.map((blog, index) => (
          <div
            key={index}
            className="border-l-4 border-purple-500 pl-4 shadow-lg rounded-r-lg"
          >
            <BlogEditor
              blog={blog}
              onChange={(updated) => updateBlog(index, updated)}
              onDelete={() => deleteBlog(index)}
              initialExpanded={index === expandedBlogIndex}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
