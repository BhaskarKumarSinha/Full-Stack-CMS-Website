# Text & Image Block System - Integration Guide

## Component Overview

### 1. **TextImageBlockEditor.tsx**

Editable block with:

- Live preview
- 5 layout options (Text Left, Text Right, Text Top, Text Bottom, Text Full)
- Text content editor (heading, subheading, description, button)
- Image manager (URL, alt text)
- Styling controls (colors, fonts, spacing, borders)
- Delete functionality

### 2. **SectionBlockManager.tsx**

Manager component that:

- Wraps each section
- Allows adding multiple text-image blocks
- Manages block lifecycle
- Displays all blocks for a section
- Updates main page state

---

## How to Integrate into Classic Page Builder

### Step 1: Import the Components

```tsx
import SectionBlockManager, {
  type SectionWithBlocks,
} from "./page-builder/SectionBlockManager";
import { type TextImageBlock } from "./page-builder/TextImageBlockEditor";
```

### Step 2: Update State Management

```tsx
// Add to PageBuilder component state
const [sectionBlocks, setSectionBlocks] = useState<
  Record<string, SectionWithBlocks>
>({
  hero: { sectionId: "hero", sectionName: "Hero", textImageBlocks: [] },
  features: {
    sectionId: "features",
    sectionName: "Features",
    textImageBlocks: [],
  },
  // ... for each section
});
```

### Step 3: Wrap Each Section with SectionBlockManager

```tsx
// Example: Hero Section
{
  sections.find((s) => s.id === "hero")?.enabled && (
    <SectionBlockManager
      section={sectionBlocks.hero}
      onUpdate={(updated) =>
        setSectionBlocks({ ...sectionBlocks, hero: updated })
      }
      sectionContent={
        <div>
          {/* Your hero section JSX */}
          <h1>{heroContent.headline}</h1>
          {/* ... */}
        </div>
      }
    />
  );
}
```

### Step 4: Include Blocks in HTML Generation

When saving the page, include the text-image blocks:

```tsx
const generatePageHTML = () => {
  let html = "";

  // Hero section
  html += generateHeroHTML(heroContent);

  // Hero blocks
  sectionBlocks.hero.textImageBlocks.forEach((block) => {
    html += generateTextImageBlockHTML(block);
  });

  // Features section
  html += generateFeaturesHTML(featuresContent);

  // Features blocks
  sectionBlocks.features.textImageBlocks.forEach((block) => {
    html += generateTextImageBlockHTML(block);
  });

  // ... repeat for each section

  return html;
};
```

---

## How Blocks Work in Professional Editor

The Professional Editor already has the necessary blocks built-in:

### Available Block Types:

- **Heading** - For titles
- **Paragraph** - For descriptions
- **Image** - For images
- **Button** - For CTAs
- **Grid** - For complex layouts

### Creating Text & Image Layouts:

**Example 1: Text Left, Image Right**

```
1. Add Grid Block (2 columns)
2. Add Heading Block in Column 1
3. Add Paragraph Block in Column 1
4. Add Button Block in Column 1
5. Add Image Block in Column 2
6. Style each block
```

**Example 2: Text Full, Image Below**

```
1. Add Heading Block
2. Add Paragraph Block
3. Add Image Block
4. Set image width to 100%
```

---

## HTML Generation Example

### Text-Image Block HTML Output

```html
<section
  style="background-color: #ffffff; padding: 60px 40px; border-radius: 8px;"
>
  <div style="display: flex; gap: 32px; align-items: center;">
    <div style="flex: 1;">
      <h3 style="font-size: 32px; color: #1f2937; margin-bottom: 16px;">
        Your Heading
      </h3>
      <h4 style="font-weight: 600; color: #1f2937; margin-bottom: 16px;">
        Your Subheading
      </h4>
      <p style="color: #1f2937; margin-bottom: 20px;">
        Your description text...
      </p>
      <a
        href="/learn-more"
        style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;"
      >
        Learn More
      </a>
    </div>
    <div style="flex: 1;">
      <img
        src="image.jpg"
        alt="Section image"
        style="width: 100%; border-radius: 8px;"
      />
    </div>
  </div>
</section>
```

---

## Layout Algorithms

### Text Left Layout

```
[Text Content]  [   Image   ]
```

- Flex with 2 equal columns
- Gap between them: 32px
- Align items: center (vertically)

### Text Right Layout

```
[   Image   ]  [Text Content]
```

- Same as text-left but image comes first

### Text Top Layout

```
[Text Content]
[   Image   ]
```

- Display: block
- Image width: 100%
- Gap: 24px
- Margin top on image

### Text Bottom Layout

```
[   Image   ]
[Text Content]
```

- Same as text-top but image comes first

### Text Full Layout

```
[Text Content]
[   Image   ]
```

- Similar to text-top
- Image width: 100% of container
- More spacing

---

## Styling Properties

Each block can be customized with:

```typescript
styles: {
  backgroundColor: string; // Hex color or rgba
  textColor: string; // Text color
  headingFontSize: string; // e.g., "32px", "2rem"
  padding: string; // e.g., "60px 40px", "3rem 2rem"
  borderRadius: string; // e.g., "8px", "12px"
}
```

### Default Values

```javascript
{
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
  headingFontSize: "32px",
  padding: "60px 40px",
  borderRadius: "8px"
}
```

---

## Data Structure

### TextImageBlock Interface

```typescript
interface TextImageBlock {
  id: string;
  type: "text-image";
  layout: "text-left" | "text-right" | "text-top" | "text-bottom" | "text-full";
  text: {
    heading: string;
    subheading: string;
    description: string;
    buttonText?: string;
    buttonUrl?: string;
  };
  image: {
    url: string;
    alt: string;
  };
  styles: {
    backgroundColor: string;
    textColor: string;
    headingFontSize: string;
    padding: string;
    borderRadius: string;
  };
}
```

### SectionWithBlocks Interface

```typescript
interface SectionWithBlocks {
  sectionId: string;
  sectionName: string;
  textImageBlocks: TextImageBlock[];
}
```

---

## Features Summary

✅ **5 Layout Options** - Text Left, Right, Top, Bottom, Full
✅ **Flexible Content** - Heading, subheading, description, button
✅ **Image Management** - URL and alt text
✅ **Live Preview** - See changes in real-time
✅ **Styling Controls** - Colors, fonts, spacing, borders
✅ **Add/Edit/Delete** - Full lifecycle management
✅ **Multiple Blocks** - Add as many as you need per section
✅ **Professional Look** - Modern, responsive design

---

## Performance Considerations

- Lazy load images when possible
- Optimize image sizes
- Limit blocks per page (10-15 recommended)
- Cache rendered blocks
- Use CSS transitions instead of animations

---

## Accessibility Features

✅ Alt text for images (required)
✅ Semantic HTML structure
✅ Color contrast compliance
✅ Keyboard navigation support
✅ ARIA labels on interactive elements
✅ Descriptive button text

---

## Future Enhancements

- [ ] Video blocks
- [ ] Icon blocks
- [ ] Gallery/carousel blocks
- [ ] Testimonial blocks
- [ ] Pricing blocks
- [ ] Team member blocks
- [ ] Timeline blocks
- [ ] Custom CSS support
- [ ] Animation/transition support
- [ ] Block templates library
