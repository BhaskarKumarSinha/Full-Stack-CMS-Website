# Professional Page Editor - Integration Guide

## Overview

This document explains how to integrate the new Professional Page Editor into your existing PageBuilder system.

## File Structure

```
src/pages/page-builder/
├── ProfessionalPageEditor.tsx      # Main editor component
├── ProfessionalPageEditor.css      # Styling for editor
├── PageEditorWrapper.tsx           # Wrapper with HTML generation
├── PROFESSIONAL_EDITOR_GUIDE.md    # Full documentation
├── QUICK_START.md                  # Quick reference
└── INTEGRATION_GUIDE.md            # This file
```

## Quick Integration

### Option 1: Replace Existing Page Builder

Replace the entire PageBuilder with the new professional editor:

```typescript
// In your routing or page component
import PageEditorWrapper from "./page-builder/PageEditorWrapper";

export default function PageBuilderPage() {
  const handleSavePage = async (htmlContent: string) => {
    try {
      const response = await api.post("/api/pages", {
        name: "My Page",
        content: htmlContent,
      });
      console.log("Page saved:", response.data);
    } catch (error) {
      console.error("Failed to save page:", error);
    }
  };

  return <PageEditorWrapper onSavePage={handleSavePage} />;
}
```

### Option 2: Add as Alternative Editor

Keep existing editor and offer the new one as an option:

```typescript
import { useState } from "react";
import PageBuilder from "./PageBuilder";
import PageEditorWrapper from "./PageEditorWrapper";

export default function PageEditorSelector() {
  const [editorType, setEditorType] = useState<"classic" | "professional">(
    "classic"
  );

  return (
    <>
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setEditorType("classic")}
          style={{
            background: editorType === "classic" ? "#2563eb" : "#e5e7eb",
            color: editorType === "classic" ? "white" : "#000",
            padding: "10px 20px",
            margin: "0 10px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Classic Editor
        </button>
        <button
          onClick={() => setEditorType("professional")}
          style={{
            background: editorType === "professional" ? "#2563eb" : "#e5e7eb",
            color: editorType === "professional" ? "white" : "#000",
            padding: "10px 20px",
            margin: "0 10px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Professional Editor
        </button>
      </div>

      {editorType === "classic" ? (
        <PageBuilder />
      ) : (
        <PageEditorWrapper onSavePage={(html) => savePageToBackend(html)} />
      )}
    </>
  );
}
```

### Option 3: Use Just the Editor Component

If you want more control over the integration:

```typescript
import { useState } from "react";
import ProfessionalPageEditor, {
  PageBlock,
} from "./page-builder/ProfessionalPageEditor";

export default function CustomPageEditor() {
  const [blocks, setBlocks] = useState<PageBlock[]>([]);

  const handlePreview = (blocks: PageBlock[]) => {
    // Generate HTML from blocks
    const html = generateHTML(blocks);
    // Open in new window
    const previewWindow = window.open("", "preview");
    if (previewWindow) {
      previewWindow.document.write(html);
      previewWindow.document.close();
    }
  };

  return (
    <ProfessionalPageEditor
      blocks={blocks}
      onBlocksChange={setBlocks}
      onPreview={handlePreview}
    />
  );
}
```

## HTML Generation

The PageEditorWrapper automatically converts blocks to HTML:

```typescript
import PageEditorWrapper from "./page-builder/PageEditorWrapper";

const handleSave = (htmlContent: string) => {
  // htmlContent is ready-to-use HTML
  // Can be:
  // 1. Sent to backend for storage
  // 2. Displayed in an iframe
  // 3. Downloaded as .html file
  // 4. Deployed to a server

  console.log(htmlContent); // Full HTML document
};

export default function MyEditor() {
  return <PageEditorWrapper onSavePage={handleSave} />;
}
```

## Customization Options

### Modify Block Types

To add custom block types, edit `ProfessionalPageEditor.tsx`:

```typescript
export type BlockType =
  | "hero"
  | "text"
  | "image"
  | "button"
  | "grid"
  | "card"
  | "section"
  | "heading"
  | "paragraph"
  | "divider"
  | "video"
  | "form"
  | "cta"
  | "testimonials" // <- Add new type
  | "pricing" // <- Add new type
  | "faq"; // <- Add new type
```

Then add to `BLOCK_TYPES` array:

```typescript
const BLOCK_TYPES = [
  // ... existing types
  { type: "testimonials", label: "Testimonials", icon: "⭐" },
  { type: "pricing", label: "Pricing Table", icon: "💰" },
  { type: "faq", label: "FAQ", icon: "❓" },
];
```

And add rendering logic in `BlockPreview`:

```typescript
case "testimonials":
  return (
    <div style={style}>
      <h3>Testimonials Section</h3>
      <p>{block.content}</p>
    </div>
  );
```

### Modify Styling Options

Add new style properties to the `PageBlock.styles` interface:

```typescript
styles: {
  // ... existing styles
  opacity: string;
  filter: string;
  transform: string;
  transition: string;
}
```

Then add UI controls in the properties panel.

### Customize Colors and Themes

Edit `ProfessionalPageEditor.css` to change:

- Color scheme (search for `#2563eb`)
- Font families
- Spacing and sizing
- Component styling

## Backend Integration

### Save Page Endpoint

