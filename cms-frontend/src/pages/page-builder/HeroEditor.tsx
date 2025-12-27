import React from "react";
import ImagePicker from "../../components/ImagePicker";

export type ButtonStyle = {
  bgColor?: string;
  textColor?: string;
  hoverBgColor?: string;
  hoverTextColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  paddingX?: string;
  paddingY?: string;
  fontSize?: string;
  fontWeight?: string;
  shadow?: string;
  variant?: "solid" | "outline" | "ghost" | "text" | "gradient";
  enableAnimation?: boolean;
  transformAmount?: number; // pixels to move up on hover (0 = no transform)
  transitionDuration?: number; // seconds
};

export type HeroContent = {
  headline: string;
  subheading: string;
  primaryCta: string;
  primaryCtaUrl: string;
  secondaryCta: string;
  secondaryCtaUrl: string;
  secondaryCtaVariant: "outlined" | "text" | "ghost";
  backgroundImage: string;
  sideImage: string;
  backgroundColor?: string;
  textColor?: string;
  primaryButtonStyle?: ButtonStyle;
  secondaryButtonStyle?: ButtonStyle;
};

type Props = {
  heroVariant: 1 | 2 | 3 | 4;
  setHeroVariant: (v: 1 | 2 | 3 | 4) => void;
  heroContent: HeroContent;
  setHeroContent: (c: HeroContent) => void;
};

// Helper to generate primary button styles from ButtonStyle config
const getPrimaryButtonStylePreview = (
  buttonStyle?: ButtonStyle
): React.CSSProperties => {
  const bs = buttonStyle || {};
  const bgColor = bs.bgColor || "#2563eb";
  const textColor = bs.textColor || "#ffffff";
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

  const baseStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    borderRadius,
    display: "inline-block",
    textDecoration: "none",
    fontWeight: 600,
    cursor: "pointer",
    ...(enableAnimation && { transition: `all ${transitionDuration}s ease` }),
  };

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
        background: `linear-gradient(135deg, ${bgColor} 0%, ${
          bs.hoverBgColor || "#1d4ed8"
        } 100%)`,
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

// Helper to generate secondary button styles from ButtonStyle config
const getSecondaryButtonStylePreview = (
  buttonStyle?: ButtonStyle
): React.CSSProperties => {
  const bs = buttonStyle || {};
  const bgColor = bs.bgColor || "transparent";
  const textColor = bs.textColor || "#2563eb";
  const borderColor = bs.borderColor || "#2563eb";
  const borderRadius = bs.borderRadius || "0.375rem";
  const variant = bs.variant || "outline";
  const enableAnimation = bs.enableAnimation !== false;
  const transitionDuration = bs.transitionDuration ?? 0.3;

  const baseStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    borderRadius,
    display: "inline-block",
    textDecoration: "none",
    fontWeight: 600,
    cursor: "pointer",
    ...(enableAnimation && { transition: `all ${transitionDuration}s ease` }),
    marginLeft: "0.5rem",
  };

  switch (variant) {
    case "solid":
      return {
        ...baseStyle,
        background: bgColor,
        color: textColor,
        border: "none",
      };
    case "ghost":
      return {
        ...baseStyle,
        background: `${textColor}15`,
        color: textColor,
        border: "none",
      };
    case "text":
      return {
        ...baseStyle,
        background: "transparent",
        color: textColor,
        border: "none",
        textDecoration: "underline",
      };
    default: // outline
      return {
        ...baseStyle,
        background: "transparent",
        color: textColor,
        border: `2px solid ${borderColor}`,
      };
  }
};

// Hover handler helper for primary button
const getPrimaryHoverHandlers = (buttonStyle?: ButtonStyle) => {
  const bs = buttonStyle || {};
  const bgColor = bs.bgColor || "#2563eb";
  const textColor = bs.textColor || "#ffffff";
  const hoverBgColor = bs.hoverBgColor || "#1d4ed8";
  const hoverTextColor = bs.hoverTextColor || "#ffffff";
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
      default: // solid
        btn.style.background = hoverBgColor;
        btn.style.color = hoverTextColor;
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
      default: // solid
        btn.style.background = bgColor;
        btn.style.color = textColor;
        btn.style.boxShadow = shadowValue;
    }
  };

  return { handleMouseEnter, handleMouseLeave };
};

