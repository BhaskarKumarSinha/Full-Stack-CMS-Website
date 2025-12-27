# Professional Page Editor - Complete Guide

## Overview

The Professional Page Editor is an industry-level, drag-and-drop page builder component that allows users to create beautiful, responsive websites without coding. It features a modern UI, comprehensive styling controls, and intuitive block management.

## Features

### 1. **Block System**

The editor uses a block-based architecture where each block represents a content element:

- **Hero** - Large featured sections with background images
- **Heading** - H1-H6 level headings
- **Paragraph** - Text content blocks
- **Image** - Image upload and display with captions
- **Button** - Clickable buttons with custom links
- **Divider** - Visual separators
- **Card** - Content cards with styling
- **Grid** - Multi-column layouts (1-6 columns)
- **CTA** - Call-to-action sections
- **Video** - Video embedding and upload

### 2. **Core Capabilities**

#### Block Management

- **Add Blocks**: Click any block type button in the sidebar to add a new block
- **Reorder Blocks**: Drag and drop blocks to reorder, or use up/down arrows
- **Duplicate Blocks**: Clone any block with all its styling
- **Delete Blocks**: Remove unwanted blocks
- **Select & Edit**: Click any block in the canvas to edit it

#### Content Editing

- **Text Content**: Edit block text directly
- **Image Upload**: Upload images directly from your computer
- **Links**: Add URLs to buttons and CTAs
- **Alt Text**: Automatically set for accessibility

#### Visual Styling

All blocks support comprehensive CSS-like styling:

**Colors**

- Background color with color picker
- Text color with color picker
- Border color customization

**Typography**

- Font size (any CSS value: px, em, rem, %)
- Font weight (light to extra bold)
- Text alignment (left, center, right, justify)

**Spacing**

- Padding (all sides with shorthand support)
- Margin (all sides with shorthand support)

**Borders & Shadows**

- Border width, style, color, radius
- Box shadow (drop shadow effects)

**Layout**

- Minimum height
- Maximum width
- Display type
- Grid columns (for grid blocks)

#### Live Preview

- Real-time preview of selected block
- See all styling changes instantly
- Responsive preview area

### 3. **User Interface**

The editor uses a three-panel layout:

```
┌─────────────────────────────────────────────────┐
│                                                   │
│  Sidebar      │      Preview      │  Properties  │
│  (Blocks)     │      (Live)       │   (Styles)   │
│               │                   │              │
│               │                   │              │
│               │                   │              │
│               │                   │              │
└─────────────────────────────────────────────────┘
│           Action Bar (Preview / Save)            │
└─────────────────────────────────────────────────┘
```

**Left Sidebar (Blocks Panel)**

- Block type buttons organized in a grid
- Canvas area showing all added blocks
- Quick actions for each block (reorder, duplicate, delete)

**Main Area (Preview)**

- Live preview of the selected block
- Shows exactly how the block will look
- Updates in real-time as you edit

**Right Panel (Properties)**

- Content editing section
- Comprehensive styling controls
- Organized into expandable sections

**Bottom Action Bar**

- Preview full page button
- Clear selection button
- Save button

## Usage Examples

### Creating a Hero Section

1. Click the **Hero** button in the sidebar
2. A new hero block is added
3. Click on it to select it
4. Edit the text in the "Text Content" field
5. In the styling panel:
   - Set background color to blue
   - Set text color to white
   - Adjust font size to 48px
   - Set minimum height to 400px
6. Watch changes in the live preview
7. Use the preview button to see full page

### Creating a Multi-Column Grid

1. Click the **Grid** button
2. Select the grid block
3. In styling panel, set "Grid Columns" to 3
4. Edit the content text
5. Customize colors and spacing
6. The preview shows a 3-column layout

### Adding Images

1. Click the **Image** button
2. Select the image block
3. In the content section, click "Upload image"
4. Choose an image from your computer
5. The image preview appears instantly
6. Adjust sizing and spacing as needed

## API Reference

### ProfessionalPageEditor Component

```typescript
interface ProfessionalPageEditorProps {
  blocks: PageBlock[];
  onBlocksChange: (blocks: PageBlock[]) => void;
  onPreview: (blocks: PageBlock[]) => void;
}
```

**Props:**

- `blocks` - Array of page blocks
- `onBlocksChange` - Callback when blocks are modified
- `onPreview` - Callback when preview is clicked

