import React, { useState } from "react";

interface ContactFormProps {
  email?: string;
  linkedin?: string;
  title?: string;
  subtitle?: string;
}

export default function ContactForm({
  email = "your@email.com",
  linkedin = "https://linkedin.com/in/yourprofile",
  title = "Get In Touch",
  subtitle = "Fill out the form and I will get back to you within 24 hours",
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        "Failed to send message. Please try again or email me directly."
      );
      console.error("Contact form error:", error);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "4rem 2rem",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "3rem",
        }}
      >
        {/* Left Side - Contact Info */}
        <div style={{ padding: "2rem" }}>
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              color: "#1f2937",
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontSize: "1.125rem",
              color: "#6b7280",
              marginBottom: "2rem",
            }}
          >
            {subtitle}
          </p>

          {/* Contact Details */}
          <div style={{ marginBottom: "2rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1.5rem",
                padding: "1rem",
                background: "#f9fafb",
                borderRadius: "0.5rem",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: "#3b82f6",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "1rem",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>📧</span>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    marginBottom: "0.25rem",
                  }}
                >
                  Email
                </p>
                <a
                  href={`mailto:${email}`}
                  style={{
                    fontSize: "1rem",
                    color: "#3b82f6",
                    textDecoration: "none",
                    fontWeight: "500",
                  }}
                >
                  {email}
                </a>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "1rem",
                background: "#f9fafb",
                borderRadius: "0.5rem",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: "#3b82f6",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "1rem",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>🔗</span>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    marginBottom: "0.25rem",
                  }}
                >
                  LinkedIn
                </p>
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "1rem",
                    color: "#3b82f6",
                    textDecoration: "none",
                    fontWeight: "500",
                  }}
                >
                  Connect with me
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "1rem",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Your Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                  color: "#1f2937",
                  backgroundColor: "white",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                  color: "#1f2937",
                  backgroundColor: "white",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+1 (234) 567-8900"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                  color: "#1f2937",
                  backgroundColor: "white",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Tell me about your project..."
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                  resize: "vertical",
                  color: "#1f2937",
                  backgroundColor: "white",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>

            {status === "success" && (
              <div
                style={{
                  padding: "1rem",
                  background: "#d1fae5",
                  color: "#065f46",
                  borderRadius: "0.5rem",
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                }}
              >
                ✓ Message sent successfully! I'll get back to you soon.
              </div>
            )}

            {status === "error" && (
              <div
                style={{
                  padding: "1rem",
                  background: "#fee2e2",
                  color: "#991b1b",
                  borderRadius: "0.5rem",
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                }}
              >
                ✕ {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                width: "100%",
                padding: "1rem",
                background: status === "loading" ? "#9ca3af" : "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: status === "loading" ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (status !== "loading") {
                  (e.target as HTMLButtonElement).style.background = "#2563eb";
                }
              }}
              onMouseLeave={(e) => {
                if (status !== "loading") {
                  (e.target as HTMLButtonElement).style.background = "#3b82f6";
                }
              }}
            >
              {status === "loading" ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