```typescript
// POST /api/pages
// Body: { name: string, content: string }
// Returns: { id: string, name: string, content: string, createdAt: Date }

const handleSave = async (htmlContent: string) => {
  const response = await api.post("/api/pages", {
    name: prompt("Page name:"),
    content: htmlContent,
  });
  console.log("Saved page ID:", response.data.id);
};
```

### Load Page Endpoint

```typescript
// GET /api/pages/:id
// Returns: { id: string, name: string, content: string }

const loadPage = async (pageId: string) => {
  const response = await api.get(`/api/pages/${pageId}`);
  // Display in iframe or process as needed
  return response.data.content;
};
```

### Publish Page

```typescript
// POST /api/pages/:id/publish
// Generates a public URL for the page

const publishPage = async (pageId: string) => {
  const response = await api.post(`/api/pages/${pageId}/publish`);
  console.log("Public URL:", response.data.publicUrl);
};
```

## Feature Integration

### Adding Image Hosting

Current implementation uses base64 encoding. For production, integrate with:

```typescript
// In PageEditorWrapper.tsx, modify handleImageUpload:

const handleImageUpload = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post("/api/upload", formData);
  return response.data.url; // Use this URL instead of base64
};
```

### Analytics Integration

Track editor usage:

```typescript
const trackEvent = (event: string, data?: any) => {
  // Send to analytics service
  console.log("Event:", event, data);
};

// Usage in editor
const addBlock = (type: BlockType) => {
  trackEvent("block_added", { type });
  // ... rest of addBlock logic
};
```

### SEO Editor

Add metadata editing:

```typescript
interface PageMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
}

// Add to page save
const savePage = (blocks: PageBlock[], metadata: PageMetadata) => {
  const html = generateHTML(blocks);
  // Inject metadata into HTML head
};
```

## Performance Tips

1. **Lazy Load Large Images**: Implement lazy loading in generated HTML

   ```html
   <img src="..." loading="lazy" />
   ```

2. **Cache Generated HTML**: Store generated HTML to avoid regenerating

   ```typescript
   const generateCachedHTML = (blocks: PageBlock[], cacheKey: string) => {
     const cached = localStorage.getItem(cacheKey);
     if (cached) return cached;
     const html = generateHTML(blocks);
     localStorage.setItem(cacheKey, html);
     return html;
   };
   ```

3. **Debounce Preview Updates**: Already implemented, no changes needed

4. **Optimize Block Rendering**: Use React.memo for block components
   ```typescript
   const BlockPreview = React.memo(function BlockPreview({ block }) {
     // ... rendering logic
   });
   ```

## Testing

### Unit Tests Example

```typescript
// ProfessionalPageEditor.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import ProfessionalPageEditor from "./ProfessionalPageEditor";

describe("ProfessionalPageEditor", () => {
  it("should add a block when block button is clicked", () => {
    const handleChange = jest.fn();
    render(
      <ProfessionalPageEditor
        blocks={[]}
        onBlocksChange={handleChange}
        onPreview={() => {}}
      />
    );

    fireEvent.click(screen.getByText("Hero"));
    expect(handleChange).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ type: "hero" })])
    );
  });
});
```

### Integration Tests

```typescript
// Test full save flow
it("should save page with blocks", async () => {
  const handleSave = jest.fn();
  render(<PageEditorWrapper onSavePage={handleSave} />);

  // Add blocks
  fireEvent.click(screen.getByText("Hero"));
  fireEvent.click(screen.getByText("Paragraph"));

  // Save
  fireEvent.click(screen.getByText("Save Page"));

  expect(handleSave).toHaveBeenCalledWith(
    expect.stringContaining("<!DOCTYPE html>")
  );
});
```

## Troubleshooting

### Editor not showing

- Verify CSS file is imported
- Check console for import errors
- Ensure ReactDOM is loaded

### Blocks not rendering

- Check browser console for errors
- Verify block type is defined
- Check style object structure

### HTML not generating

- Verify PageEditorWrapper is being used
- Check HTML generation logic
- Test with simple blocks first

### Performance issues

- Reduce number of blocks in editor
- Clear browser cache
- Check for memory leaks in dev tools

## Deployment

### Before Going Live

1. ✅ Test all block types
2. ✅ Verify HTML generation
3. ✅ Test backend save/load
4. ✅ Check responsive design
5. ✅ Validate generated HTML
6. ✅ Performance test with 50+ blocks
7. ✅ Security audit (XSS prevention)
8. ✅ Browser compatibility test

### Deployment Steps

```bash
# Build project
npm run build

# Deploy to server
# HTML and CSS will be bundled

# Verify deployment
# Test editor in production environment
```

## Support & Resources

- 📖 **Full Guide**: `PROFESSIONAL_EDITOR_GUIDE.md`
- ⚡ **Quick Start**: `QUICK_START.md`
- 💻 **Source Code**: `ProfessionalPageEditor.tsx`, `PageEditorWrapper.tsx`
- 🎨 **Styling**: `ProfessionalPageEditor.css`

## Next Steps

1. Choose integration option (replace, alternative, or embedded)
2. Install and test the editor
3. Customize block types if needed
4. Integrate with your backend
5. Add authentication/authorization
6. Deploy and monitor

---

**Ready to get started?** Begin with Quick Start or use one of the integration examples above!
