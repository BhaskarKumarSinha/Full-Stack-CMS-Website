import { useState } from "react";
import ImagePicker from "../../components/ImagePicker";

// Utility function to generate unique IDs (pure, doesn't use Date.now)
const generateId = () => `card-${Math.random().toString(36).substr(2, 9)}`;

export interface FeatureCard {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  icon?: string;
  image?: string;
  badge?: string;
  link?: string; // Optional link to redirect when card is clicked
  customFields?: Record<string, string>;
}

export interface FeaturesContent {
  sectionTitle: string;
  sectionSubtitle?: string;
  variant: 1 | 2 | 3; // 1: Simple (title + description), 2: With Icon/Badge, 3: With Image
  cards: FeatureCard[];
  columnsPerRow?: number; // 2, 3, 4
  cardStyle?: "minimal" | "shadow" | "gradient" | "modern";

  // CSS Customization Properties
  cardCssCustom?: {
    // Colors
    textColor?: string;
    hoverTextColor?: string;
    backgroundColor?: string;
    hoverBackgroundColor?: string;

    // Border
    borderColor?: string;
    borderWidth?: string; // e.g., "1px"
    borderRadius?: string; // e.g., "8px"
    borderGradientStart?: string;
    borderGradientEnd?: string;

    // Gradient Background (for gradient style)
    gradientStart?: string;
    gradientEnd?: string;
    gradientAngle?: string; // e.g., "135deg"

    // Shadow
    shadowColor?: string;
    shadowBlur?: string; // e.g., "8px"
    shadowSpread?: string; // e.g., "0px"
    shadowOffsetX?: string; // e.g., "0px"
    shadowOffsetY?: string; // e.g., "2px"

    // Effects
    transitionDuration?: string; // e.g., "0.3s"
    hoverTransform?: string; // e.g., "translateY(-4px)"
    padding?: string; // e.g., "16px"

    // Hover Shadow
    hoverShadowBlur?: string;
    hoverShadowSpread?: string;
  };
}

interface FeaturesEditorProps {
  content: FeaturesContent;
  onChange: (content: FeaturesContent) => void;
}

const VARIANT_DESCRIPTIONS = {
  1: "Simple cards with title and description",
  2: "Cards with icons/badges and multiple text fields",
  3: "Cards with featured images and rich content",
};

const CARD_STYLE_DESCRIPTIONS = {
  minimal: "Clean minimal look with light border and background",
  shadow: "Soft shadow with subtle elevation and hover effect",
  gradient: "Modern gradient background with color transition",
  modern: "Bold colored border with smooth hover color change",
};

