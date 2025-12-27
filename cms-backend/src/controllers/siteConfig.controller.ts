import { Request, Response } from "express";
import SiteConfig from "../models/SiteConfig";
import * as pageService from "../services/page.service";
import { escape } from "lodash";
import logger from "../utils/logger";

// GET /api/site-config
export async function getSiteConfig(req: Request, res: Response) {
  try {
    let config = await SiteConfig.findOne();
    if (!config) {
      // Create default config if not exists
      config = await SiteConfig.create({
        navConfig: {
          brandName: "MySite",
          navItems: [
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
            { label: "Contact", href: "/contact" },
          ],
          navStyle: {
            backgroundColor: "#ffffff",
            textColor: "#0f172a",
            hoverBackground: "#f8fafc",
            hoverTextColor: "#0f172a",
            hoverEffect: "underline",
            underlineColor: "#2563eb",
            underlineThickness: 1,
            underlineTransitionMs: 220,
            underlineDelayMs: 50,
          },
        },
        footerConfig: {
          companyName: "MySite",
          footerLinks: ["Privacy", "Terms"],
          footerSections: [
            {
              heading: "Company",
              links: [
                { label: "About", href: "/about" },
                { label: "Careers", href: "/careers" },
              ],
            },
            {
              heading: "Product",
              links: [
                { label: "Features", href: "/features" },
                { label: "Pricing", href: "/pricing" },
              ],
            },
            {
              heading: "Resources",
              links: [
                { label: "Blog", href: "/blog" },
                { label: "Docs", href: "/docs" },
              ],
            },
            {
              heading: "Legal",
              links: [
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
              ],
            },
          ],
          footerStyle: {
            backgroundColor: "#111827",
            textColor: "#d1d5db",
            hoverBackground: "#111827",
            hoverTextColor: "#ffffff",
            hoverEffect: "background",
            underlineColor: "#2563eb",
            underlineThickness: 1,
            underlineTransitionMs: 220,
            underlineDelayMs: 50,
          },
        },
      });
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: "Failed to get site config", error: err });
  }
}

// PUT /api/site-config
export async function updateSiteConfig(req: Request, res: Response) {
  try {
    const { navConfig, footerConfig } = req.body;
    let config = await SiteConfig.findOne();
    if (!config) {
      config = await SiteConfig.create({ navConfig, footerConfig });
    } else {
      // Merge fields to avoid dropping navStyle or other nested props
      config.navConfig = { ...(config.navConfig || {}), ...(navConfig || {}) };
      // ensure navStyle remains merged
      config.navConfig.navStyle = {
        ...(config.navConfig?.navStyle || {}),
        ...((navConfig && navConfig.navStyle) || {}),
      };
      config.footerConfig = {
        ...(config.footerConfig || {}),
        ...(footerConfig || {}),
      };
      // ensure footerStyle remains merged
      config.footerConfig.footerStyle = {
        ...(config.footerConfig?.footerStyle || {}),
        ...((footerConfig && footerConfig.footerStyle) || {}),
      };
      // If the incoming update contains structured footerSections, replace them
      if (footerConfig && Array.isArray(footerConfig.footerSections)) {
        config.footerConfig.footerSections = footerConfig.footerSections;
      }
      config.updatedAt = new Date();
      await config.save();
      console.debug(
        "siteConfig.controller: updateSiteConfig saved config id=",
        config._id && config._id.toString ? config._id.toString() : config
      );
    }

    // Invalidate cached published pages so they pick up new site config
    try {
      const pages = await pageService.listPages({
        status: "published",
        limit: 10000,
      });
      for (const p of pages.items || pages) {
        const path = (p.path || p).toString?.();
        if (path) await pageService.invalidatePageCache(path);
      }
    } catch (err) {
      // non-fatal
      console.warn(
        "Failed to invalidate page caches after site config update:",
        err
      );
    }
    // Re-warm published page caches synchronously so updates are visible
    // immediately after saving SiteConfig. This may take time on large
    // sites but avoids requiring manual page re-saves.
    try {
      console.debug(
        "siteConfig.controller: starting synchronous cache re-warm"
      );
      const pages = await pageService.listPages({
        status: "published",
        limit: 10000,
      });
      let warmed = 0;
      for (const p of pages || []) {
        const path = (p && (p.path || p))?.toString?.() || (p && p.path);
        if (!path) continue;
        try {
          await pageService.invalidatePageCache(path);
          // getPageByPath will rebuild the injected content and set the cache
          await pageService.getPageByPath(path, false);
          warmed++;
        } catch (innerErr) {
          console.warn(
            "siteConfig.controller: failed to warm page %s: %o",
            path,
            innerErr
          );
        }
      }
      console.debug(
        "siteConfig.controller: synchronous cache re-warm complete, warmed=%d",
        warmed
      );
    } catch (bgErr) {
      console.warn(
        "siteConfig.controller: synchronous cache re-warm failed:",
        bgErr
      );
    }
    res.json(config);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update site config", error: err });
  }
}

