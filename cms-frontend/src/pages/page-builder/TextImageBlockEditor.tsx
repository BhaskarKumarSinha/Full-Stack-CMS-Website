import { useState } from "react";
import ImagePicker from "../../components/ImagePicker";

export type ButtonStyle = {
  bgColor?: string;
  textColor?: string;
  hoverBgColor?: string;
  hoverTextColor?: string;
  borderColor?: string;
  borderRadius?: string;
  variant?: "solid" | "outline" | "ghost" | "text" | "gradient";
  shadow?: string;
  enableAnimation?: boolean;
  transformAmount?: number; // pixels to move up on hover (0 = no transform)
  transitionDuration?: number; // seconds
};

// Helper function to get button preview styles (similar to HeroEditor pattern)
const getButtonStylePreview = (
  buttonStyle?: ButtonStyle
): React.CSSProperties => {
  const bs = buttonStyle || {};
  const bgColor = bs.bgColor || "#2563eb";
  const textColor = bs.textColor || "#ffffff";
  const hoverBgColor = bs.hoverBgColor || "#1d4ed8";
  const borderRadius = bs.borderRadius || "0.375rem";
  const variant = bs.variant || "solid";
  const shadow = bs.shadow || "md";
  const enableAnimation = bs.enableAnimation !== false;
  const transitionDuration = bs.transitionDuration ?? 0.3;

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  };

  const shadowColor = hexToRgb(bgColor);

  const getShadowValue = (s: string) => {
    switch (s) {
      case "none":
        return "none";
      case "sm":
        return `0 2px 8px rgba(${shadowColor},0.2)`;
      case "md":
        return `0 4px 15px rgba(${shadowColor},0.3)`;
      case "lg":
        return `0 8px 25px rgba(${shadowColor},0.35)`;
      case "xl":
        return `0 12px 35px rgba(${shadowColor},0.4)`;
      default:
        return `0 4px 15px rgba(${shadowColor},0.3)`;
    }
  };

  const baseStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    borderRadius,
    display: "inline-block",
    textDecoration: "none",
    fontWeight: 600,
    cursor: "pointer",
    ...(enableAnimation && { transition: `all ${transitionDuration}s ease` }),
  };

  switch (variant) {
    case "outline":
      return {
        ...baseStyle,
        background: "transparent",
        color: bgColor,
        border: `2px solid ${bgColor}`,
      };
    case "ghost":
      return {
        ...baseStyle,
        background: `${bgColor}15`,
        color: bgColor,
        border: "none",
      };
    case "gradient":
      return {
        ...baseStyle,
        background: `linear-gradient(135deg, ${bgColor} 0%, ${hoverBgColor} 100%)`,
        color: textColor,
        border: "none",
        boxShadow: getShadowValue(shadow),
      };
    default: // solid
      return {
        ...baseStyle,
        background: bgColor,
        color: textColor,
        border: "none",
        boxShadow: getShadowValue(shadow),
      };
  }
};

export interface TextImageBlock {
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
  buttonStyle?: ButtonStyle;
}

interface TextImageBlockEditorProps {
  block: TextImageBlock;
  onChange: (block: TextImageBlock) => void;
  onDelete?: () => void;
  initialExpanded?: boolean;
}

