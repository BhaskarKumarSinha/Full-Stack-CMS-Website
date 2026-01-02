import { useEffect } from "react";
import api from "../api/api";

export function useSiteFont() {
  useEffect(() => {
    (async () => {
      try {
        const res = await api.getSiteConfig();
        const fontFamily = res.data?.fontFamily || "Roboto";

        // Apply font to document root
        document.documentElement.style.fontFamily = fontFamily;

        // Also set CSS variable for use in components
        document.documentElement.style.setProperty(
          "--site-font-family",
          fontFamily
        );
      } catch (err) {
        console.error("Failed to load site font:", err);
        // Default to Roboto if load fails
        document.documentElement.style.fontFamily = "Roboto";
      }
    })();
  }, []);
}