// GET /api/site-config/render-footer
export async function renderFooter(req: Request, res: Response) {
  try {
    const cfg = await SiteConfig.findOne().lean();
    console.debug(
      "siteConfig.controller: renderFooter using cfg:",
      !!cfg,
      cfg && cfg.footerConfig
        ? {
            footerSectionsLength: (cfg.footerConfig.footerSections || [])
              .length,
          }
        : {}
    );
    const fcfg = (cfg && cfg.footerConfig) || {};
    const companyName = fcfg.companyName || "";
    const description = fcfg.description || "";
    const fstyle = fcfg.footerStyle || {};
    const footerBg = fstyle.backgroundColor || "#111827";
    const footerText = fstyle.textColor || "#d1d5db";
    const footerHoverBg = fstyle.hoverBackground || "#111827";
    const footerHoverText = fstyle.hoverTextColor || "#ffffff";
    const footerHoverEffect = fstyle.hoverEffect || "background";
    const footerUnderlineColor = fstyle.underlineColor || "#2563eb";
    const footerUnderlineThickness =
      typeof fstyle.underlineThickness === "number"
        ? fstyle.underlineThickness
        : 2;
    const footerUnderlineTransitionMs =
      typeof fstyle.underlineTransitionMs === "number"
        ? fstyle.underlineTransitionMs
        : 220;
    const footerUnderlineDelayMs =
      typeof fstyle.underlineDelayMs === "number"
        ? fstyle.underlineDelayMs
        : 50;
    const footerEffectUnderline =
      footerHoverEffect === "underline" ||
      footerHoverEffect === "underline-and-bg";
    const footerBgOnHover =
      footerHoverEffect === "background" ||
      footerHoverEffect === "underline-and-bg";
    const footerTextChangeOnHover =
      footerHoverEffect === "text-color" ||
      footerHoverEffect === "underline-and-bg";

    const footerSections = Array.isArray(fcfg.footerSections)
      ? fcfg.footerSections
      : [];
    // Deduplicate sections by normalized heading, merging links to avoid duplicates
    const dedupedSectionsMap: Record<string, any> = {};
    for (const sec of footerSections) {
      const heading = String(sec.heading || "").trim();
      const key = heading.toLowerCase();
      if (!dedupedSectionsMap[key]) {
        dedupedSectionsMap[key] = { heading, links: [] };
      }
      const existing = dedupedSectionsMap[key];
      const linksArr = Array.isArray(sec.links) ? sec.links : [];
      for (const ln of linksArr) {
        const label =
          typeof ln === "string" ? ln : ln.label || String(ln || "");
        const href =
          typeof ln === "string"
            ? "/" + String(ln).toLowerCase().replace(/\s+/g, "-")
            : ln.href || "/" + String(label).toLowerCase().replace(/\s+/g, "-");
        // avoid exact duplicates
        if (
          !existing.links.some(
            (l: any) =>
              String(l.label) === String(label) &&
              String(l.href) === String(href)
          )
        ) {
          existing.links.push({ label, href });
        }
      }
    }
    const dedupedSections = Object.values(dedupedSectionsMap);

    // If companyName/description provided, ensure a company/info section when not present
    const hasCompany = dedupedSections.some(
      (d: any) =>
        String(d.heading || "")
          .toLowerCase()
          .trim() === "company"
    );
    if ((companyName || description) && !hasCompany) {
      dedupedSections.unshift({
        heading: companyName || "Company",
        description,
        links: [],
      });
    }

    let sectionsHtml = "";
    if (dedupedSections.length) {
      sectionsHtml = dedupedSections
        .map((sec: any) => {
          const heading = escape(String(sec.heading || ""));
          const linksArr = Array.isArray(sec.links) ? sec.links : [];
          if (sec.description) {
            return `<div class=\"footer-section\"><h4>${heading}</h4><p>${escape(
              String(sec.description || "")
            )}</p></div>`;
          }
          const linksHtml = linksArr
            .map((ln: any) => {
              if (!ln) return "";
              if (typeof ln === "string") {
                const label = escape(String(ln));
                const href = escape(String(ln))
                  .toLowerCase()
                  .replace(/\s+/g, "-");
                return `<li><a href=\"${href}\">${label}</a></li>`;
              }
              const label = escape(String(ln.label || ln));
              const href = escape(
                String(
                  ln.href ||
                    "/" + String(label).toLowerCase().replace(/\s+/g, "-")
                )
              );
              return `<li><a href=\"${href}\">${label}</a></li>`;
            })
            .join("");
          return `<div class=\"footer-section\"><h4>${heading}</h4><ul>${linksHtml}</ul></div>`;
        })
        .join("");
    } else {
      const footerLinksArr = Array.isArray(fcfg.footerLinks)
        ? fcfg.footerLinks
        : [];
      const footerLinksHtml = footerLinksArr
        .map(
          (ln: any) =>
            `<li><a href="${escape(String(ln))}">${escape(String(ln))}</a></li>`
        )
        .join("");
      sectionsHtml = `
        <div class=\"footer-section\"><h4>${escape(
          companyName
        )}</h4><p>${escape(description)}</p></div>
        <div class=\"footer-section\"><h4>Legal</h4><ul>${footerLinksHtml}</ul></div>
      `;
    }

    const footerHtml = `
<footer class="footer">
  <style>
    .footer { background: ${escape(footerBg)}; color: ${escape(
      footerText
    )}; padding: 4rem 2rem; width: 100%; }
    .footer-content { max-width: 80rem; margin: 0 auto; width: 100%; }
    .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 3rem; margin-bottom: 2rem; }
    .footer-section h4 { color: ${escape(
      footerText
    )}; font-weight: bold; margin-bottom: 1rem; }
    .footer-section ul { list-style: none; padding: 0; margin: 0; }
    .footer-section a { color: ${escape(
      footerText
    )}; text-decoration: none; position: relative; display: inline-block; padding-bottom: 3px; }
    .footer-section a:hover { background: ${escape(
      footerBgOnHover ? footerHoverBg : "transparent"
    )}; color: ${escape(
      footerTextChangeOnHover ? footerHoverText : footerText
    )}; }
    .footer-section a::after { content: ""; position: absolute; left: 6px; right: 6px; bottom: 0px; height: ${
      footerEffectUnderline
        ? escape(String(footerUnderlineThickness) + "px")
        : "0px"
    }; background: ${escape(
      footerUnderlineColor
    )}; transform: scaleX(0); transform-origin: left; transition: transform ${escape(
      String(footerUnderlineTransitionMs)
    )}ms ease ${escape(
      String(footerUnderlineDelayMs)
    )}ms; pointer-events: none; border-radius: 2px; }
    .footer-section a:hover::after, .footer-section a.active::after { transform: scaleX(1); }
    .footer-bottom { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 2rem; text-align: center; }
  </style>
  <div class="footer-content">
    <div class="footer-grid">
      ${sectionsHtml}
    </div>
    <div class="footer-bottom">&copy; ${new Date().getFullYear()} ${escape(
      companyName
    )}</div>
  </div>
</footer>`;

    res.json({ html: footerHtml });
  } catch (err) {
    res.status(500).json({ message: "Failed to render footer", error: err });
  }
}

// POST /api/site-config/refresh-pages
export async function refreshPublishedPages(req: Request, res: Response) {
  try {
    const pages = await pageService.listPages({
      status: "published",
      limit: 10000,
    });
    let refreshed = 0;
    for (const p of pages) {
      const path = (p && (p.path || p))?.toString?.() || p.path;
      if (!path) continue;
      try {
        console.debug("siteConfig.controller: refreshing page:", path);
        await pageService.invalidatePageCache(path);
        // Warm cache by fetching the page (getPageByPath will re-cache it)
        await pageService.getPageByPath(path, false);
        refreshed++;
      } catch (err) {
        logger &&
          logger.warn &&
          logger.warn("Failed to refresh page %s: %o", path, err);
      }
    }
    res.json({ refreshed });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to refresh published pages", error: err });
  }
}