export default function TextImageBlockEditor({
  block,
  onChange,
  onDelete,
  initialExpanded = false,
}: TextImageBlockEditorProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const handleLayoutChange = (newLayout: TextImageBlock["layout"]) => {
    onChange({ ...block, layout: newLayout });
  };

  const handleTextChange = (field: keyof typeof block.text, value: string) => {
    onChange({
      ...block,
      text: { ...block.text, [field]: value },
    });
  };

  const handleImageChange = (field: "url" | "alt", value: string) => {
    onChange({
      ...block,
      image: { ...block.image, [field]: value },
    });
  };

  const handleStyleChange = (
    field: keyof typeof block.styles,
    value: string
  ) => {
    onChange({
      ...block,
      styles: { ...block.styles, [field]: value },
    });
  };

  // Preview rendering
  const renderPreview = () => {
    // Get hover effect handlers
    const getHoverHandlers = () => {
      const bs = block.buttonStyle || {};
      const bgColor = bs.bgColor || "#2563eb";
      const textColor = bs.textColor || "#ffffff";
      const hoverBgColor = bs.hoverBgColor || "#1d4ed8";
      const variant = bs.variant || "solid";
      const shadow = bs.shadow || "md";
      const enableAnimation = bs.enableAnimation !== false;
      const transformAmount = bs.transformAmount ?? 2;

      const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r},${g},${b}`;
      };

      const shadowColor = hexToRgb(bgColor);

      const getShadowValue = (s: string) => {
        switch (s) {
          case "none":
            return "none";
          case "sm":
            return `0 2px 8px rgba(${shadowColor},0.2)`;
          case "md":
            return `0 4px 15px rgba(${shadowColor},0.3)`;
          case "lg":
            return `0 8px 25px rgba(${shadowColor},0.35)`;
          case "xl":
            return `0 12px 35px rgba(${shadowColor},0.4)`;
          default:
            return `0 4px 15px rgba(${shadowColor},0.3)`;
        }
      };

      const shadowValue = getShadowValue(shadow);
      const shadowHover = getShadowValue(
        shadow === "none"
          ? "none"
          : shadow === "sm"
          ? "md"
          : shadow === "md"
          ? "lg"
          : "xl"
      );

      const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!enableAnimation) return;
        const btn = e.currentTarget;
        if (transformAmount > 0) {
          btn.style.transform = `translateY(-${transformAmount}px)`;
        }
        switch (variant) {
          case "outline":
            btn.style.background = bgColor;
            btn.style.color = textColor;
            break;
          case "ghost":
            btn.style.background = `${bgColor}25`;
            break;
          case "gradient":
            btn.style.boxShadow = shadowHover;
            break;
          default:
            btn.style.background = hoverBgColor;
            btn.style.boxShadow = shadowHover;
        }
      };

      const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!enableAnimation) return;
        const btn = e.currentTarget;
        if (transformAmount > 0) {
          btn.style.transform = "translateY(0)";
        }
        switch (variant) {
          case "outline":
            btn.style.background = "transparent";
            btn.style.color = bgColor;
            break;
          case "ghost":
            btn.style.background = `${bgColor}15`;
            break;
          case "gradient":
            btn.style.boxShadow = shadowValue;
            break;
          default:
            btn.style.background = bgColor;
            btn.style.boxShadow = shadowValue;
        }
      };

      return { handleMouseEnter, handleMouseLeave };
    };

    const { handleMouseEnter, handleMouseLeave } = getHoverHandlers();

    // Text content for left/right layouts (not centered)
    const textContent = (
      <div className="flex-1">
        <h3
          className="font-bold mb-2"
          style={{
            fontSize: block.styles.headingFontSize,
            color: block.styles.textColor,
          }}
        >
          {block.text.heading}
        </h3>
        {block.text.subheading && (
          <h4
            className="font-semibold mb-2"
            style={{ color: block.styles.textColor }}
          >
            {block.text.subheading}
          </h4>
        )}
        <p style={{ color: block.styles.textColor }} className="mb-3">
          {block.text.description}
        </p>
        {block.text.buttonText && (
          <a
            href={block.text.buttonUrl || "#"}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={getButtonStylePreview(block.buttonStyle)}
          >
            {block.text.buttonText}
          </a>
        )}
      </div>
    );

    // Text content for top/bottom layouts (centered)
    const textContentCentered = (
      <div className="w-full text-center">
        <h3
          className="font-bold mb-2"
          style={{
            fontSize: block.styles.headingFontSize,
            color: block.styles.textColor,
          }}
        >
          {block.text.heading}
        </h3>
        {block.text.subheading && (
          <h4
            className="font-semibold mb-2"
            style={{ color: block.styles.textColor }}
          >
            {block.text.subheading}
          </h4>
        )}
        <p style={{ color: block.styles.textColor }} className="mb-3">
          {block.text.description}
        </p>
        {block.text.buttonText && (
          <a
            href={block.text.buttonUrl || "#"}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={getButtonStylePreview(block.buttonStyle)}
          >
            {block.text.buttonText}
          </a>
        )}
      </div>
    );

    const imageContent = (
      <div className="flex-1 min-w-0">
        <img
          src={block.image.url}
          alt={block.image.alt}
          className="w-full h-auto rounded-lg object-cover"
          style={{ maxHeight: "400px" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/400x300?text=Image+Not+Found";
          }}
        />
      </div>
    );

    // Centered image for top/bottom/full layouts
    const imageContentCentered = (
      <div className="w-full flex justify-center">
        <img
          src={block.image.url}
          alt={block.image.alt}
          className="w-full h-auto rounded-lg object-cover"
          style={{ maxHeight: "400px" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/400x300?text=Image+Not+Found";
          }}
        />
      </div>
    );

    switch (block.layout) {
      case "text-left":
        return (
          <div className="flex flex-wrap lg:flex-nowrap gap-8 items-center">
            {textContent}
            {imageContent}
          </div>
        );
      case "text-right":
        return (
          <div className="flex flex-wrap-reverse lg:flex-nowrap gap-8 items-center">
            {imageContent}
            {textContent}
          </div>
        );
      case "text-top":
        return (
          <div className="max-w-6xl mx-auto">
            <div className="w-full text-center mb-6">{textContentCentered}</div>
            <div className="w-full flex justify-center">
              {imageContentCentered}
            </div>
          </div>
        );
      case "text-bottom":
        return (
          <div className="max-w-6xl mx-auto">
            <div className="w-full flex justify-center mb-6">
              {imageContentCentered}
            </div>
            <div className="w-full text-center">{textContentCentered}</div>
          </div>
        );
      case "text-full":
        return (
          <div className="max-w-6xl mx-auto">
            <div className="w-full mb-6">{textContent}</div>
            <div className="w-full flex justify-center">
              {imageContentCentered}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-blue-500 text-white font-semibold flex items-center justify-between hover:bg-blue-600"
      >
        <span className="flex items-center gap-2">
          📝 Text & Image Block - {block.layout.replace("-", " ").toUpperCase()}
        </span>
        <span>{isExpanded ? "▼" : "▶"}</span>
      </button>

      {/* Preview */}
      <div
        className="p-6"
        style={{
          backgroundColor: block.styles.backgroundColor,
          borderRadius: block.styles.borderRadius,
          padding: block.styles.padding,
        }}
      >
        {renderPreview()}
      </div>

      {/* Editor */}
      {isExpanded && (
        <div className="p-6 border-t border-gray-200 space-y-6">
          {/* Layout Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Layout
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: "text-left", label: "Text Left", icon: "⬅️" },
                { id: "text-right", label: "Text Right", icon: "➡️" },
                { id: "text-top", label: "Text Top", icon: "⬆️" },
                { id: "text-bottom", label: "Text Bottom", icon: "⬇️" },
                { id: "text-full", label: "Text Full", icon: "📄" },
              ].map((layout) => (
                <button
                  type="button"
                  key={layout.id}
                  onClick={() =>
                    handleLayoutChange(layout.id as TextImageBlock["layout"])
                  }
                  className={`p-3 rounded-lg font-medium text-center text-xs transition-all ${
                    block.layout === layout.id
                      ? "bg-blue-600 text-white ring-2 ring-blue-400"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <div className="text-xl mb-1">{layout.icon}</div>
                  <div>{layout.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Text Content</h3>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Heading
              </label>
              <input
                type="text"
                value={block.text.heading}
                onChange={(e) => handleTextChange("heading", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Subheading
              </label>
              <input
                type="text"
                value={block.text.subheading}
                onChange={(e) => handleTextChange("subheading", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={block.text.description}
                onChange={(e) =>
                  handleTextChange("description", e.target.value)
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Button Text
                </label>
                <input
                  type="text"
                  value={block.text.buttonText || ""}
                  onChange={(e) =>
                    handleTextChange("buttonText", e.target.value)
                  }
                  placeholder="e.g., Learn More"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Button URL
                </label>
                <input
                  type="text"
                  value={block.text.buttonUrl || ""}
                  onChange={(e) =>
                    handleTextChange("buttonUrl", e.target.value)
                  }
                  placeholder="e.g., /learn-more"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                />
              </div>
            </div>

            {/* Button Customization */}
            {block.text.buttonText && (
              <div className="p-3 border rounded bg-gray-50 mt-2">
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  🎨 Button Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Variant
                    </label>
                    <select
                      value={block.buttonStyle?.variant || "solid"}
                      onChange={(e) =>
                        onChange({
                          ...block,
                          buttonStyle: {
                            ...block.buttonStyle,
                            variant: e.target.value as ButtonStyle["variant"],
                          },
                        })
                      }
                      className="w-full px-2 py-1 border rounded text-black text-sm"
                    >
                      <option value="solid">Solid</option>
                      <option value="outline">Outline</option>
                      <option value="ghost">Ghost</option>
                      <option value="gradient">Gradient</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Border Radius
                    </label>
                    <select
                      value={block.buttonStyle?.borderRadius || "0.375rem"}
                      onChange={(e) =>
                        onChange({
                          ...block,
                          buttonStyle: {
                            ...block.buttonStyle,
                            borderRadius: e.target.value,
                          },
                        })
                      }
                      className="w-full px-2 py-1 border rounded text-black text-sm"
                    >
                      <option value="0">Square</option>
                      <option value="0.25rem">Slightly Rounded</option>
                      <option value="0.375rem">Rounded</option>
                      <option value="0.5rem">More Rounded</option>
                      <option value="1rem">Pill</option>
                      <option value="9999px">Full Pill</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Background
                    </label>
                    <input
                      type="color"
                      value={block.buttonStyle?.bgColor || "#2563eb"}
                      onChange={(e) =>
                        onChange({
                          ...block,
                          buttonStyle: {
                            ...block.buttonStyle,
                            bgColor: e.target.value,
                          },
                        })
                      }
                      className="w-full h-8 border rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={block.buttonStyle?.textColor || "#ffffff"}
                      onChange={(e) =>
                        onChange({
                          ...block,
                          buttonStyle: {
                            ...block.buttonStyle,
                            textColor: e.target.value,
                          },
                        })
                      }
                      className="w-full h-8 border rounded cursor-pointer"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Hover BG
                    </label>
                    <input
                      type="color"
                      value={block.buttonStyle?.hoverBgColor || "#1d4ed8"}
                      onChange={(e) =>
                        onChange({
                          ...block,
                          buttonStyle: {
                            ...block.buttonStyle,
                            hoverBgColor: e.target.value,
                          },
                        })
                      }
                      className="w-full h-8 border rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Shadow
                    </label>
                    <select
                      value={block.buttonStyle?.shadow || "md"}
                      onChange={(e) =>
                        onChange({
                          ...block,
                          buttonStyle: {
                            ...block.buttonStyle,
                            shadow: e.target.value,
                          },
                        })
                      }
                      className="w-full px-2 py-1 border rounded text-black text-sm"
                    >
                      <option value="none">None</option>
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                      <option value="xl">X-Large</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="checkbox"
                    id={`animation-${block.id}`}
                    checked={block.buttonStyle?.enableAnimation !== false}
                    onChange={(e) =>
                      onChange({
                        ...block,
                        buttonStyle: {
                          ...block.buttonStyle,
                          enableAnimation: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label
                    htmlFor={`animation-${block.id}`}
                    className="text-xs text-gray-600"
                  >
                    Enable Hover Animation
                  </label>
                </div>

                {/* Animation Settings - Transform Amount and Duration */}
                {block.buttonStyle?.enableAnimation !== false && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Transform (px)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="1"
                        value={block.buttonStyle?.transformAmount ?? 2}
                        onChange={(e) =>
                          onChange({
                            ...block,
                            buttonStyle: {
                              ...block.buttonStyle,
                              transformAmount: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full px-2 py-1 border rounded text-black text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Duration (s)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={block.buttonStyle?.transitionDuration ?? 0.3}
                        onChange={(e) =>
                          onChange({
                            ...block,
                            buttonStyle: {
                              ...block.buttonStyle,
                              transitionDuration: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full px-2 py-1 border rounded text-black text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Button Preview */}
                <div className="mt-3 p-3 bg-gray-100 rounded">
                  <label className="block text-xs text-gray-600 mb-2">
                    Preview (hover to test animation)
                  </label>
                  {(() => {
                    const bs = block.buttonStyle || {};
                    const bgColor = bs.bgColor || "#2563eb";
                    const textColor = bs.textColor || "#ffffff";
                    const hoverBgColor = bs.hoverBgColor || "#1d4ed8";
                    const variant = bs.variant || "solid";
                    const shadow = bs.shadow || "md";
                    const enableAnimation = bs.enableAnimation !== false;
                    const transformAmount = bs.transformAmount ?? 2;

                    const hexToRgb = (hex: string) => {
                      const r = parseInt(hex.slice(1, 3), 16);
                      const g = parseInt(hex.slice(3, 5), 16);
                      const b = parseInt(hex.slice(5, 7), 16);
                      return `${r},${g},${b}`;
                    };

                    const shadowColor = hexToRgb(bgColor);

                    const getShadowValue = (s: string) => {
                      switch (s) {
                        case "none":
                          return "none";
                        case "sm":
                          return `0 2px 8px rgba(${shadowColor},0.2)`;
                        case "md":
                          return `0 4px 15px rgba(${shadowColor},0.3)`;
                        case "lg":
                          return `0 8px 25px rgba(${shadowColor},0.35)`;
                        case "xl":
                          return `0 12px 35px rgba(${shadowColor},0.4)`;
                        default:
                          return `0 4px 15px rgba(${shadowColor},0.3)`;
                      }
                    };

                    const shadowValue = getShadowValue(shadow);
                    const shadowHover = getShadowValue(
                      shadow === "none"
                        ? "none"
                        : shadow === "sm"
                        ? "md"
                        : shadow === "md"
                        ? "lg"
                        : "xl"
                    );

                    const handleMouseEnter = (
                      e: React.MouseEvent<HTMLAnchorElement>
                    ) => {
                      if (!enableAnimation) return;
                      const btn = e.currentTarget;
                      if (transformAmount > 0) {
                        btn.style.transform = `translateY(-${transformAmount}px)`;
                      }
                      switch (variant) {
                        case "outline":
                          btn.style.background = bgColor;
                          btn.style.color = textColor;
                          break;
                        case "ghost":
                          btn.style.background = `${bgColor}25`;
                          break;
                        case "gradient":
                          btn.style.boxShadow = shadowHover;
                          break;
                        default:
                          btn.style.background = hoverBgColor;
                          btn.style.boxShadow = shadowHover;
                      }
                    };

                    const handleMouseLeave = (
                      e: React.MouseEvent<HTMLAnchorElement>
                    ) => {
                      if (!enableAnimation) return;
                      const btn = e.currentTarget;
                      if (transformAmount > 0) {
                        btn.style.transform = "translateY(0)";
                      }
                      switch (variant) {
                        case "outline":
                          btn.style.background = "transparent";
                          btn.style.color = bgColor;
                          break;
                        case "ghost":
                          btn.style.background = `${bgColor}15`;
                          break;
                        case "gradient":
                          btn.style.boxShadow = shadowValue;
                          break;
                        default:
                          btn.style.background = bgColor;
                          btn.style.boxShadow = shadowValue;
                      }
                    };

                    return (
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        style={getButtonStylePreview(block.buttonStyle)}
                      >
                        {block.text.buttonText || "Button Text"}
                      </a>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Image Content */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-gray-900">Image</h3>

            <div>
              <ImagePicker
                label="Image URL"
                value={block.image.url}
                onChange={(url: string) => handleImageChange("url", url)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                value={block.image.alt}
                onChange={(e) => handleImageChange("alt", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
              />
            </div>
          </div>

          {/* Styling */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-gray-900">Styling</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={block.styles.backgroundColor}
                    onChange={(e) =>
                      handleStyleChange("backgroundColor", e.target.value)
                    }
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={block.styles.backgroundColor}
                    onChange={(e) =>
                      handleStyleChange("backgroundColor", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={block.styles.textColor}
                    onChange={(e) =>
                      handleStyleChange("textColor", e.target.value)
                    }
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={block.styles.textColor}
                    onChange={(e) =>
                      handleStyleChange("textColor", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Heading Font Size
                </label>
                <input
                  type="text"
                  value={block.styles.headingFontSize}
                  onChange={(e) =>
                    handleStyleChange("headingFontSize", e.target.value)
                  }
                  placeholder="e.g., 36px"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Padding
                </label>
                <input
                  type="text"
                  value={block.styles.padding}
                  onChange={(e) => handleStyleChange("padding", e.target.value)}
                  placeholder="e.g., 40px 20px"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Border Radius
                </label>
                <input
                  type="text"
                  value={block.styles.borderRadius}
                  onChange={(e) =>
                    handleStyleChange("borderRadius", e.target.value)
                  }
                  placeholder="e.g., 8px"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                />
              </div>
            </div>
          </div>

          {/* Delete Button */}
          {onDelete && (
            <div className="flex justify-end border-t pt-4">
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              >
                Delete Block
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
