import type React from "react";
import ImagePicker from "../../components/ImagePicker";
import type { HeroContent } from "./HeroEditor";

type Feature = { title: string; description: string };
type Testimonial = { quote: string; author: string; role: string };
type CTA = {
  headline: string;
  subtext: string;
  primaryText: string;
  primaryUrl: string;
  secondaryText: string;
  secondaryUrl: string;
  secondaryCtaVariant: "outlined" | "text" | "ghost";
  ctaVariant: 1 | 2 | 3 | 4;
  sideImage: string;
  backgroundImage: string;
};

// Helper to get secondary CTA styles
const getSecondaryCtaStyle = (
  variant: "outlined" | "text" | "ghost",
  isWhiteText: boolean = false
): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    display: "inline-block",
    textDecoration: "none",
    marginLeft: "0.5rem",
  };

  switch (variant) {
    case "outlined":
      return {
        ...baseStyle,
        border: isWhiteText ? "2px solid white" : "2px solid #2563eb",
        color: isWhiteText ? "white" : "#2563eb",
        backgroundColor: "transparent",
      };
    case "text":
      return {
        ...baseStyle,
        border: "none",
        color: isWhiteText ? "white" : "#2563eb",
        backgroundColor: "transparent",
        textDecoration: "underline",
      };
    case "ghost":
      return {
        ...baseStyle,
        border: "none",
        color: isWhiteText ? "rgba(255,255,255,0.8)" : "rgba(37,99,235,0.8)",
        backgroundColor: isWhiteText
          ? "rgba(255,255,255,0.1)"
          : "rgba(37,99,235,0.1)",
      };
    default:
      return { ...baseStyle };
  }
};

type Props = {
  editingSectionId: string | null;
  featuresContent: Feature[];
  setFeaturesContent: (c: Feature[]) => void;
  testimonialsContent: Testimonial[];
  setTestimonialsContent: (c: Testimonial[]) => void;
  ctaContent: CTA;
  setCtaContent: (c: CTA) => void;
  ctaVariant: 1 | 2 | 3 | 4;
  setCtaVariant: (v: 1 | 2 | 3 | 4) => void;
  heroContent: HeroContent;
  setHeroContent: (c: HeroContent) => void;
  heroVariant: 1 | 2 | 3 | 4;
  setHeroVariant: (v: 1 | 2 | 3 | 4) => void;
};

