import { useState } from "react";
import ProfessionalPageEditor, {
  type PageBlock,
} from "./ProfessionalPageEditor";

interface PageEditorWrapperProps {
  onSavePage: (htmlContent: string) => void;
  isEmbedded?: boolean;
}

export default function PageEditorWrapper({
  onSavePage,
}: PageEditorWrapperProps) {
  const [blocks, setBlocks] = useState<PageBlock[]>([
    {
      id: "default-hero",
      type: "hero",
      content: "Welcome to Your Website",
      styles: {
        padding: "60px 20px",
        margin: "0",
        backgroundColor: "#2563eb",
        textColor: "#ffffff",
        fontSize: "48px",
        fontWeight: "700",
        textAlign: "center",
        borderRadius: "0",
        borderWidth: "0",
        borderColor: "#cccccc",
        borderStyle: "solid",
        boxShadow: "none",
        minHeight: "400px",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      },
    },
  ]);

  const convertBlocksToHTML = (pageBlocks: PageBlock[]): string => {
    const generateBlockHTML = (block: PageBlock): string => {
      const styleString = Object.entries(block.styles)
        .filter(([, value]) => value && value !== "none")
        .map(([key, value]) => {
          // Convert camelCase to kebab-case
          const cssKey = key.replace(
            /[A-Z]/g,
            (match) => `-${match.toLowerCase()}`
          );
          // Skip grid-specific properties that aren't CSS
          if (
            cssKey === "grid-columns" ||
            cssKey === "flex-direction" ||
            cssKey === "gap"
          ) {
            return null;
          }
          return `${cssKey}: ${value}`;
        })
        .filter(Boolean)
        .join("; ");

      const style = styleString ? `style="${styleString}"` : "";

      switch (block.type) {
        case "hero":
          return `<section class="block block-hero" ${style}>
            <h1>${block.content}</h1>
            <p>Featured Hero Section</p>
            <button style="padding: 12px 24px; background: white; color: #2563eb; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Get Started</button>
          </section>`;

        case "heading":
          return `<h2 ${style}>${block.content}</h2>`;

        case "paragraph":
          return `<p ${style}>${block.content}</p>`;

        case "image":
          if (block.attributes?.src) {
            return `<figure ${style}><img src="${block.attributes.src}" alt="${
              block.attributes.alt || "Image"
            }" style="width: 100%; height: auto; border-radius: 6px;"></figure>`;
          }
          return `<div ${style} style="padding: 40px; text-align: center; background: #f3f4f6; border-radius: 6px;">📷 Image Placeholder</div>`;

        case "button": {
          const href = block.attributes?.href || "#";
          return `<a href="${href}" class="block-button" ${style} style="${styleString}; display: inline-block; padding: 12px 24px; border-radius: 6px; text-decoration: none; text-align: center;">${block.content}</a>`;
        }

        case "divider":
          return `<hr ${style}>`;

        case "card":
          return `<div class="block-card" ${style} style="${styleString}; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
            <h3>${block.content}</h3>
            <p>Card content goes here. You can add more detailed information.</p>
          </div>`;

        case "grid": {
          const columns = block.styles.gridColumns || 3;
          const gridHTML = [1, 2, 3]
            .map(
              (i) =>
                `<div style="padding: 20px; background: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;">
              <h4>Column ${i}</h4>
              <p>Grid content item ${i}</p>
            </div>`
            )
            .join("");
          return `<div class="block-grid" ${style} style="${styleString}; display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 20px;">
            ${gridHTML}
          </div>`;
        }

        case "cta":
          return `<section class="block-cta" ${style} style="${styleString}; text-align: center; padding: 40px 20px;">
            <h2>${block.content}</h2>
            <p>Ready to take action? Click the button below.</p>
            <button style="padding: 14px 32px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 16px;">Take Action Now</button>
          </section>`;

        case "video":
          if (block.attributes?.src) {
            return `<video ${style} controls style="${styleString}; width: 100%; border-radius: 6px;">
              <source src="${block.attributes.src}">
              Your browser does not support the video tag.
            </video>`;
          }
          return `<div ${style} style="padding: 40px; text-align: center; background: #f3f4f6; border-radius: 6px;">🎬 Video Placeholder</div>`;

        default:
          return `<div ${style}>${block.content}</div>`;
      }
    };

    const baseHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Professional Page</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      width: 100%;
      height: 100%;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    
    .page-container {
      width: 100%;
      max-width: 100%;
    }
    
    .block {
      width: 100%;
    }
    
    .block-hero {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    
    .block-card {
      transition: all 0.3s ease;
    }
    
    .block-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
    
    .block-cta {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    
    .block-button, button, a.block-button {
      font-weight: 500;
      transition: all 0.2s ease;
    }
    
    button:hover, a.block-button:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    
    h1, h2, h3, h4, h5, h6 {
      margin-bottom: 0.5rem;
      font-weight: 600;
      line-height: 1.3;
    }
    
    p {
      margin-bottom: 1rem;
    }
    
    img {
      max-width: 100%;
      height: auto;
      display: block;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .block-grid {
        grid-template-columns: 1fr !important;
      }
    }
  </style>
</head>
<body>
  <div class="page-container">
    ${pageBlocks.map(generateBlockHTML).join("\n    ")}
  </div>
</body>
</html>`;

    return baseHTML;
  };

  const handlePreview = (pageBlocks: PageBlock[]) => {
    const htmlContent = convertBlocksToHTML(pageBlocks);
    const previewWindow = window.open("", "preview", "width=1200,height=800");
    if (previewWindow) {
      previewWindow.document.write(htmlContent);
      previewWindow.document.close();
    }
  };

  const handleSave = () => {
    const htmlContent = convertBlocksToHTML(blocks);
    onSavePage(htmlContent);
  };

  return (
    <div>
      <ProfessionalPageEditor
        blocks={blocks}
        onBlocksChange={setBlocks}
        onPreview={handlePreview}
      />
      <div style={{ padding: "16px", background: "white", textAlign: "right" }}>
        <button
          onClick={handleSave}
          style={{
            padding: "10px 24px",
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          💾 Save Page
        </button>
      </div>
    </div>
  );
}