export default function FeaturesEditor({
  content,
  onChange,
}: FeaturesEditorProps) {
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Ensure content has default values
  const safeContent: FeaturesContent = {
    sectionTitle: content?.sectionTitle || "Powerful Features",
    sectionSubtitle: content?.sectionSubtitle || "",
    variant: content?.variant || 2,
    columnsPerRow: content?.columnsPerRow || 3,
    cardStyle: content?.cardStyle || "shadow",
    cards: Array.isArray(content?.cards) ? content.cards : [],
    cardCssCustom: content?.cardCssCustom || {},
  };

  const safeOnChange = (updatedContent: FeaturesContent) => {
    if (onChange && typeof onChange === "function") {
      onChange(updatedContent);
    }
  };

  const addCard = () => {
    const newCard: FeatureCard = {
      id: generateId(),
      title: "New Feature",
      description: "Feature description goes here",
    };
    safeOnChange({
      ...safeContent,
      cards: [...(safeContent.cards || []), newCard],
    });
  };

  const updateCard = (cardId: string, updates: Partial<FeatureCard>) => {
    safeOnChange({
      ...safeContent,
      cards: (safeContent.cards || []).map((card) =>
        card.id === cardId ? { ...card, ...updates } : card
      ),
    });
  };

  const deleteCard = (cardId: string) => {
    safeOnChange({
      ...safeContent,
      cards: (safeContent.cards || []).filter((card) => card.id !== cardId),
    });
  };

  const moveCard = (cardId: string, direction: "up" | "down") => {
    const cards = safeContent.cards || [];
    const index = cards.findIndex((c) => c.id === cardId);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === cards.length - 1)
    )
      return;

    const newCards = [...cards];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newCards[index], newCards[targetIndex]] = [
      newCards[targetIndex],
      newCards[index],
    ];

    safeOnChange({ ...safeContent, cards: newCards });
  };

  const duplicateCard = (cardId: string) => {
    const cards = safeContent.cards || [];
    const cardToDuplicate = cards.find((c) => c.id === cardId);
    if (!cardToDuplicate) return;

    const duplicatedCard: FeatureCard = {
      ...cardToDuplicate,
      id: generateId(),
    };

    const index = cards.findIndex((c) => c.id === cardId);
    const newCards = [...cards];
    newCards.splice(index + 1, 0, duplicatedCard);

    safeOnChange({ ...safeContent, cards: newCards });
  };

  return (
    <div className="space-y-6">
      {/* Section Settings */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Section Settings
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Section Title
            </label>
            <input
              type="text"
              value={safeContent.sectionTitle}
              onChange={(e) =>
                safeOnChange({ ...safeContent, sectionTitle: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
              placeholder="e.g., Powerful Features, Our Services"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Section Subtitle (Optional)
            </label>
            <input
              type="text"
              value={safeContent.sectionSubtitle || ""}
              onChange={(e) =>
                safeOnChange({
                  ...safeContent,
                  sectionSubtitle: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
              placeholder="e.g., Everything you need to succeed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Layout Variant (3 Options)
              </label>
              <select
                value={safeContent.variant}
                onChange={(e) =>
                  safeOnChange({
                    ...safeContent,
                    variant: parseInt(e.target.value) as 1 | 2 | 3,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
              >
                <option value="1">Variant 1: Title + Description</option>
                <option value="2">Variant 2: Icon/Badge + Text</option>
                <option value="3">Variant 3: Image + Content</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                📝 {VARIANT_DESCRIPTIONS[safeContent.variant]}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cards Per Row
              </label>
              <select
                value={safeContent.columnsPerRow || 3}
                onChange={(e) =>
                  safeOnChange({
                    ...safeContent,
                    columnsPerRow: parseInt(e.target.value) as 2 | 3 | 4,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
              >
                <option value="2">2 Cards</option>
                <option value="3">3 Cards</option>
                <option value="4">4 Cards</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Card Style (4 Options)
            </label>
            <select
              value={safeContent.cardStyle || "shadow"}
              onChange={(e) =>
                safeOnChange({
                  ...safeContent,
                  cardStyle: e.target.value as
                    | "minimal"
                    | "shadow"
                    | "gradient"
                    | "modern",
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
            >
              <option value="minimal">1. Minimal — Clean & Simple</option>
              <option value="shadow">2. Shadow — Elevated Look</option>
              <option value="gradient">3. Gradient — Modern Design</option>
              <option value="modern">4. Modern — Bold Accent</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {CARD_STYLE_DESCRIPTIONS[safeContent.cardStyle || "shadow"]}
            </p>

            {/* Visual Style Preview */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              {(["minimal", "shadow", "gradient", "modern"] as const).map(
                (style) => (
                  <div
                    key={style}
                    className={`p-3 rounded cursor-pointer border-2 text-center text-xs font-semibold transition ${
                      (safeContent.cardStyle || "shadow") === style
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() =>
                      safeOnChange({
                        ...safeContent,
                        cardStyle: style,
                      })
                    }
                  >
                    {style === "minimal" && (
                      <div className="p-2 border-t border-l border-b border-r border-gray-300 rounded text-gray-600 text-xs">
                        Minimal
                      </div>
                    )}
                    {style === "shadow" && (
                      <div className="p-2 rounded shadow text-gray-700 text-xs">
                        Shadow
                      </div>
                    )}
                    {style === "gradient" && (
                      <div
                        className="p-2 rounded text-white text-xs"
                        style={{
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      >
                        Gradient
                      </div>
                    )}
                    {style === "modern" && (
                      <div className="p-2 border-2 border-blue-600 rounded text-blue-600 text-xs">
                        Modern
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Advanced CSS Customization */}
          <div className="mt-6 pt-6 border-t border-gray-300">
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              🎨 Advanced CSS Customization
            </label>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Colors */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-800 text-sm mb-3">
                  Colors
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-700 font-medium">
                      Text Color
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={
                          safeContent.cardCssCustom?.textColor || "#111827"
                        }
                        onChange={(e) =>
                          safeOnChange({
                            ...safeContent,
                            cardCssCustom: {
                              ...safeContent.cardCssCustom,
                              textColor: e.target.value,
                            },
                          })
                        }
                        className="w-12 h-8 rounded cursor-pointer"
                      />
                      <span className="text-xs text-gray-600">
                        {safeContent.cardCssCustom?.textColor || "#111827"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-700 font-medium">
                      Hover Text Color
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={
                          safeContent.cardCssCustom?.hoverTextColor || "#ffffff"
                        }
                        onChange={(e) =>
                          safeOnChange({
                            ...safeContent,
                            cardCssCustom: {
                              ...safeContent.cardCssCustom,
                              hoverTextColor: e.target.value,
                            },
                          })
                        }
                        className="w-12 h-8 rounded cursor-pointer"
                      />
                      <span className="text-xs text-gray-600">
                        {safeContent.cardCssCustom?.hoverTextColor || "#ffffff"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-700 font-medium">
                      Background Color
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={
                          safeContent.cardCssCustom?.backgroundColor ||
                          "#ffffff"
                        }
                        onChange={(e) =>
                          safeOnChange({
                            ...safeContent,
                            cardCssCustom: {
                              ...safeContent.cardCssCustom,
                              backgroundColor: e.target.value,
                            },
                          })
                        }
                        className="w-12 h-8 rounded cursor-pointer"
                      />
                      <span className="text-xs text-gray-600">
                        {safeContent.cardCssCustom?.backgroundColor ||
                          "#ffffff"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-700 font-medium">
                      Hover Background
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={
                          safeContent.cardCssCustom?.hoverBackgroundColor ||
                          "#f5f5f5"
                        }
                        onChange={(e) =>
                          safeOnChange({
                            ...safeContent,
                            cardCssCustom: {
                              ...safeContent.cardCssCustom,
                              hoverBackgroundColor: e.target.value,
                            },
                          })
                        }
                        className="w-12 h-8 rounded cursor-pointer"
                      />
                      <span className="text-xs text-gray-600">
                        {safeContent.cardCssCustom?.hoverBackgroundColor ||
                          "#f5f5f5"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Border & Radius */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-gray-800 text-sm mb-3">
                  Border & Radius
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-700 font-medium">
                      Border Color
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={
                          safeContent.cardCssCustom?.borderColor || "#e5e7eb"
                        }
                        onChange={(e) =>
                          safeOnChange({
                            ...safeContent,
                            cardCssCustom: {
                              ...safeContent.cardCssCustom,
                              borderColor: e.target.value,
                            },
                          })
                        }
                        className="w-12 h-8 rounded cursor-pointer"
                      />
                      <span className="text-xs text-gray-600">
                        {safeContent.cardCssCustom?.borderColor || "#e5e7eb"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-700 font-medium">
                      Border Width
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 1px"
                      value={safeContent.cardCssCustom?.borderWidth || "1px"}
                      onChange={(e) =>
                        safeOnChange({
                          ...safeContent,
                          cardCssCustom: {
                            ...safeContent.cardCssCustom,
                            borderWidth: e.target.value,
                          },
                        })
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-black"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-700 font-medium">
                      Border Radius
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 8px"
                      value={safeContent.cardCssCustom?.borderRadius || "8px"}
                      onChange={(e) =>
                        safeOnChange({
                          ...safeContent,
                          cardCssCustom: {
                            ...safeContent.cardCssCustom,
                            borderRadius: e.target.value,
                          },
                        })
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Gradient Settings */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-gray-800 text-sm mb-3">
                  Gradient
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-700 font-medium">
                      Gradient Start Color
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={
                          safeContent.cardCssCustom?.gradientStart || "#667eea"
                        }
                        onChange={(e) =>
                          safeOnChange({
                            ...safeContent,
                            cardCssCustom: {
                              ...safeContent.cardCssCustom,
                              gradientStart: e.target.value,
                            },
                          })
                        }
                        className="w-12 h-8 rounded cursor-pointer"
                      />
                      <span className="text-xs text-gray-600">
                        {safeContent.cardCssCustom?.gradientStart || "#667eea"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-700 font-medium">
                      Gradient End Color
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={
                          safeContent.cardCssCustom?.gradientEnd || "#764ba2"
                        }
                        onChange={(e) =>
                          safeOnChange({
                            ...safeContent,
                            cardCssCustom: {
                              ...safeContent.cardCssCustom,
                              gradientEnd: e.target.value,
                            },
                          })
                        }
                        className="w-12 h-8 rounded cursor-pointer"
                      />
                      <span className="text-xs text-gray-600">
                        {safeContent.cardCssCustom?.gradientEnd || "#764ba2"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-700 font-medium">
                      Gradient Angle
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 135deg"
                      value={
                        safeContent.cardCssCustom?.gradientAngle || "135deg"
                      }
                      onChange={(e) =>
                        safeOnChange({
                          ...safeContent,
                          cardCssCustom: {
                            ...safeContent.cardCssCustom,
                            gradientAngle: e.target.value,
                          },
                        })
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Shadow Settings */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-gray-800 text-sm mb-3">
                  Shadow & Effects
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-700 font-medium">
                      Shadow Color
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={
                          safeContent.cardCssCustom?.shadowColor || "#000000"
                        }
                        onChange={(e) =>
                          safeOnChange({
                            ...safeContent,
                            cardCssCustom: {
                              ...safeContent.cardCssCustom,
                              shadowColor: e.target.value,
                            },
                          })
                        }
                        className="w-12 h-8 rounded cursor-pointer"
                      />
                      <span className="text-xs text-gray-600">
                        {safeContent.cardCssCustom?.shadowColor || "#000000"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-700 font-medium">
                      Shadow Blur
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 8px"
                      value={safeContent.cardCssCustom?.shadowBlur || "8px"}
                      onChange={(e) =>
                        safeOnChange({
                          ...safeContent,
                          cardCssCustom: {
                            ...safeContent.cardCssCustom,
                            shadowBlur: e.target.value,
                          },
                        })
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-black"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-700 font-medium">
                      Transition Duration
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 0.3s"
                      value={
                        safeContent.cardCssCustom?.transitionDuration || "0.3s"
                      }
                      onChange={(e) =>
                        safeOnChange({
                          ...safeContent,
                          cardCssCustom: {
                            ...safeContent.cardCssCustom,
                            transitionDuration: e.target.value,
                          },
                        })
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-black"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-700 font-medium">
                      Hover Transform
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., translateY(-4px)"
                      value={
                        safeContent.cardCssCustom?.hoverTransform ||
                        "translateY(-2px)"
                      }
                      onChange={(e) =>
                        safeOnChange({
                          ...safeContent,
                          cardCssCustom: {
                            ...safeContent.cardCssCustom,
                            hoverTransform: e.target.value,
                          },
                        })
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Management */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Feature Cards ({safeContent.cards.length})
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Add, edit, or reorder your feature cards
            </p>
          </div>
          <button
            type="button"
            onClick={addCard}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            + Add Card
          </button>
        </div>

        <div className="space-y-3">
          {safeContent.cards.map((card, index) => (
            <div
              key={card.id}
              className="border-2 border-blue-200 rounded-lg p-4 bg-gray-50"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedCardId(
                      expandedCardId === card.id ? null : card.id
                    )
                  }
                  className="flex-1 text-left hover:opacity-70 transition"
                >
                  <h4 className="font-bold text-gray-900 text-lg">
                    Card #{index + 1}: {card.title || "Untitled"}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {card.description}
                  </p>
                </button>

                <div className="flex gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => moveCard(card.id, "up")}
                    disabled={index === 0}
                    className="px-2 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded text-sm"
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCard(card.id, "down")}
                    disabled={index === safeContent.cards.length - 1}
                    className="px-2 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded text-sm"
                    title="Move down"
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateCard(card.id)}
                    className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                    title="Duplicate"
                  >
                    📋
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCard(card.id)}
                    className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Card Details - Expand/Collapse */}
              {expandedCardId === card.id && (
                <div className="mt-4 pt-4 border-t border-gray-300 space-y-3">
                  {/* Basic Fields - All Variants */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) =>
                        updateCard(card.id, { title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="Feature title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={card.description}
                      onChange={(e) =>
                        updateCard(card.id, { description: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="Feature description"
                    />
                  </div>

                  {/* Subtitle - Variant 2 & 3 */}
                  {(content.variant === 2 || content.variant === 3) && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Subtitle (Optional)
                      </label>
                      <input
                        type="text"
                        value={card.subtitle || ""}
                        onChange={(e) =>
                          updateCard(card.id, { subtitle: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                        placeholder="e.g., Secondary text"
                      />
                    </div>
                  )}

                  {/* Icon/Badge - Variant 2 & 3 */}
                  {(content.variant === 2 || content.variant === 3) && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Icon/Emoji or Badge (Optional)
                      </label>
                      <input
                        type="text"
                        value={card.icon || ""}
                        onChange={(e) =>
                          updateCard(card.id, { icon: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                        placeholder="e.g., ⚡ or 🎯 or badge-text"
                        maxLength={10}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use emoji or short text (max 10 chars)
                      </p>
                    </div>
                  )}

                  {/* Image - Variant 3 */}
                  {content.variant === 3 && (
                    <div>
                      <ImagePicker
                        label="Featured Image URL (Optional)"
                        value={card.image || ""}
                        onChange={(url: string) =>
                          updateCard(card.id, { image: url })
                        }
                        placeholder="https://example.com/image.jpg"
                      />
                      {card.image && (
                        <div className="mt-2">
                          <img
                            src={card.image}
                            alt={card.title}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Badge - Variant 2 & 3 */}
                  {(content.variant === 2 || content.variant === 3) && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Badge Label (Optional)
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={card.badge || ""}
                          onChange={(e) =>
                            updateCard(card.id, { badge: e.target.value })
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-black"
                        >
                          <option value="">No Badge</option>
                          <option value="Popular">🔥 Popular</option>
                          <option value="New">✨ New</option>
                          <option value="Featured">⭐ Featured</option>
                          <option value="Hot">🔥 Hot</option>
                          <option value="Trending">📈 Trending</option>
                          <option value="Best Seller">💎 Best Seller</option>
                          <option value="Premium">👑 Premium</option>
                          <option value="Recommended">💯 Recommended</option>
                          <option value="Limited">⏰ Limited</option>
                          <option value="Sale">🏷️ Sale</option>
                        </select>
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          value={card.badge || ""}
                          onChange={(e) =>
                            updateCard(card.id, { badge: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm"
                          placeholder="Or enter custom badge text"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Choose from preset badges or enter your own custom text
                      </p>
                    </div>
                  )}

                  {/* Link URL - All Variants */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      🔗 Card Link (Optional)
                    </label>
                    <input
                      type="text"
                      value={card.link || ""}
                      onChange={(e) =>
                        updateCard(card.id, { link: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="https://example.com or /page-slug"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Add a URL to make this card clickable. Leave empty for no
                      link.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {safeContent.cards.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No cards yet. Click "Add Card" to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