export default function SectionEditor({
  editingSectionId,
  featuresContent,
  setFeaturesContent,
  testimonialsContent,
  setTestimonialsContent,
  ctaContent,
  setCtaContent,
  ctaVariant,
  setCtaVariant,
  heroContent: _heroContent,
  setHeroContent: _setHeroContent,
  heroVariant: _heroVariant,
  setHeroVariant: _setHeroVariant,
}: Props) {
  if (!editingSectionId) return null;

  if (editingSectionId === "features") {
    return (
      <div className="space-y-3">
        {featuresContent.map((f, idx) => (
          <div key={idx} className="p-3 border rounded bg-white">
            <label className="block text-sm font-semibold text-black">
              Title
            </label>
            <input
              type="text"
              value={f.title}
              onChange={(e) => {
                const arr = [...featuresContent];
                arr[idx] = { ...arr[idx], title: e.target.value };
                setFeaturesContent(arr);
              }}
              className="w-full px-3 py-2 border rounded text-black mb-2"
            />
            <label className="block text-sm font-semibold text-black">
              Description
            </label>
            <textarea
              value={f.description}
              onChange={(e) => {
                const arr = [...featuresContent];
                arr[idx] = { ...arr[idx], description: e.target.value };
                setFeaturesContent(arr);
              }}
              rows={2}
              className="w-full px-3 py-2 border rounded text-black"
            />
          </div>
        ))}
      </div>
    );
  }

  if (editingSectionId === "testimonials") {
    return (
      <div className="space-y-3">
        {testimonialsContent.map((t, idx) => (
          <div key={idx} className="p-3 border rounded bg-white">
            <label className="block text-sm font-semibold text-black">
              Quote
            </label>
            <textarea
              value={t.quote}
              onChange={(e) => {
                const arr = [...testimonialsContent];
                arr[idx] = { ...arr[idx], quote: e.target.value };
                setTestimonialsContent(arr);
              }}
              rows={2}
              className="w-full px-3 py-2 border rounded text-black mb-2"
            />
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-black">
                  Author
                </label>
                <input
                  type="text"
                  value={t.author}
                  onChange={(e) => {
                    const arr = [...testimonialsContent];
                    arr[idx] = { ...arr[idx], author: e.target.value };
                    setTestimonialsContent(arr);
                  }}
                  className="w-full px-3 py-2 border rounded text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black">
                  Role
                </label>
                <input
                  type="text"
                  value={t.role}
                  onChange={(e) => {
                    const arr = [...testimonialsContent];
                    arr[idx] = { ...arr[idx], role: e.target.value };
                    setTestimonialsContent(arr);
                  }}
                  className="w-full px-3 py-2 border rounded text-black"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (editingSectionId === "cta") {
    return (
      <div className="space-y-3 max-h-full overflow-y-auto pr-4">
        <label className="block text-sm font-semibold text-black">
          CTA Variant
        </label>
        <select
          value={ctaVariant}
          onChange={(e) =>
            setCtaVariant(Number(e.target.value) as 1 | 2 | 3 | 4)
          }
          className="w-full px-3 py-2 border rounded text-black mb-4"
        >
          <option value={1}>Variant 1 — Centered Layout</option>
          <option value={2}>Variant 2 — Left Aligned (Right Image)</option>
          <option value={3}>Variant 3 — Right Aligned (Left Image)</option>
          <option value={4}>Variant 4 — Full Background Image</option>
        </select>

        {(ctaVariant === 2 || ctaVariant === 3) && (
          <div>
            <ImagePicker
              label="Side Image URL"
              value={ctaContent.sideImage || ""}
              onChange={(url) =>
                setCtaContent({ ...ctaContent, sideImage: url })
              }
              placeholder="https://..."
            />
          </div>
        )}

        {ctaVariant === 4 && (
          <div>
            <ImagePicker
              label="Background Image URL"
              value={ctaContent.backgroundImage || ""}
              onChange={(url) =>
                setCtaContent({
                  ...ctaContent,
                  backgroundImage: url,
                })
              }
              placeholder="https://..."
            />
          </div>
        )}

        <label className="block text-sm font-semibold text-black">
          Headline
        </label>
        <input
          type="text"
          value={ctaContent.headline}
          onChange={(e) =>
            setCtaContent({ ...ctaContent, headline: e.target.value })
          }
          className="w-full px-3 py-2 border rounded text-black"
        />
        <label className="block text-sm font-semibold text-black">
          Subtext
        </label>
        <textarea
          value={ctaContent.subtext}
          onChange={(e) =>
            setCtaContent({ ...ctaContent, subtext: e.target.value })
          }
          rows={2}
          className="w-full px-3 py-2 border rounded text-black"
        />
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-black">
              Primary Button
            </label>
            <input
              type="text"
              value={ctaContent.primaryText}
              onChange={(e) =>
                setCtaContent({ ...ctaContent, primaryText: e.target.value })
              }
              className="w-full px-3 py-2 border rounded text-black mb-2"
            />
            <label className="block text-xs font-semibold text-gray-600">
              Primary Button URL
            </label>
            <input
              type="text"
              value={ctaContent.primaryUrl || ""}
              onChange={(e) =>
                setCtaContent({ ...ctaContent, primaryUrl: e.target.value })
              }
              className="w-full px-3 py-2 border rounded text-black"
              placeholder="https://your-link.com or #"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-black">
              Secondary Button
            </label>
            <input
              type="text"
              value={ctaContent.secondaryText}
              onChange={(e) =>
                setCtaContent({ ...ctaContent, secondaryText: e.target.value })
              }
              className="w-full px-3 py-2 border rounded text-black mb-2"
            />
            <label className="block text-xs font-semibold text-gray-600">
              Secondary Button URL
            </label>
            <input
              type="text"
              value={ctaContent.secondaryUrl || ""}
              onChange={(e) =>
                setCtaContent({ ...ctaContent, secondaryUrl: e.target.value })
              }
              className="w-full px-3 py-2 border rounded text-black"
              placeholder="https://your-link.com or #"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-black">
            Secondary Button Style
          </label>
          <select
            value={ctaContent.secondaryCtaVariant || "outlined"}
            onChange={(e) =>
              setCtaContent({
                ...ctaContent,
                secondaryCtaVariant: e.target.value as
                  | "outlined"
                  | "text"
                  | "ghost",
              })
            }
            className="w-full px-3 py-2 border rounded text-black mb-4"
          >
            <option value="outlined">Outlined (Border)</option>
            <option value="text">Text Link</option>
            <option value="ghost">Ghost (Transparent)</option>
          </select>
        </div>

        {/* Live preview for CTA variants */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-black mb-2">
            Live CTA Preview
          </h4>
          <div className="border rounded overflow-hidden">
            {ctaVariant === 1 && (
              <div
                style={{
                  background: "linear-gradient(90deg,#2563eb,#6366f1)",
                  color: "white",
                  padding: "2rem",
                  textAlign: "center",
                }}
              >
                <h3 className="text-2xl font-bold mb-2">
                  {ctaContent.headline}
                </h3>
                <p className="text-sm mb-4">{ctaContent.subtext}</p>
                <div>
                  <a
                    href={ctaContent.primaryUrl || "#"}
                    style={{
                      textDecoration: "none",
                      padding: ".75rem 1.5rem",
                      background: "white",
                      color: "#2563eb",
                      marginRight: ".5rem",
                      display: "inline-block",
                      borderRadius: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    {ctaContent.primaryText}
                  </a>
                  <a
                    href={ctaContent.secondaryUrl || "#"}
                    style={getSecondaryCtaStyle(
                      ctaContent.secondaryCtaVariant || "outlined",
                      true
                    )}
                  >
                    {ctaContent.secondaryText}
                  </a>
                </div>
              </div>
            )}

            {ctaVariant === 2 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "2rem",
                  background: "#f8f9fa",
                  padding: "2rem",
                }}
              >
                <div style={{ flex: 0.5, minWidth: "0" }}>
                  <img
                    src={
                      ctaContent.sideImage ||
                      "https://images.unsplash.com/photo-1460925895917-adf4e11526ab?w=500&h=400&fit=crop"
                    }
                    alt="side"
                    style={{
                      width: "100%",
                      height: "300px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </div>
                <div style={{ flex: 0.5 }}>
                  <h3
                    className="text-2xl font-bold mb-2"
                    style={{ color: "#111" }}
                  >
                    {ctaContent.headline}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: "#666" }}>
                    {ctaContent.subtext}
                  </p>
                  <div>
                    <a
                      href={ctaContent.primaryUrl || "#"}
                      style={{
                        textDecoration: "none",
                        padding: ".75rem 1.5rem",
                        background: "#2563eb",
                        color: "white",
                        marginRight: ".5rem",
                        display: "inline-block",
                        borderRadius: "6px",
                        fontWeight: "bold",
                      }}
                    >
                      {ctaContent.primaryText}
                    </a>
                    <a
                      href={ctaContent.secondaryUrl || "#"}
                      style={getSecondaryCtaStyle(
                        ctaContent.secondaryCtaVariant || "outlined",
                        false
                      )}
                    >
                      {ctaContent.secondaryText}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {ctaVariant === 3 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "2rem",
                  background: "white",
                  padding: "2rem",
                }}
              >
                <div style={{ flex: 0.5 }}>
                  <h3
                    className="text-2xl font-bold mb-2"
                    style={{ color: "#111" }}
                  >
                    {ctaContent.headline}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: "#666" }}>
                    {ctaContent.subtext}
                  </p>
                  <div>
                    <a
                      href={ctaContent.primaryUrl || "#"}
                      style={{
                        textDecoration: "none",
                        padding: ".75rem 1.5rem",
                        background: "#2563eb",
                        color: "white",
                        marginRight: ".5rem",
                        display: "inline-block",
                        borderRadius: "6px",
                        fontWeight: "bold",
                      }}
                    >
                      {ctaContent.primaryText}
                    </a>
                    <a
                      href={ctaContent.secondaryUrl || "#"}
                      style={getSecondaryCtaStyle(
                        ctaContent.secondaryCtaVariant || "outlined",
                        false
                      )}
                    >
                      {ctaContent.secondaryText}
                    </a>
                  </div>
                </div>
                <div style={{ flex: 0.5, minWidth: "0" }}>
                  <img
                    src={
                      ctaContent.sideImage ||
                      "https://images.unsplash.com/photo-1460925895917-adf4e11526ab?w=500&h=400&fit=crop"
                    }
                    alt="side"
                    style={{
                      width: "100%",
                      height: "300px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              </div>
            )}

            {ctaVariant === 4 && (
              <div
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.4)),url('${
                    ctaContent.backgroundImage ||
                    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop"
                  }')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  color: "white",
                  padding: "3rem 2rem",
                  textAlign: "center",
                  minHeight: "300px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ maxWidth: "800px" }}>
                  <h3 className="text-2xl font-bold mb-2">
                    {ctaContent.headline}
                  </h3>
                  <p className="text-sm mb-4">{ctaContent.subtext}</p>
                  <div>
                    <a
                      href={ctaContent.primaryUrl || "#"}
                      style={{
                        textDecoration: "none",
                        padding: ".75rem 1.5rem",
                        background: "white",
                        color: "#2563eb",
                        marginRight: ".5rem",
                        display: "inline-block",
                        borderRadius: "6px",
                        fontWeight: "bold",
                      }}
                    >
                      {ctaContent.primaryText}
                    </a>
                    <a
                      href={ctaContent.secondaryUrl || "#"}
                      style={getSecondaryCtaStyle(
                        ctaContent.secondaryCtaVariant || "outlined",
                        true
                      )}
                    >
                      {ctaContent.secondaryText}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
