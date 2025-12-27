# Professional Page Editor - Quick Start

## What is it?

A modern, drag-and-drop page editor for creating beautiful websites without coding.

## Key Features

✅ 10+ block types (Hero, Text, Image, Button, Grid, etc.)
✅ Live preview with real-time updates
✅ Comprehensive CSS styling (colors, fonts, spacing, shadows)
✅ Drag-and-drop reordering
✅ Image upload support
✅ Responsive design
✅ HTML export
✅ Professional UI

## Getting Started

### 1. Import Component

```typescript
import PageEditorWrapper from "./page-builder/PageEditorWrapper";

<PageEditorWrapper onSavePage={(html) => saveToBackend(html)} />;
```

### 2. Add Your First Block

- Click a block type button on the left (Hero, Text, Image, etc.)
- Block appears in the canvas
- Click to select and edit

### 3. Edit Content

- Edit text in the Content panel
- Upload images if needed
- Set links for buttons

### 4. Style Your Block

- Pick colors with color pickers
- Adjust typography (font size, weight)
- Set spacing (padding, margin)
- Add borders and shadows
- Control layout and alignment

### 5. Preview & Save

- Click "Preview Page" to see full page in new window
- Click "Save Page" to generate HTML
- Export HTML to use on website

## Block Types at a Glance

| Block         | Best For                              |
| ------------- | ------------------------------------- |
| **Hero**      | Large featured sections, page headers |
| **Heading**   | Section titles and subheadings        |
| **Paragraph** | Body text and descriptions            |
| **Image**     | Photos, graphics, diagrams            |
| **Button**    | Links and CTAs                        |
| **Divider**   | Visual separators                     |
| **Card**      | Highlighted content boxes             |
| **Grid**      | Multi-column layouts                  |
| **CTA**       | Call-to-action sections               |
| **Video**     | Embedded videos                       |

## Styling Quick Guide

### Common Values

```
Font Size: 16px, 24px, 32px, 48px
Padding: 20px, 20px 40px
Margin: 10px, 10px 0
Border Radius: 4px, 6px, 8px
Box Shadow: 0 2px 8px rgba(0,0,0,0.1)
```

### Text Alignment

⬅ Left | ⬇ Center | ➡ Right | ⬌ Justify

### Button Actions in Order

1. Click "↑" to move block up
2. Click "↓" to move block down
3. Click "📋" to duplicate block
4. Click "🗑️" to delete block

## Tips & Tricks

💡 **Duplicate First**: Create one styled block, duplicate it, then modify - faster than styling from scratch

💡 **Use Color Picker**: Click the color swatch to get a color picker instead of typing hex codes

💡 **Grid Layouts**: Set grid columns to 2, 3, or 4 for responsive multi-column designs

💡 **Spacing Shorthand**:

- "20px" = 20px all sides
- "20px 40px" = 20px top/bottom, 40px left/right
- "10px 20px 30px 40px" = top, right, bottom, left

💡 **Mobile Responsive**: Generated HTML automatically adjusts on mobile devices

## Keyboard Tips

- Press `Delete` - Delete selected block
- `Ctrl+Z` - Undo (when supported)
- Click outside block - Deselect

## Common Tasks

### Make a Hero Section

1. Add Hero block
2. Edit headline text
3. Set backgroundColor to blue
4. Set textColor to white
5. Set minHeight to 400px
6. Set fontSize to 48px

### Create a 3-Column Grid

1. Add Grid block
2. Set gridColumns to 3
3. Edit content
4. Style colors/spacing
5. Preview to see layout

### Add an Image with Caption

1. Add Image block
2. Click "Upload image"
3. Select image file
4. Add Image block below for caption text
5. Style as needed

### Professional Button

1. Add Button block
2. Edit button text
3. Set backgroundColor to blue
4. Set textColor to white
5. Set padding to "12px 24px"
6. Set borderRadius to "6px"
7. Add link in attributes

## Generated HTML

Your editor creates clean, semantic HTML with:

- Proper structure and tags
- Responsive CSS
- Mobile-friendly media queries
- Accessibility features (alt text, semantic tags)
- Easy to customize and extend

## Troubleshooting

| Issue               | Solution                                   |
| ------------------- | ------------------------------------------ |
| Styles not showing  | Use correct format (e.g., "20px" not "20") |
| Image not uploading | Try a different image or format            |
| Grid looks wrong    | Check columns value is 1-6, refresh        |
| Text too small      | Increase fontSize value (try 24px)         |

## Need Help?

Refer to `PROFESSIONAL_EDITOR_GUIDE.md` for complete documentation and examples.

---

**Pro Tip**: Start with a template by duplicating well-styled blocks rather than styling from scratch!