// Hover handler helper for secondary button
const getSecondaryHoverHandlers = (buttonStyle?: ButtonStyle) => {
  const bs = buttonStyle || {};
  const bgColor = bs.bgColor || "transparent";
  const textColor = bs.textColor || "#2563eb";
  const hoverBgColor = bs.hoverBgColor || "#2563eb";
  const hoverTextColor = bs.hoverTextColor || "#ffffff";
  const borderColor = bs.borderColor || "#2563eb";
  const variant = bs.variant || "outline";
  const enableAnimation = bs.enableAnimation !== false;
  const transformAmount = bs.transformAmount ?? 2;

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!enableAnimation) return;
    const btn = e.currentTarget;
    if (transformAmount > 0) {
      btn.style.transform = `translateY(-${transformAmount}px)`;
    }
    switch (variant) {
      case "solid":
        btn.style.background = hoverBgColor;
        btn.style.color = hoverTextColor;
        break;
      case "ghost":
        btn.style.background = `${textColor}25`;
        break;
      case "text":
        btn.style.color = hoverBgColor;
        break;
      default: // outline
        btn.style.background = hoverBgColor;
        btn.style.color = hoverTextColor;
        btn.style.borderColor = hoverBgColor;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!enableAnimation) return;
    const btn = e.currentTarget;
    if (transformAmount > 0) {
      btn.style.transform = "translateY(0)";
    }
    switch (variant) {
      case "solid":
        btn.style.background = bgColor;
        btn.style.color = textColor;
        break;
      case "ghost":
        btn.style.background = `${textColor}15`;
        break;
      case "text":
        btn.style.color = textColor;
        break;
      default: // outline
        btn.style.background = "transparent";
        btn.style.color = textColor;
        btn.style.borderColor = borderColor;
    }
  };

  return { handleMouseEnter, handleMouseLeave };
};