### PageBlock Structure

```typescript
interface PageBlock {
  id: string;
  type: BlockType;
  content: string;
  styles: {
    padding: string;
    margin: string;
    backgroundColor: string;
    textColor: string;
    fontSize: string;
    fontWeight: string;
    textAlign: "left" | "center" | "right" | "justify";
    borderRadius: string;
    borderWidth: string;
    borderColor: string;
    borderStyle: string;
    boxShadow: string;
    minHeight: string;
    maxWidth: string;
    display: string;
  };
  attributes?: {
    href?: string;
    target?: string;
    src?: string;
    alt?: string;
  };
}
```

### PageEditorWrapper Component

```typescript
interface PageEditorWrapperProps {
  onSavePage: (htmlContent: string) => void;
}
```

**Features:**

- Converts page blocks to clean, semantic HTML
- Includes responsive styling
- Generates complete, deployable HTML documents
- Includes CSS with media queries

## HTML Generation

The PageEditorWrapper automatically converts blocks to HTML. Example output:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Professional Page</title>
    <style>
      /* Comprehensive styling included */
    </style>
  </head>
  <body>
    <div class="page-container">
      <!-- Generated blocks -->
    </div>
  </body>
</html>
```

## Styling Tips & Best Practices

### Color Combinations

- Use contrasting colors for text and backgrounds
- Follow WCAG accessibility guidelines
- Test on different screens

### Typography

- Use 16px as base font size
- Headings: 24px-48px depending on importance
- Body text: 14px-16px for readability

### Spacing

- Use consistent padding/margin values (8px increments)
- Common values: 8px, 16px, 24px, 32px, 40px
- Padding shorthand: "20px" (all sides), "20px 40px" (vertical horizontal)

### Borders & Shadows

- Subtle shadows: "0 2px 8px rgba(0,0,0,0.1)"
- Prominent shadows: "0 4px 12px rgba(0,0,0,0.15)"
- Border radius: 4px (small), 6px (medium), 8px (large)

## Advanced Features

### Responsive Grid

Grid blocks automatically adjust columns on mobile:

```css
@media (max-width: 768px) {
  grid-template-columns: 1fr !important;
}
```

### Block Reordering

Drag and drop blocks to reorder instantly. Dragging visual indicator shows where block will be placed.

### Block Duplication

Clone a fully styled block by clicking the duplicate button. Useful for creating consistent layouts.

### Image Upload

Supports:

- PNG, JPG, GIF, WebP
- Automatic base64 encoding for preview
- Alt text for accessibility

## Keyboard Shortcuts (Planned)

- `Delete` - Delete selected block
- `Ctrl+D` - Duplicate selected block
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo

## Troubleshooting

### Styles not applying?

- Ensure the input value is properly formatted (e.g., "20px" not "20")
- Check CSS property names (use kebab-case in CSS)

### Image not showing?

- Ensure the file is a valid image format
- Check browser console for errors
- Try a different image file

### Grid not responding?

- Ensure grid columns value is between 1-6
- On mobile, grid automatically becomes single column

## Performance Considerations

- Editor handles up to 100+ blocks efficiently
- Real-time preview updates are debounced
- CSS is pre-compiled for fast rendering
- Images are lazy-loaded in preview

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE11: ❌ Not supported

## Future Enhancements

- [ ] Undo/Redo history
- [ ] Block templates/presets
- [ ] Custom CSS editor
- [ ] Mobile device preview
- [ ] Animations and transitions
- [ ] Form blocks with validation
- [ ] Social media embeds
- [ ] Custom code blocks
- [ ] Page SEO editor
- [ ] Analytics integration

## Integration Example

```typescript
import PageEditorWrapper from "./page-builder/PageEditorWrapper";

export default function MyPageEditor() {
  const handleSavePage = (htmlContent: string) => {
    // Send to backend API
    api.post("/pages", { content: htmlContent });
  };

  return <PageEditorWrapper onSavePage={handleSavePage} />;
}
```

## CSS Classes for Styling

The generated HTML includes semantic class names:

- `.page-container` - Main container
- `.block` - Any block element
- `.block-hero` - Hero sections
- `.block-card` - Card blocks
- `.block-grid` - Grid layouts
- `.block-cta` - Call-to-action sections

Use these classes to add custom styling to generated pages.

---

**Version**: 1.0.0
**Last Updated**: December 2024
**Author**: AI Assistant
