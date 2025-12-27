import { useState } from "react";
import ImagePicker from "../../components/ImagePicker";
import VideoPicker from "../../components/VideoPicker";

export interface BlogBlock {
  id: string;
  type:
    | "heading"
    | "subheading"
    | "paragraph"
    | "image"
    | "image-grid"
    | "quote"
    | "divider"
    | "link"
    | "list"
    | "cta-button"
    | "video"
    | "video-grid";
  content?: string;
  images?: string[];
  alt?: string;
  linkUrl?: string;
  linkText?: string;
  openInNewTab?: boolean;
  listItems?: string[];
  listStyle?: "bullet" | "number" | "alpha";
  // CTA Button properties
  ctaText?: string;
  ctaUrl?: string;
  ctaStyle?: "primary" | "secondary" | "outline";
  ctaSize?: "small" | "medium" | "large";
  // Video properties
  videoUrl?: string;
  videoType?: "youtube" | "vimeo" | "uploaded";
  // Video Grid properties
  videoUrls?: string[];
  videoGridType?: "youtube" | "vimeo" | "uploaded";
  videoGridCols?: 2 | 3 | 4;
}

export interface BlogContent {
  title: string;
  subtitle: string;
  author: string;
  date: string;
  featuredImage: string;
  blocks: BlogBlock[];
  styles: {
    headerBackground: string;
    titleColor: string;
    textColor: string;
    accentColor: string;
  };
}

interface BlogEditorProps {
  blog: BlogContent;
  onChange: (blog: BlogContent) => void;
  onDelete?: () => void;
  initialExpanded?: boolean;
}

