import React, { useState } from "react";
import "./FeaturesRenderer.css";
import type { FeaturesContent, FeatureCard } from "./FeaturesEditor";

interface FeaturesRendererProps {
  content: FeaturesContent;
}

export default function FeaturesRenderer({ content }: FeaturesRendererProps) {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const columns = content.columnsPerRow || 3;
  const gridColsClass = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[columns];

  const styleClass = content.cardStyle || "shadow";

  // Check if any custom CSS is applied (same logic as getCardClassName)
  const css = content.cardCssCustom || {};
  const hasCustomStyles =
    css.textColor ||
    css.hoverTextColor ||
    css.backgroundColor ||
    css.hoverBackgroundColor ||
    (css.gradientStart && css.gradientEnd) ||
    css.borderColor ||
    css.shadowColor ||
    css.borderRadius ||
    css.padding;

  const renderCardContent = (card: FeatureCard, isHovered: boolean) => {
    const variant = content.variant;

    // Use inherit when custom styles are applied, otherwise use default gray
    // This allows the parent card's inline color style to cascade down
    const titleColorClass = hasCustomStyles ? "" : "text-gray-900";
    const textColorClass = hasCustomStyles ? "" : "text-gray-600";
    const subtitleColorClass = hasCustomStyles ? "opacity-80" : "text-gray-500";

    // Title hover color - only apply hoverTextColor to title when hovered
    const titleHoverStyle: React.CSSProperties = {};
    if (isHovered && css.hoverTextColor) {
      titleHoverStyle.color = css.hoverTextColor;
    }

    if (variant === 1) {
      // Simple variant
      return (
        <div className="flex flex-col h-full p-6 sm:p-8">
          <h3
            className={`text-xl font-bold ${titleColorClass} mb-2 transition-colors duration-300`}
            style={titleHoverStyle}
          >
            {card.title}
          </h3>
          <p className={`${textColorClass} flex-1`}>{card.description}</p>
        </div>
      );
    }

    if (variant === 2) {
      // Icon/Badge variant
      return (
        <div className="flex flex-col h-full p-6 sm:p-8">
          {card.icon && (
            <div className="text-4xl mb-3 inline-block">{card.icon}</div>
          )}
          {card.badge && (
            <div className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mb-2 w-fit">
              {card.badge}
            </div>
          )}
          <h3
            className={`text-xl font-bold ${titleColorClass} mb-1 transition-colors duration-300`}
            style={titleHoverStyle}
          >
            {card.title}
          </h3>
          {card.subtitle && (
            <p className={`text-sm ${subtitleColorClass} mb-2`}>
              {card.subtitle}
            </p>
          )}
          <p className={`${textColorClass} flex-1`}>{card.description}</p>
        </div>
      );
    }

    if (variant === 3) {
      // Image variant - image at top, text at bottom
      return (
        <div className="flex flex-col h-full">
          {card.image && (
            <div className="w-full h-48 mb-0 rounded-t-lg overflow-hidden features-image-container">
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover features-image-img"
              />
            </div>
          )}
          <div className="flex flex-col flex-1 p-4 sm:p-6">
            {card.icon && (
              <div className="text-3xl mb-2 inline-block features-variant3-icon">
                {card.icon}
              </div>
            )}
            <h3
              className={`text-xl font-bold ${titleColorClass} mb-1 transition-colors duration-300`}
              style={titleHoverStyle}
            >
              {card.title}
            </h3>
            {card.subtitle && (
              <p className={`text-sm ${subtitleColorClass} mb-2`}>
                {card.subtitle}
              </p>
            )}
            <p className={`${textColorClass} flex-1`}>{card.description}</p>
          </div>
        </div>
      );
    }
  };

  const getCardClassName = () => {
    const baseClass =
      "features-card group overflow-hidden flex flex-col h-full";

    // Check if any custom CSS is applied
    const css = content.cardCssCustom || {};
    const hasCustomStyles =
      css.textColor ||
      css.hoverTextColor ||
      css.backgroundColor ||
      css.hoverBackgroundColor ||
      (css.gradientStart && css.gradientEnd) ||
      css.borderColor ||
      css.shadowColor ||
      css.borderRadius ||
      css.padding;

    // If custom styles are applied, use base class only to avoid CSS conflicts
    if (hasCustomStyles) {
      return `${baseClass} features-card-custom`;
    }

    switch (styleClass) {
      case "minimal":
        return `${baseClass} features-card-minimal`;
      case "shadow":
        return `${baseClass} features-card-shadow`;
      case "gradient":
        return `${baseClass} features-card-gradient`;
      case "modern":
        return `${baseClass} features-card-modern`;
      default:
        return `${baseClass} features-card-shadow`;
    }
  };

  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number = 0.15) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  // Build inline style for cards based on customizations
  const getCardInlineStyle = (): React.CSSProperties => {
    const css = content.cardCssCustom || {};
    const styles: React.CSSProperties = {};

    // Set text color - use default dark color if custom styles applied but no textColor set
    if (css.textColor) {
      styles.color = css.textColor;
    } else if (hasCustomStyles) {
      // Default to dark text for readability when custom bg is set
      styles.color = "#1f2937";
    }

    // Only apply gradient if BOTH start and end colors are explicitly set
    if (css.gradientStart && css.gradientEnd) {
      const angle = css.gradientAngle || "135deg";
      styles.background = `linear-gradient(${angle}, ${css.gradientStart} 0%, ${css.gradientEnd} 100%)`;
    } else if (css.backgroundColor) {
      styles.backgroundColor = css.backgroundColor;
    }

    if (css.borderColor) styles.borderColor = css.borderColor;
    if (css.borderWidth) styles.borderWidth = css.borderWidth;
    if (css.borderRadius) styles.borderRadius = css.borderRadius;
    if (css.padding) styles.padding = css.padding;
    if (css.transitionDuration)
      styles.transition = `all ${css.transitionDuration}`;

    // Shadow styling
    if (
      css.shadowColor ||
      css.shadowBlur ||
      css.shadowSpread ||
      css.shadowOffsetX ||
      css.shadowOffsetY
    ) {
      const sx = css.shadowOffsetX || "0px";
      const sy = css.shadowOffsetY || "2px";
      const sb = css.shadowBlur || "8px";
      const ss = css.shadowSpread || "0px";
      const sc = css.shadowColor
        ? hexToRgba(css.shadowColor, 0.15)
        : "rgba(0,0,0,0.1)";
      styles.boxShadow = `${sx} ${sy} ${sb} ${ss} ${sc}`;
    }

    return styles;
  };

  // Build hover inline style for cards - excludes text color (handled separately for title only)
  const getCardHoverStyle = (): React.CSSProperties => {
    const css = content.cardCssCustom || {};
    const styles: React.CSSProperties = {};

    // Don't change card text color on hover - only title changes (handled in renderCardContent)

    // Only apply gradient if BOTH start and end colors are explicitly set
    if (css.gradientStart && css.gradientEnd) {
      const angle = css.gradientAngle || "135deg";
      styles.background = `linear-gradient(${angle}, ${css.gradientStart} 0%, ${css.gradientEnd} 100%)`;
    } else if (css.hoverBackgroundColor) {
      styles.backgroundColor = css.hoverBackgroundColor;
    }

    if (css.hoverTransform) styles.transform = css.hoverTransform;

    // Enhanced shadow on hover
    if (
      css.shadowColor ||
      css.shadowBlur ||
      css.shadowSpread ||
      css.shadowOffsetX ||
      css.shadowOffsetY
    ) {
      const sx = css.shadowOffsetX || "0px";
      const sy = css.shadowOffsetY || "2px";
      const sb = css.shadowBlur
        ? `${Number(css.shadowBlur.replace("px", "")) + 4}px`
        : "12px";
      const ss = css.shadowSpread || "0px";
      const sc = css.shadowColor
        ? hexToRgba(css.shadowColor, 0.25)
        : "rgba(0,0,0,0.15)";
      styles.boxShadow = `${sx} ${sy} ${sb} ${ss} ${sc}`;
    }

    return styles;
  };

  return (
    <section className="features-section py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {content.sectionTitle}
          </h2>
          {content.sectionSubtitle && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {content.sectionSubtitle}
            </p>
          )}
        </div>

        {/* Cards Grid */}
        <div
          className={`grid ${gridColsClass} gap-6 lg:gap-8`}
          style={{ position: "relative" }}
        >
          {content.cards.map((card) => {
            const isHovered = hoveredCardId === card.id;
            const cardInlineStyle = getCardInlineStyle();
            const cardHoverStyle = getCardHoverStyle();
            const finalStyle = isHovered
              ? { ...cardInlineStyle, ...cardHoverStyle }
              : cardInlineStyle;

            const cardElement = (
              <div
                key={card.id}
                className={getCardClassName()}
                data-variant={content.variant}
                data-style={styleClass}
                style={finalStyle}
                onMouseEnter={() => setHoveredCardId(card.id)}
                onMouseLeave={() => setHoveredCardId(null)}
              >
                {renderCardContent(card, isHovered)}
              </div>
            );

            // Wrap in link if card has a link
            if (card.link) {
              return (
                <a
                  key={card.id}
                  href={card.link}
                  className="block no-underline"
                  style={{ textDecoration: "none", color: "inherit" }}
                  target={card.link.startsWith("http") ? "_blank" : "_self"}
                  rel={
                    card.link.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                >
                  {cardElement}
                </a>
              );
            }

            return cardElement;
          })}
        </div>

        {content.cards.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No features to display yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