export default function HeroEditor({
  heroVariant,
  setHeroVariant,
  heroContent,
  setHeroContent,
}: Props) {
  return (
    <div className="space-y-3 max-h-full overflow-y-auto pr-4">
      <label className="block text-sm font-semibold text-black">
        Hero Variant
      </label>
      <select
        value={heroVariant}
        onChange={(e) =>
          setHeroVariant(Number(e.target.value) as 1 | 2 | 3 | 4)
        }
        className="w-full px-3 py-2 border rounded text-black"
      >
        <option value={1}>Variant 1 — Centered Text</option>
        <option value={2}>Variant 2 — Image Left, Content Right</option>
        <option value={3}>Variant 3 — Content Left, Image Right</option>
        <option value={4}>
          Variant 4 — Full Background Image with Overlay
        </option>
      </select>

      {(heroVariant === 2 || heroVariant === 3) && (
        <div>
          <ImagePicker
            label="Side Image URL"
            value={heroContent.sideImage}
            onChange={(url) =>
              setHeroContent({ ...heroContent, sideImage: url })
            }
            placeholder="https://..."
          />
        </div>
      )}

      {heroVariant === 4 && (
        <div>
          <ImagePicker
            label="Background Image URL"
            value={heroContent.backgroundImage}
            onChange={(url) =>
              setHeroContent({
                ...heroContent,
                backgroundImage: url,
              })
            }
            placeholder="https://..."
          />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-black">
            Background Color
          </label>
          <input
            type="color"
            value={heroContent.backgroundColor || "#ffffff"}
            onChange={(e) =>
              setHeroContent({
                ...heroContent,
                backgroundColor: e.target.value,
              })
            }
            className="w-full px-3 py-2 border rounded cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-black">
            Text Color
          </label>
          <input
            type="color"
            value={heroContent.textColor || "#111827"}
            onChange={(e) =>
              setHeroContent({ ...heroContent, textColor: e.target.value })
            }
            className="w-full px-3 py-2 border rounded cursor-pointer"
          />
        </div>
      </div>

      <label className="block text-sm font-semibold text-black">Headline</label>
      <input
        type="text"
        value={heroContent.headline}
        onChange={(e) =>
          setHeroContent({ ...heroContent, headline: e.target.value })
        }
        className="w-full px-3 py-2 border rounded text-black"
      />
      <label className="block text-sm font-semibold text-black">
        Subheading
      </label>
      <textarea
        value={heroContent.subheading}
        onChange={(e) =>
          setHeroContent({ ...heroContent, subheading: e.target.value })
        }
        rows={3}
        className="w-full px-3 py-2 border rounded text-black"
      />
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-black">
            Primary CTA
          </label>
          <input
            type="text"
            value={heroContent.primaryCta}
            onChange={(e) =>
              setHeroContent({ ...heroContent, primaryCta: e.target.value })
            }
            className="w-full px-3 py-2 border rounded text-black"
          />
          <label className="block text-xs font-semibold text-gray-600 mt-2">
            Primary CTA URL
          </label>
          <input
            type="text"
            value={heroContent.primaryCtaUrl}
            onChange={(e) =>
              setHeroContent({ ...heroContent, primaryCtaUrl: e.target.value })
            }
            className="w-full px-3 py-2 border rounded text-black"
            placeholder="https://your-link.com or #"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-black">
            Secondary CTA
          </label>
          <input
            type="text"
            value={heroContent.secondaryCta}
            onChange={(e) =>
              setHeroContent({ ...heroContent, secondaryCta: e.target.value })
            }
            className="w-full px-3 py-2 border rounded text-black"
          />
          <label className="block text-xs font-semibold text-gray-600 mt-2">
            Secondary CTA URL
          </label>
          <input
            type="text"
            value={heroContent.secondaryCtaUrl}
            onChange={(e) =>
              setHeroContent({
                ...heroContent,
                secondaryCtaUrl: e.target.value,
              })
            }
            className="w-full px-3 py-2 border rounded text-black"
            placeholder="https://your-link.com or #"
          />
        </div>
      </div>

      {/* Button Customization Section */}
      <div className="p-3 border rounded bg-gray-50 mt-4">
        <label className="block text-sm font-semibold text-black mb-3">
          🎨 Button Customization
        </label>

        {/* Primary Button Options */}
        <div className="mb-4 p-3 bg-white rounded border">
          <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Primary Button
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Variant
              </label>
              <select
                value={heroContent.primaryButtonStyle?.variant || "solid"}
                onChange={(e) =>
                  setHeroContent({
                    ...heroContent,
                    primaryButtonStyle: {
                      ...heroContent.primaryButtonStyle,
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
                value={
                  heroContent.primaryButtonStyle?.borderRadius || "0.375rem"
                }
                onChange={(e) =>
                  setHeroContent({
                    ...heroContent,
                    primaryButtonStyle: {
                      ...heroContent.primaryButtonStyle,
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
                value={heroContent.primaryButtonStyle?.bgColor || "#2563eb"}
                onChange={(e) =>
                  setHeroContent({
                    ...heroContent,
                    primaryButtonStyle: {
                      ...heroContent.primaryButtonStyle,
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
                value={heroContent.primaryButtonStyle?.textColor || "#ffffff"}
                onChange={(e) =>
                  setHeroContent({
                    ...heroContent,
                    primaryButtonStyle: {
                      ...heroContent.primaryButtonStyle,
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
                value={
                  heroContent.primaryButtonStyle?.hoverBgColor || "#1d4ed8"
                }
                onChange={(e) =>
                  setHeroContent({
                    ...heroContent,
                    primaryButtonStyle: {
                      ...heroContent.primaryButtonStyle,
                      hoverBgColor: e.target.value,
                    },
                  })
                }
                className="w-full h-8 border rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Hover Text
              </label>
              <input
                type="color"
                value={
                  heroContent.primaryButtonStyle?.hoverTextColor || "#ffffff"
                }
                onChange={(e) =>
                  setHeroContent({
                    ...heroContent,
                    primaryButtonStyle: {
                      ...heroContent.primaryButtonStyle,
                      hoverTextColor: e.target.value,
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
                Font Size
              </label>
              <select
                value={heroContent.primaryButtonStyle?.fontSize || "1rem"}
                onChange={(e) =>
                  setHeroContent({
                    ...heroContent,
                    primaryButtonStyle: {
                      ...heroContent.primaryButtonStyle,
                      fontSize: e.target.value,
                    },
                  })
                }
                className="w-full px-2 py-1 border rounded text-black text-sm"
              >
                <option value="0.75rem">Small</option>
                <option value="0.875rem">Medium</option>
                <option value="1rem">Default</option>
                <option value="1.125rem">Large</option>
                <option value="1.25rem">X-Large</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Shadow</label>
              <select
                value={heroContent.primaryButtonStyle?.shadow || "md"}
                onChange={(e) =>
                  setHeroContent({
                    ...heroContent,
                    primaryButtonStyle: {
                      ...heroContent.primaryButtonStyle,
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
              id="primaryAnimation"
              checked={
                heroContent.primaryButtonStyle?.enableAnimation !== false
              }
              onChange={(e) =>
                setHeroContent({
                  ...heroContent,
                  primaryButtonStyle: {
                    ...heroContent.primaryButtonStyle,
                    enableAnimation: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="primaryAnimation" className="text-xs text-gray-600">
              Enable Hover Animation
            </label>
          </div>
          {/* Animation Settings - Transform Amount and Duration */}
          {heroContent.primaryButtonStyle?.enableAnimation !== false && (
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
                  value={heroContent.primaryButtonStyle?.transformAmount ?? 2}
                  onChange={(e) =>
                    setHeroContent({
                      ...heroContent,
                      primaryButtonStyle: {
                        ...heroContent.primaryButtonStyle,
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
                  value={
                    heroContent.primaryButtonStyle?.transitionDuration ?? 0.3
                  }
                  onChange={(e) =>
                    setHeroContent({
                      ...heroContent,
                      primaryButtonStyle: {
                        ...heroContent.primaryButtonStyle,
                        transitionDuration: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-2 py-1 border rounded text-black text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Secondary Button Options */}
        <div className="p-3 bg-white rounded border">
          <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Secondary Button
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Variant
              </label>
              <select
                value={heroContent.secondaryButtonStyle?.variant || "outline"}
                onChange={(e) =>
                  setHeroContent({
                    ...heroContent,
                    secondaryButtonStyle: {
                      ...heroContent.secondaryButtonStyle,
                      variant: e.target.value as ButtonStyle["variant"],
                    },
                  })
                }
                className="w-full px-2 py-1 border rounded text-black text-sm"
              >
                <option value="solid">Solid</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost</option>
                <option value="text">Text Link</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Border Radius
              </label>
              <select
                value={
                  heroContent.secondaryButtonStyle?.borderRadius || "0.375rem"
                }
                onChange={(e) =>
                  setHeroContent({
                    ...heroContent,
                    secondaryButtonStyle: {
                      ...heroContent.secondaryButtonStyle,
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
                value={heroContent.secondaryButtonStyle?.bgColor || "#ffffff"}
                onChange={(e) =>
                  setHeroContent({
                    ...heroContent,
                    secondaryButtonStyle: {
                      ...heroContent.secondaryButtonStyle,
                      bgColor: e.target.value,
                    },
                  })
                }
                className="w-full h-8 border rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Text/Border
              </label>
              <input
                type="color"
                value={heroContent.secondaryButtonStyle?.textColor || "#2563eb"}
                onChange={(e) =>
                  setHeroContent({
                    ...heroContent,
                    secondaryButtonStyle: {
                      ...heroContent.secondaryButtonStyle,
                      textColor: e.target.value,
                      borderColor: e.target.value,
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
                value={
                  heroContent.secondaryButtonStyle?.hoverBgColor || "#2563eb"
                }
                onChange={(e) =>
                  setHeroContent({
                    ...heroContent,
                    secondaryButtonStyle: {
                      ...heroContent.secondaryButtonStyle,
                      hoverBgColor: e.target.value,
                    },
                  })
                }
                className="w-full h-8 border rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Hover Text
              </label>
              <input
                type="color"
                value={
                  heroContent.secondaryButtonStyle?.hoverTextColor || "#ffffff"
                }
                onChange={(e) =>
                  setHeroContent({
                    ...heroContent,
                    secondaryButtonStyle: {
                      ...heroContent.secondaryButtonStyle,
                      hoverTextColor: e.target.value,
                    },
                  })
                }
                className="w-full h-8 border rounded cursor-pointer"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <input
              type="checkbox"
              id="secondaryAnimation"
              checked={
                heroContent.secondaryButtonStyle?.enableAnimation !== false
              }
              onChange={(e) =>
                setHeroContent({
                  ...heroContent,
                  secondaryButtonStyle: {
                    ...heroContent.secondaryButtonStyle,
                    enableAnimation: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 rounded border-gray-300"
            />
            <label
              htmlFor="secondaryAnimation"
              className="text-xs text-gray-600"
            >
              Enable Hover Animation
            </label>
          </div>
          {/* Animation Settings - Transform Amount and Duration */}
          {heroContent.secondaryButtonStyle?.enableAnimation !== false && (
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
                  value={heroContent.secondaryButtonStyle?.transformAmount ?? 2}
                  onChange={(e) =>
                    setHeroContent({
                      ...heroContent,
                      secondaryButtonStyle: {
                        ...heroContent.secondaryButtonStyle,
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
                  value={
                    heroContent.secondaryButtonStyle?.transitionDuration ?? 0.3
                  }
                  onChange={(e) =>
                    setHeroContent({
                      ...heroContent,
                      secondaryButtonStyle: {
                        ...heroContent.secondaryButtonStyle,
                        transitionDuration: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-2 py-1 border rounded text-black text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live preview for hero variants */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-black mb-2">
          Live Hero Preview
        </h4>
        <div className="border rounded overflow-hidden">
          {heroVariant === 1 && (
            <div
              className="p-8 text-center"
              style={{
                background:
                  heroContent.backgroundColor ||
                  "linear-gradient(90deg,#2563eb,#6366f1)",
                color: heroContent.textColor || "#ffffff",
              }}
            >
              <h3 className="text-2xl font-bold mb-2">
                {heroContent.headline}
              </h3>
              <p className="text-sm mb-4">{heroContent.subheading}</p>
              <div>
                <a
                  href={heroContent.primaryCtaUrl || "#"}
                  style={getPrimaryButtonStylePreview(
                    heroContent.primaryButtonStyle
                  )}
                  onMouseEnter={
                    getPrimaryHoverHandlers(heroContent.primaryButtonStyle)
                      .handleMouseEnter
                  }
                  onMouseLeave={
                    getPrimaryHoverHandlers(heroContent.primaryButtonStyle)
                      .handleMouseLeave
                  }
                >
                  {heroContent.primaryCta}
                </a>
                <a
                  href={heroContent.secondaryCtaUrl || "#"}
                  style={getSecondaryButtonStylePreview(
                    heroContent.secondaryButtonStyle
                  )}
                  onMouseEnter={
                    getSecondaryHoverHandlers(heroContent.secondaryButtonStyle)
                      .handleMouseEnter
                  }
                  onMouseLeave={
                    getSecondaryHoverHandlers(heroContent.secondaryButtonStyle)
                      .handleMouseLeave
                  }
                >
                  {heroContent.secondaryCta}
                </a>
              </div>
            </div>
          )}

          {heroVariant === 2 && (
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2">
                {heroContent.sideImage ? (
                  <img
                    src={heroContent.sideImage}
                    alt="side"
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-300 flex items-center justify-center text-gray-600">
                    No image
                  </div>
                )}
              </div>
              <div className="md:w-1/2 p-6">
                <h3 className="text-2xl font-bold mb-2">
                  {heroContent.headline}
                </h3>
                <p className="text-sm mb-4">{heroContent.subheading}</p>
                <div>
                  <a
                    href={heroContent.primaryCtaUrl || "#"}
                    style={getPrimaryButtonStylePreview(
                      heroContent.primaryButtonStyle
                    )}
                    onMouseEnter={
                      getPrimaryHoverHandlers(heroContent.primaryButtonStyle)
                        .handleMouseEnter
                    }
                    onMouseLeave={
                      getPrimaryHoverHandlers(heroContent.primaryButtonStyle)
                        .handleMouseLeave
                    }
                  >
                    {heroContent.primaryCta}
                  </a>
                  <a
                    href={heroContent.secondaryCtaUrl || "#"}
                    style={getSecondaryButtonStylePreview(
                      heroContent.secondaryButtonStyle
                    )}
                    onMouseEnter={
                      getSecondaryHoverHandlers(
                        heroContent.secondaryButtonStyle
                      ).handleMouseEnter
                    }
                    onMouseLeave={
                      getSecondaryHoverHandlers(
                        heroContent.secondaryButtonStyle
                      ).handleMouseLeave
                    }
                  >
                    {heroContent.secondaryCta}
                  </a>
                </div>
              </div>
            </div>
          )}

          {heroVariant === 3 && (
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 p-6">
                <h3 className="text-2xl font-bold mb-2">
                  {heroContent.headline}
                </h3>
                <p className="text-sm mb-4">{heroContent.subheading}</p>
                <div>
                  <a
                    href={heroContent.primaryCtaUrl || "#"}
                    style={getPrimaryButtonStylePreview(
                      heroContent.primaryButtonStyle
                    )}
                    onMouseEnter={
                      getPrimaryHoverHandlers(heroContent.primaryButtonStyle)
                        .handleMouseEnter
                    }
                    onMouseLeave={
                      getPrimaryHoverHandlers(heroContent.primaryButtonStyle)
                        .handleMouseLeave
                    }
                  >
                    {heroContent.primaryCta}
                  </a>
                  <a
                    href={heroContent.secondaryCtaUrl || "#"}
                    style={getSecondaryButtonStylePreview(
                      heroContent.secondaryButtonStyle
                    )}
                    onMouseEnter={
                      getSecondaryHoverHandlers(
                        heroContent.secondaryButtonStyle
                      ).handleMouseEnter
                    }
                    onMouseLeave={
                      getSecondaryHoverHandlers(
                        heroContent.secondaryButtonStyle
                      ).handleMouseLeave
                    }
                  >
                    {heroContent.secondaryCta}
                  </a>
                </div>
              </div>
              <div className="md:w-1/2">
                {heroContent.sideImage ? (
                  <img
                    src={heroContent.sideImage}
                    alt="side"
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-300 flex items-center justify-center text-gray-600">
                    No image
                  </div>
                )}
              </div>
            </div>
          )}

          {heroVariant === 4 && (
            <div
              className="relative h-64 bg-cover bg-center"
              style={
                heroContent.backgroundImage
                  ? { backgroundImage: `url(${heroContent.backgroundImage})` }
                  : { background: "linear-gradient(90deg,#2563eb,#6366f1)" }
              }
            >
              <div className="absolute inset-0 bg-black opacity-50" />
              <div className="relative z-10 p-6 text-white text-center flex items-center justify-center h-full">
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    {heroContent.headline}
                  </h3>
                  <p className="text-sm mb-4">{heroContent.subheading}</p>
                  <div>
                    <a
                      href={heroContent.primaryCtaUrl || "#"}
                      style={getPrimaryButtonStylePreview(
                        heroContent.primaryButtonStyle
                      )}
                      onMouseEnter={
                        getPrimaryHoverHandlers(heroContent.primaryButtonStyle)
                          .handleMouseEnter
                      }
                      onMouseLeave={
                        getPrimaryHoverHandlers(heroContent.primaryButtonStyle)
                          .handleMouseLeave
                      }
                    >
                      {heroContent.primaryCta}
                    </a>
                    <a
                      href={heroContent.secondaryCtaUrl || "#"}
                      style={getSecondaryButtonStylePreview(
                        heroContent.secondaryButtonStyle
                      )}
                      onMouseEnter={
                        getSecondaryHoverHandlers(
                          heroContent.secondaryButtonStyle
                        ).handleMouseEnter
                      }
                      onMouseLeave={
                        getSecondaryHoverHandlers(
                          heroContent.secondaryButtonStyle
                        ).handleMouseLeave
                      }
                    >
                      {heroContent.secondaryCta}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