export default function BlogEditor({
  blog,
  onChange,
  onDelete,
  initialExpanded = false,
}: BlogEditorProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const updateBlogField = (field: keyof BlogContent, value: unknown) => {
    onChange({ ...blog, [field]: value });
  };

  const updateStyle = (field: keyof typeof blog.styles, value: string) => {
    onChange({
      ...blog,
      styles: { ...blog.styles, [field]: value },
    });
  };

  const addBlock = (type: BlogBlock["type"]) => {
    const newBlock: BlogBlock = {
      id: `block-${Date.now()}`,
      type,
      content:
        type === "heading"
          ? "New Heading"
          : type === "subheading"
          ? "New Subheading"
          : type === "paragraph"
          ? "Write your content here..."
          : type === "quote"
          ? "Your quote here"
          : "",
      linkUrl: type === "link" ? "https://" : undefined,
      linkText: type === "link" ? "Click here" : undefined,
      openInNewTab: type === "link" ? true : undefined,
      listItems:
        type === "list"
          ? ["First item", "Second item", "Third item"]
          : undefined,
      listStyle: type === "list" ? "bullet" : undefined,
      images:
        type === "image"
          ? [
              "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop",
            ]
          : type === "image-grid"
          ? [
              "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop",
              "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop",
              "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
            ]
          : undefined,
      alt: type === "image" || type === "image-grid" ? "Blog image" : undefined,
      // CTA Button defaults
      ctaText: type === "cta-button" ? "Get Started" : undefined,
      ctaUrl: type === "cta-button" ? "https://" : undefined,
      ctaStyle: type === "cta-button" ? "primary" : undefined,
      ctaSize: type === "cta-button" ? "medium" : undefined,
      // Video defaults
      videoUrl: type === "video" ? "" : undefined,
      videoType: type === "video" ? "youtube" : undefined,
      // Video Grid defaults
      videoUrls: type === "video-grid" ? ["", ""] : undefined,
      videoGridType: type === "video-grid" ? "youtube" : undefined,
      videoGridCols: type === "video-grid" ? 2 : undefined,
    };

    onChange({
      ...blog,
      blocks: [...blog.blocks, newBlock],
    });
  };

  const updateBlock = (blockId: string, updates: Partial<BlogBlock>) => {
    onChange({
      ...blog,
      blocks: blog.blocks.map((block) =>
        block.id === blockId ? { ...block, ...updates } : block
      ),
    });
  };

  const deleteBlock = (blockId: string) => {
    onChange({
      ...blog,
      blocks: blog.blocks.filter((block) => block.id !== blockId),
    });
  };

  const moveBlock = (blockId: string, direction: "up" | "down") => {
    const index = blog.blocks.findIndex((b) => b.id === blockId);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === blog.blocks.length - 1)
    )
      return;

    const newBlocks = [...blog.blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [
      newBlocks[targetIndex],
      newBlocks[index],
    ];

    onChange({ ...blog, blocks: newBlocks });
  };

  const addImageToGrid = (blockId: string) => {
    const block = blog.blocks.find((b) => b.id === blockId);
    if (!block || !block.images) return;

    updateBlock(blockId, {
      images: [
        ...block.images,
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop",
      ],
    });
  };

  const removeImageFromGrid = (blockId: string, imageIndex: number) => {
    const block = blog.blocks.find((b) => b.id === blockId);
    if (!block || !block.images) return;

    updateBlock(blockId, {
      images: block.images.filter((_, idx) => idx !== imageIndex),
    });
  };

  const updateGridImage = (
    blockId: string,
    imageIndex: number,
    newUrl: string
  ) => {
    const block = blog.blocks.find((b) => b.id === blockId);
    if (!block || !block.images) return;

    const newImages = [...block.images];
    newImages[imageIndex] = newUrl;
    updateBlock(blockId, { images: newImages });
  };

  // Parse markdown-style links [text](url), highlights ==#color|text== or ==text==, and colored text {#color|text}
  const parseFormattedText = (text: string): (string | JSX.Element)[] => {
    if (!text) return [];

    // Combined regex for links, highlights (with optional color), and colored text
    // [link](url) | ==#color|text== | ==text== | {#hexcolor|text}
    const formatRegex =
      /\[([^\]]+)\]\(([^)]+)\)|==(#[0-9a-fA-F]{3,6})\|([^=]+)==|==([^=]+)==|\{(#[0-9a-fA-F]{3,6})\|([^}]+)\}/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;
    let keyIndex = 0;

    while ((match = formatRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      if (match[1] && match[2]) {
        // Link: [text](url)
        parts.push(
          <a
            key={keyIndex++}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline font-medium"
            style={{ color: blog.styles.accentColor }}
          >
            {match[1]}
          </a>
        );
      } else if (match[3] && match[4]) {
        // Highlight with color: ==#color|text==
        parts.push(
          <mark
            key={keyIndex++}
            className="px-1 rounded"
            style={{ backgroundColor: match[3], color: "#000" }}
          >
            {match[4]}
          </mark>
        );
      } else if (match[5]) {
        // Highlight without color (default yellow): ==text==
        parts.push(
          <mark
            key={keyIndex++}
            className="px-1 rounded"
            style={{ backgroundColor: "#fef08a", color: "#000" }}
          >
            {match[5]}
          </mark>
        );
      } else if (match[6] && match[7]) {
        // Colored text: {#color|text}
        parts.push(
          <span key={keyIndex++} style={{ color: match[6], fontWeight: 500 }}>
            {match[7]}
          </span>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  // Wrapper for backward compatibility
  const parseLinksInText = (text: string) => {
    const result = parseFormattedText(text);
    return result.length > 0 ? result : text;
  };

  // Insert link syntax at cursor position in textarea
  const insertLinkSyntax = (blockId: string, textareaId: string) => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const linkSyntax = selectedText
      ? `[${selectedText}](https://example.com)`
      : `[link text](https://example.com)`;

    const newText = text.substring(0, start) + linkSyntax + text.substring(end);

    const block = blog.blocks.find((b) => b.id === blockId);
    if (block) {
      updateBlock(blockId, { content: newText });
    }

    // Focus and set cursor position after the URL placeholder
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + linkSyntax.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Insert highlight syntax at cursor position
  const insertHighlightSyntax = (
    blockId: string,
    textareaId: string,
    color: string
  ) => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    // Only insert if text is selected
    if (!selectedText) {
      alert("Please select some text first to highlight");
      return;
    }

    const highlightSyntax = `==${color}|${selectedText}==`;

    const newText =
      text.substring(0, start) + highlightSyntax + text.substring(end);

    const block = blog.blocks.find((b) => b.id === blockId);
    if (block) {
      updateBlock(blockId, { content: newText });
    }

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + highlightSyntax.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Insert colored text syntax at cursor position
  const insertColorSyntax = (
    blockId: string,
    textareaId: string,
    color: string
  ) => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    // Only insert if text is selected
    if (!selectedText) {
      alert("Please select some text first to apply color");
      return;
    }

    const colorSyntax = `{${color}|${selectedText}}`;

    const newText =
      text.substring(0, start) + colorSyntax + text.substring(end);

    const block = blog.blocks.find((b) => b.id === blockId);
    if (block) {
      updateBlock(blockId, { content: newText });
    }

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + colorSyntax.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Insert list syntax at cursor position in textarea
  const insertListSyntax = (
    blockId: string,
    textareaId: string,
    listType: "bullet" | "number" | "alpha"
  ) => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    // Create list template based on type
    let listSyntax = "";
    if (listType === "bullet") {
      listSyntax = "\n• First item\n• Second item\n• Third item\n";
    } else if (listType === "number") {
      listSyntax = "\n1. First item\n2. Second item\n3. Third item\n";
    } else if (listType === "alpha") {
      listSyntax = "\na. First item\nb. Second item\nc. Third item\n";
    }

    // Insert at cursor position
    const newText = text.substring(0, start) + listSyntax + text.substring(end);

    const block = blog.blocks.find((b) => b.id === blockId);
    if (block) {
      updateBlock(blockId, { content: newText });
    }

    // Focus textarea and place cursor after the inserted list
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + listSyntax.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Parse content that may contain lists (•, 1., a.) and links
  const parseContentWithLists = (text: string) => {
    if (!text) return null;

    const lines = text.split("\n");
    const result: JSX.Element[] = [];
    let currentList: {
      type: "bullet" | "number" | "alpha";
      items: string[];
    } | null = null;
    let keyIndex = 0;

    const flushList = () => {
      if (currentList && currentList.items.length > 0) {
        const ListTag = currentList.type === "bullet" ? "ul" : "ol";
        const listStyle =
          currentList.type === "number"
            ? "decimal"
            : currentList.type === "alpha"
            ? "lower-alpha"
            : "disc";
        result.push(
          <ListTag
            key={keyIndex++}
            className="my-3 pl-6 space-y-1"
            style={{ listStyleType: listStyle, color: blog.styles.textColor }}
          >
            {currentList.items.map((item, idx) => (
              <li key={idx} className="text-lg leading-relaxed">
                {parseLinksInText(item)}
              </li>
            ))}
          </ListTag>
        );
        currentList = null;
      }
    };

    lines.forEach((line, idx) => {
      const trimmedLine = line.trim();

      // Check for bullet points (•)
      if (trimmedLine.startsWith("• ") || trimmedLine.startsWith("- ")) {
        if (currentList?.type !== "bullet") {
          flushList();
          currentList = { type: "bullet", items: [] };
        }
        currentList.items.push(trimmedLine.substring(2));
      }
      // Check for numbered list (1. 2. 3. etc)
      else if (/^\d+\.\s/.test(trimmedLine)) {
        if (currentList?.type !== "number") {
          flushList();
          currentList = { type: "number", items: [] };
        }
        currentList.items.push(trimmedLine.replace(/^\d+\.\s/, ""));
      }
      // Check for alphabetical list (a. b. c. etc)
      else if (/^[a-z]\.\s/i.test(trimmedLine)) {
        if (currentList?.type !== "alpha") {
          flushList();
          currentList = { type: "alpha", items: [] };
        }
        currentList.items.push(trimmedLine.replace(/^[a-z]\.\s/i, ""));
      }
      // Regular text
      else {
        flushList();
        if (trimmedLine) {
          result.push(
            <span key={keyIndex++} className="block mb-2">
              {parseLinksInText(trimmedLine)}
            </span>
          );
        } else if (idx > 0 && idx < lines.length - 1) {
          // Empty line between content
          result.push(<br key={keyIndex++} />);
        }
      }
    });

    flushList();
    return result.length > 0 ? result : parseLinksInText(text);
  };

  const renderBlockPreview = (block: BlogBlock) => {
    switch (block.type) {
      case "heading":
        return (
          <h2
            className="text-3xl font-bold mb-4"
            style={{ color: blog.styles.titleColor }}
          >
            {block.content}
          </h2>
        );
      case "subheading":
        return (
          <h3
            className="text-2xl font-semibold mb-3"
            style={{ color: blog.styles.titleColor }}
          >
            {block.content}
          </h3>
        );
      case "paragraph":
        return (
          <div
            className="text-lg leading-relaxed mb-4"
            style={{ color: blog.styles.textColor }}
          >
            {parseContentWithLists(block.content || "")}
          </div>
        );
      case "image":
        return (
          <div className="my-6">
            <img
              src={block.images?.[0]}
              alt={block.alt}
              className="w-full h-auto rounded-lg shadow-md"
              style={{ maxHeight: "500px", objectFit: "cover" }}
            />
          </div>
        );
      case "image-grid": {
        const gridCols =
          block.images?.length === 1
            ? "grid-cols-1"
            : block.images?.length === 2
            ? "grid-cols-2"
            : "grid-cols-3";
        return (
          <div className={`grid ${gridCols} gap-4 my-6`}>
            {block.images?.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${block.alt} ${idx + 1}`}
                className="w-full h-64 object-cover rounded-lg shadow-md"
              />
            ))}
          </div>
        );
      }
      case "quote":
        return (
          <blockquote
            className="border-l-4 pl-6 py-4 my-6 italic text-xl"
            style={{
              borderColor: blog.styles.accentColor,
              color: blog.styles.textColor,
            }}
          >
            "{block.content}"
          </blockquote>
        );
      case "divider":
        return (
          <hr
            className="my-8 border-t-2"
            style={{ borderColor: blog.styles.accentColor }}
          />
        );
      case "link":
        return (
          <p className="text-lg mb-4">
            <a
              href={block.linkUrl}
              target={block.openInNewTab ? "_blank" : "_self"}
              rel={block.openInNewTab ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-1 font-medium underline hover:no-underline transition-all"
              style={{ color: blog.styles.accentColor }}
            >
              {block.linkText || "Link"}
              {block.openInNewTab && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              )}
            </a>
          </p>
        );
      case "list": {
        const ListTag =
          block.listStyle === "number" || block.listStyle === "alpha"
            ? "ol"
            : "ul";
        const listStyleType =
          block.listStyle === "number"
            ? "decimal"
            : block.listStyle === "alpha"
            ? "lower-alpha"
            : "disc";
        return (
          <ListTag
            className="my-4 pl-6 space-y-2"
            style={{
              color: blog.styles.textColor,
              listStyleType: listStyleType,
            }}
          >
            {(block.listItems || []).map((item, idx) => (
              <li key={idx} className="text-lg leading-relaxed">
                {parseLinksInText(item)}
              </li>
            ))}
          </ListTag>
        );
      }
      case "cta-button": {
        const sizeClasses = {
          small: "px-4 py-2 text-sm",
          medium: "px-6 py-3 text-base",
          large: "px-8 py-4 text-lg",
        };
        const styleClasses = {
          primary: `text-white`,
          secondary: `text-white opacity-90`,
          outline: `bg-transparent border-2`,
        };
        const bgStyle =
          block.ctaStyle === "primary"
            ? { backgroundColor: blog.styles.accentColor }
            : block.ctaStyle === "secondary"
            ? { backgroundColor: blog.styles.textColor }
            : {
                borderColor: blog.styles.accentColor,
                color: blog.styles.accentColor,
              };
        return (
          <div className="my-6 text-center">
            <a
              href={block.ctaUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-block rounded-lg font-semibold transition-all hover:opacity-90 hover:scale-105 ${
                sizeClasses[block.ctaSize || "medium"]
              } ${styleClasses[block.ctaStyle || "primary"]}`}
              style={bgStyle}
            >
              {block.ctaText || "Get Started"}
            </a>
          </div>
        );
      }
      case "video": {
        const getEmbedUrl = (url: string, type: string) => {
          if (type === "youtube") {
            const match = url.match(
              /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
            );
            return match ? `https://www.youtube.com/embed/${match[1]}` : url;
          } else if (type === "vimeo") {
            const match = url.match(/vimeo\.com\/(\d+)/);
            return match ? `https://player.vimeo.com/video/${match[1]}` : url;
          }
          return url;
        };
        const embedUrl = getEmbedUrl(
          block.videoUrl || "",
          block.videoType || "youtube"
        );
        const isUploaded = block.videoType === "uploaded";
        return (
          <div className="my-6">
            <div
              className="relative w-full rounded-lg overflow-hidden shadow-lg"
              style={{ paddingBottom: "56.25%" }}
            >
              {block.videoUrl ? (
                isUploaded ? (
                  <video
                    src={block.videoUrl}
                    className="absolute top-0 left-0 w-full h-full object-contain bg-black"
                    controls
                  />
                ) : (
                  <iframe
                    src={embedUrl}
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Video"
                  />
                )
              ) : (
                <div className="absolute top-0 left-0 w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Add a video URL</span>
                </div>
              )}
            </div>
          </div>
        );
      }
      case "video-grid": {
        const getEmbedUrl = (url: string, type: string) => {
          if (type === "youtube") {
            const match = url.match(
              /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
            );
            return match ? `https://www.youtube.com/embed/${match[1]}` : "";
          } else if (type === "vimeo") {
            const match = url.match(/vimeo\.com\/(\d+)/);
            return match ? `https://player.vimeo.com/video/${match[1]}` : "";
          }
          return "";
        };
        const gridCols =
          block.videoGridCols === 4
            ? "grid-cols-4"
            : block.videoGridCols === 3
            ? "grid-cols-3"
            : "grid-cols-2";
        return (
          <div className="my-6">
            <div className={`grid ${gridCols} gap-4`}>
              {(block.videoUrls || []).map((url, idx) => {
                const isUploaded = block.videoGridType === "uploaded";
                const embedUrl = isUploaded
                  ? url
                  : getEmbedUrl(url, block.videoGridType || "youtube");
                return (
                  <div
                    key={idx}
                    className="relative rounded-lg overflow-hidden shadow-md"
                    style={{ paddingBottom: "56.25%" }}
                  >
                    {embedUrl ? (
                      isUploaded ? (
                        <video
                          src={embedUrl}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                          controls
                          title={`Video ${idx + 1}`}
                        />
                      ) : (
                        <iframe
                          src={embedUrl}
                          className="absolute top-0 left-0 w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={`Video ${idx + 1}`}
                        />
                      )
                    ) : (
                      <div className="absolute top-0 left-0 w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">
                          Video {idx + 1}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 bg-linear-to-r from-purple-600 to-blue-600 text-white font-bold flex items-center justify-between hover:from-purple-700 hover:to-blue-700 rounded-t-lg"
      >
        <span className="flex items-center gap-3">
          📝 Blog Post - {blog.title || "Untitled"}
        </span>
        <span className="text-2xl">{isExpanded ? "▼" : "▶"}</span>
      </button>

      {/* Preview */}
      <div
        className="p-8"
        style={{
          backgroundColor: blog.styles.headerBackground,
        }}
      >
        <div className="max-w-4xl mx-auto">
          {blog.featuredImage && (
            <img
              src={blog.featuredImage}
              alt="Featured"
              className="w-full h-96 object-cover rounded-lg shadow-lg mb-8"
            />
          )}
          <h1
            className="text-5xl font-bold mb-4"
            style={{ color: blog.styles.titleColor }}
          >
            {blog.title || "Blog Title"}
          </h1>
          <p className="text-xl mb-6" style={{ color: blog.styles.textColor }}>
            {blog.subtitle || "Blog subtitle"}
          </p>
          <div
            className="flex items-center gap-4 text-sm mb-8"
            style={{ color: blog.styles.textColor }}
          >
            <span className="font-semibold">{blog.author || "Author"}</span>
            <span>•</span>
            <span>{blog.date || "Date"}</span>
          </div>

          {/* Blog Content Blocks */}
          <div className="space-y-2">
            {blog.blocks.map((block) => (
              <div key={block.id}>{renderBlockPreview(block)}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Editor */}
      {isExpanded && (
        <div className="p-6 border-t border-gray-200 space-y-6 bg-gray-50">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Blog Information
            </h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Blog Title
              </label>
              <input
                type="text"
                value={blog.title}
                onChange={(e) => updateBlogField("title", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black text-lg font-semibold"
                placeholder="Enter your blog title..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={blog.subtitle}
                onChange={(e) => updateBlogField("subtitle", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black"
                placeholder="A brief description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={blog.author}
                  onChange={(e) => updateBlogField("author", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black"
                  placeholder="Author name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="text"
                  value={blog.date}
                  onChange={(e) => updateBlogField("date", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black"
                  placeholder="Dec 4, 2025"
                />
              </div>
            </div>

            <div>
              <ImagePicker
                label="Featured Image URL"
                value={blog.featuredImage}
                onChange={(url) => updateBlogField("featuredImage", url)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Styling */}
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Styling</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Header Background
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={blog.styles.headerBackground}
                    onChange={(e) =>
                      updateStyle("headerBackground", e.target.value)
                    }
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={blog.styles.headerBackground}
                    onChange={(e) =>
                      updateStyle("headerBackground", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={blog.styles.titleColor}
                    onChange={(e) => updateStyle("titleColor", e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={blog.styles.titleColor}
                    onChange={(e) => updateStyle("titleColor", e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={blog.styles.textColor}
                    onChange={(e) => updateStyle("textColor", e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={blog.styles.textColor}
                    onChange={(e) => updateStyle("textColor", e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Accent Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={blog.styles.accentColor}
                    onChange={(e) => updateStyle("accentColor", e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={blog.styles.accentColor}
                    onChange={(e) => updateStyle("accentColor", e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Add Content Blocks */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Add Content Block
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => addBlock("heading")}
                className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
              >
                📰 Heading
              </button>
              <button
                type="button"
                onClick={() => addBlock("subheading")}
                className="px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition"
              >
                📑 Subheading
              </button>
              <button
                type="button"
                onClick={() => addBlock("paragraph")}
                className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition"
              >
                📝 Paragraph
              </button>
              <button
                type="button"
                onClick={() => addBlock("image")}
                className="px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition"
              >
                🖼️ Image
              </button>
              <button
                type="button"
                onClick={() => addBlock("image-grid")}
                className="px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition"
              >
                🎨 Image Grid
              </button>
              <button
                type="button"
                onClick={() => addBlock("quote")}
                className="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition"
              >
                💬 Quote
              </button>
              <button
                type="button"
                onClick={() => addBlock("list")}
                className="px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition"
              >
                📝 List
              </button>
              <button
                type="button"
                onClick={() => addBlock("link")}
                className="px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition"
              >
                🔗 Link
              </button>
              <button
                type="button"
                onClick={() => addBlock("divider")}
                className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition"
              >
                ➖ Divider
              </button>
              <button
                type="button"
                onClick={() => addBlock("cta-button")}
                className="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition"
              >
                🚀 CTA Button
              </button>
              <button
                type="button"
                onClick={() => addBlock("video")}
                className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition"
              >
                🎬 Video
              </button>
              <button
                type="button"
                onClick={() => addBlock("video-grid")}
                className="px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition"
              >
                📺 Video Grid
              </button>
            </div>
          </div>

          {/* Content Blocks List */}
          <div className="space-y-4">
            {blog.blocks.map((block, index) => (
              <div
                key={block.id}
                className="bg-white border-2 border-blue-200 rounded-lg p-4 shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="bg-blue-100 px-3 py-1 rounded text-sm">
                      {block.type.toUpperCase()}
                    </span>
                    Block #{index + 1}
                  </h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => moveBlock(block.id, "up")}
                      disabled={index === 0}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded text-sm font-medium"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(block.id, "down")}
                      disabled={index === blog.blocks.length - 1}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded text-sm font-medium"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBlock(block.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Block Content Editor */}
                {(block.type === "heading" ||
                  block.type === "subheading" ||
                  block.type === "paragraph" ||
                  block.type === "quote") && (
                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      {block.type === "quote" ? "Quote Text" : "Content"}
                    </label>
                    {block.type === "paragraph" ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() =>
                              insertLinkSyntax(block.id, `textarea-${block.id}`)
                            }
                            className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white rounded text-sm font-medium flex items-center gap-1"
                            title="Insert link - Select text first or click to insert template"
                          >
                            🔗 Link
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              insertListSyntax(
                                block.id,
                                `textarea-${block.id}`,
                                "bullet"
                              )
                            }
                            className="px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded text-sm font-medium"
                            title="Insert bullet list"
                          >
                            • Bullet
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              insertListSyntax(
                                block.id,
                                `textarea-${block.id}`,
                                "number"
                              )
                            }
                            className="px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded text-sm font-medium"
                            title="Insert numbered list"
                          >
                            1. Number
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              insertListSyntax(
                                block.id,
                                `textarea-${block.id}`,
                                "alpha"
                              )
                            }
                            className="px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded text-sm font-medium"
                            title="Insert alphabetical list"
                          >
                            a. Alpha
                          </button>
                          <span className="border-l border-gray-300 mx-1"></span>
                          <div className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                            <span className="text-xs text-gray-600">✨</span>
                            <input
                              type="color"
                              defaultValue="#fef08a"
                              className="w-6 h-6 rounded cursor-pointer border-0"
                              title="Pick highlight color"
                              id={`highlight-picker-${block.id}`}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const colorInput = document.getElementById(
                                  `highlight-picker-${block.id}`
                                ) as HTMLInputElement;
                                const color = colorInput?.value || "#fef08a";
                                insertHighlightSyntax(
                                  block.id,
                                  `textarea-${block.id}`,
                                  color
                                );
                              }}
                              className="px-2 py-0.5 bg-yellow-400 hover:bg-yellow-500 text-black rounded text-xs font-medium"
                              title="Apply highlight to selected text"
                            >
                              Highlight
                            </button>
                          </div>
                          <div className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                            <span className="text-xs text-gray-600">🎨</span>
                            <input
                              type="color"
                              defaultValue="#3b82f6"
                              className="w-6 h-6 rounded cursor-pointer border-0"
                              title="Pick a color"
                              onChange={(e) => {
                                const colorInput = e.target;
                                // Store the selected color for use when Apply is clicked
                                colorInput.dataset.selectedColor =
                                  e.target.value;
                              }}
                              id={`color-picker-${block.id}`}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const colorInput = document.getElementById(
                                  `color-picker-${block.id}`
                                ) as HTMLInputElement;
                                const color = colorInput?.value || "#3b82f6";
                                insertColorSyntax(
                                  block.id,
                                  `textarea-${block.id}`,
                                  color
                                );
                              }}
                              className="px-2 py-0.5 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs font-medium"
                              title="Apply selected color to text"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                        <textarea
                          id={`textarea-${block.id}`}
                          value={block.content || ""}
                          onChange={(e) =>
                            updateBlock(block.id, { content: e.target.value })
                          }
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black font-mono text-sm"
                          placeholder="Write your content...&#10;&#10;Use [link text](url) for links&#10;Use • or 1. or a. at start of line for lists&#10;Use ==text== for highlight&#10;Use {#color|text} for colored text"
                        />
                        <p className="text-xs text-gray-500">
                          Tip: [text](url) for links | • 1. a. for lists |
                          ==text== for highlight | {"{#color|text}"} for colors
                        </p>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={block.content || ""}
                        onChange={(e) =>
                          updateBlock(block.id, { content: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                        placeholder={`Enter ${block.type}...`}
                      />
                    )}
                  </div>
                )}

                {block.type === "image" && (
                  <div className="space-y-3">
                    <ImagePicker
                      label="Image URL"
                      value={block.images?.[0] || ""}
                      onChange={(url) =>
                        updateBlock(block.id, { images: [url] })
                      }
                      placeholder="https://example.com/image.jpg"
                    />
                    <div>
                      <label className="block text-sm text-gray-700 mb-2 font-medium">
                        Alt Text
                      </label>
                      <input
                        type="text"
                        value={block.alt || ""}
                        onChange={(e) =>
                          updateBlock(block.id, { alt: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                        placeholder="Image description"
                      />
                    </div>
                  </div>
                )}

                {block.type === "image-grid" && (
                  <div className="space-y-3">
                    <label className="block text-sm text-gray-700 font-medium">
                      Images ({block.images?.length || 0})
                    </label>
                    {block.images?.map((img, idx) => (
                      <div key={idx} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <ImagePicker
                            label={`Image ${idx + 1}`}
                            value={img}
                            onChange={(url) =>
                              updateGridImage(block.id, idx, url)
                            }
                            placeholder={`Image ${idx + 1} URL`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImageFromGrid(block.id, idx)}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addImageToGrid(block.id)}
                      className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
                    >
                      + Add Image
                    </button>
                  </div>
                )}

                {block.type === "link" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2 font-medium">
                        Link Text (what users will see)
                      </label>
                      <input
                        type="text"
                        value={block.linkText || ""}
                        onChange={(e) =>
                          updateBlock(block.id, { linkText: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                        placeholder="e.g., Visit GeeksforGeeks"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2 font-medium">
                        Link URL
                      </label>
                      <input
                        type="url"
                        value={block.linkUrl || ""}
                        onChange={(e) =>
                          updateBlock(block.id, { linkUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                        placeholder="https://www.geeksforgeeks.org"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`newtab-${block.id}`}
                        checked={block.openInNewTab ?? true}
                        onChange={(e) =>
                          updateBlock(block.id, {
                            openInNewTab: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-cyan-500 rounded"
                      />
                      <label
                        htmlFor={`newtab-${block.id}`}
                        className="text-sm text-gray-700"
                      >
                        Open in new tab
                      </label>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <a
                        href={block.linkUrl}
                        target={block.openInNewTab ? "_blank" : "_self"}
                        rel={
                          block.openInNewTab ? "noopener noreferrer" : undefined
                        }
                        className="text-cyan-600 underline hover:text-cyan-800 font-medium"
                      >
                        {block.linkText || "Link"}
                      </a>
                    </div>
                  </div>
                )}

                {block.type === "list" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2 font-medium">
                        List Style
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateBlock(block.id, { listStyle: "bullet" })
                          }
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            block.listStyle === "bullet"
                              ? "bg-teal-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          • Bullet
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateBlock(block.id, { listStyle: "number" })
                          }
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            block.listStyle === "number"
                              ? "bg-teal-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          1. Number
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateBlock(block.id, { listStyle: "alpha" })
                          }
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            block.listStyle === "alpha"
                              ? "bg-teal-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          a. Alphabet
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2 font-medium">
                        List Items
                      </label>
                      {(block.listItems || []).map((item, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <span className="px-2 py-2 bg-gray-100 rounded text-gray-600 text-sm font-mono">
                            {block.listStyle === "number"
                              ? `${idx + 1}.`
                              : block.listStyle === "alpha"
                              ? `${String.fromCharCode(97 + idx)}.`
                              : "•"}
                          </span>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const newItems = [...(block.listItems || [])];
                              newItems[idx] = e.target.value;
                              updateBlock(block.id, { listItems: newItems });
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-black"
                            placeholder={`Item ${idx + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newItems = (block.listItems || []).filter(
                                (_, i) => i !== idx
                              );
                              updateBlock(block.id, { listItems: newItems });
                            }}
                            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = [
                            ...(block.listItems || []),
                            "New item",
                          ];
                          updateBlock(block.id, { listItems: newItems });
                        }}
                        className="w-full px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium"
                      >
                        + Add Item
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Tip: You can use [link text](url) format inside list items
                      for links
                    </p>
                  </div>
                )}

                {block.type === "cta-button" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2 font-medium">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={block.ctaText || ""}
                        onChange={(e) =>
                          updateBlock(block.id, { ctaText: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                        placeholder="e.g., Get Started, Contact Us, Learn More"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2 font-medium">
                        Button URL
                      </label>
                      <input
                        type="url"
                        value={block.ctaUrl || ""}
                        onChange={(e) =>
                          updateBlock(block.id, { ctaUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                        placeholder="https://example.com/contact"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2 font-medium">
                        Button Style
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateBlock(block.id, { ctaStyle: "primary" })
                          }
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            block.ctaStyle === "primary"
                              ? "bg-orange-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          Primary
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateBlock(block.id, { ctaStyle: "secondary" })
                          }
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            block.ctaStyle === "secondary"
                              ? "bg-orange-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          Secondary
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateBlock(block.id, { ctaStyle: "outline" })
                          }
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            block.ctaStyle === "outline"
                              ? "bg-orange-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          Outline
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2 font-medium">
                        Button Size
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateBlock(block.id, { ctaSize: "small" })
                          }
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            block.ctaSize === "small"
                              ? "bg-orange-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          Small
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateBlock(block.id, { ctaSize: "medium" })
                          }
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            block.ctaSize === "medium"
                              ? "bg-orange-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          Medium
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateBlock(block.id, { ctaSize: "large" })
                          }
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            block.ctaSize === "large"
                              ? "bg-orange-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          Large
                        </button>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-100 rounded-lg">
                      <p className="text-sm text-gray-600 mb-3">Preview:</p>
                      <div className="text-center">
                        <span
                          className={`inline-block rounded-lg font-semibold ${
                            block.ctaSize === "small"
                              ? "px-4 py-2 text-sm"
                              : block.ctaSize === "large"
                              ? "px-8 py-4 text-lg"
                              : "px-6 py-3 text-base"
                          } ${
                            block.ctaStyle === "outline"
                              ? "bg-transparent border-2"
                              : "text-white"
                          }`}
                          style={
                            block.ctaStyle === "primary"
                              ? { backgroundColor: blog.styles.accentColor }
                              : block.ctaStyle === "secondary"
                              ? { backgroundColor: blog.styles.textColor }
                              : {
                                  borderColor: blog.styles.accentColor,
                                  color: blog.styles.accentColor,
                                }
                          }
                        >
                          {block.ctaText || "Get Started"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {block.type === "video" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2 font-medium">
                        Video Source
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() =>
                            updateBlock(block.id, { videoType: "youtube" })
                          }
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            block.videoType === "youtube"
                              ? "bg-red-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          ▶️ YouTube
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateBlock(block.id, { videoType: "vimeo" })
                          }
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            block.videoType === "vimeo"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          🎬 Vimeo
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateBlock(block.id, { videoType: "uploaded" })
                          }
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            block.videoType === "uploaded"
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          📁 Uploaded
                        </button>
                      </div>
                    </div>

                    {block.videoType === "uploaded" ? (
                      <VideoPicker
                        label="Video File"
                        value={block.videoUrl || ""}
                        onChange={(url) =>
                          updateBlock(block.id, { videoUrl: url })
                        }
                        placeholder="Select or paste video URL"
                      />
                    ) : (
                      <div>
                        <label className="block text-sm text-gray-700 mb-2 font-medium">
                          Video URL
                        </label>
                        <input
                          type="url"
                          value={block.videoUrl || ""}
                          onChange={(e) =>
                            updateBlock(block.id, { videoUrl: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                          placeholder={
                            block.videoType === "vimeo"
                              ? "https://vimeo.com/123456789"
                              : "https://www.youtube.com/watch?v=VIDEO_ID"
                          }
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {block.videoType === "vimeo"
                            ? "Paste any Vimeo video URL"
                            : "Paste any YouTube video URL (watch, share, or embed)"}
                        </p>
                      </div>
                    )}

                    {block.videoUrl && (
                      <div className="p-4 bg-gray-100 rounded-lg">
                        <p className="text-sm text-gray-600 mb-3">Preview:</p>
                        <div
                          className="relative w-full rounded-lg overflow-hidden"
                          style={{ paddingBottom: "56.25%" }}
                        >
                          {block.videoType === "uploaded" ? (
                            <video
                              src={block.videoUrl}
                              className="absolute top-0 left-0 w-full h-full object-contain bg-black"
                              controls
                            />
                          ) : (
                            <iframe
                              src={
                                block.videoType === "youtube"
                                  ? `https://www.youtube.com/embed/${
                                      block.videoUrl.match(
                                        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
                                      )?.[1] || ""
                                    }`
                                  : `https://player.vimeo.com/video/${
                                      block.videoUrl.match(
                                        /vimeo\.com\/(\d+)/
                                      )?.[1] || ""
                                    }`
                              }
                              className="absolute top-0 left-0 w-full h-full"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title="Video Preview"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {block.type === "video-grid" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2 font-medium">
                        Video Source
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() =>
                            updateBlock(block.id, { videoGridType: "youtube" })
                          }
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            block.videoGridType === "youtube"
                              ? "bg-red-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          ▶️ YouTube
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateBlock(block.id, { videoGridType: "vimeo" })
                          }
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            block.videoGridType === "vimeo"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          🎬 Vimeo
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateBlock(block.id, { videoGridType: "uploaded" })
                          }
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            block.videoGridType === "uploaded"
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          📁 Uploaded
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2 font-medium">
                        Grid Columns
                      </label>
                      <div className="flex gap-2">
                        {[2, 3, 4].map((cols) => (
                          <button
                            key={cols}
                            type="button"
                            onClick={() =>
                              updateBlock(block.id, {
                                videoGridCols: cols as 2 | 3 | 4,
                              })
                            }
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                              block.videoGridCols === cols
                                ? "bg-rose-500 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {cols} in Row
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2 font-medium">
                        Videos ({block.videoUrls?.length || 0})
                      </label>
                      {(block.videoUrls || []).map((url, idx) => (
                        <div
                          key={idx}
                          className="mb-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex gap-2 items-center mb-2">
                            <span className="px-2 py-1 bg-gray-200 rounded text-gray-600 text-sm font-mono">
                              {idx + 1}
                            </span>
                            <span className="text-sm text-gray-500 flex-1 truncate">
                              {url || "No video selected"}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const newUrls = (block.videoUrls || []).filter(
                                  (_, i) => i !== idx
                                );
                                updateBlock(block.id, { videoUrls: newUrls });
                              }}
                              className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                            >
                              ✕
                            </button>
                          </div>
                          {block.videoGridType === "uploaded" ? (
                            <VideoPicker
                              label=""
                              value={url}
                              onChange={(newUrl) => {
                                const newUrls = [...(block.videoUrls || [])];
                                newUrls[idx] = newUrl;
                                updateBlock(block.id, { videoUrls: newUrls });
                              }}
                              placeholder="Select or paste video URL"
                            />
                          ) : (
                            <input
                              type="url"
                              value={url}
                              onChange={(e) => {
                                const newUrls = [...(block.videoUrls || [])];
                                newUrls[idx] = e.target.value;
                                updateBlock(block.id, { videoUrls: newUrls });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                              placeholder={
                                block.videoGridType === "vimeo"
                                  ? "https://vimeo.com/123456789"
                                  : "https://www.youtube.com/watch?v=VIDEO_ID"
                              }
                            />
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newUrls = [...(block.videoUrls || []), ""];
                          updateBlock(block.id, { videoUrls: newUrls });
                        }}
                        className="w-full px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium"
                      >
                        + Add Video
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        {block.videoGridType === "uploaded"
                          ? "Browse and select videos from your media library"
                          : block.videoGridType === "vimeo"
                          ? "Paste Vimeo video URLs"
                          : "Paste YouTube video URLs (watch, share, or embed)"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Delete Blog Button */}
          {onDelete && (
            <div className="flex justify-end border-t pt-6">
              <button
                type="button"
                onClick={onDelete}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
              >
                🗑️ Delete Blog Post
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
