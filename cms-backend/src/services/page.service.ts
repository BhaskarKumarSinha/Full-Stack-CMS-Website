// src/services/page.service.ts
import PageModel, { IPage, Block } from "../models/Page";
import PageVersionModel from "../models/PageVersion";
import SiteConfig from "../models/SiteConfig";
import config from "../config";
import logger from "../utils/logger";
import redis from "../utils/redis";
import { z, ZodError } from "zod";
import mongoose from "mongoose";

const CACHE_TTL_SECONDS = 60 * 5; // 5 minutes for published page JSON

function escapeHtmlString(str: any) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const blockSchema = z.object({
  type: z.string().min(1),
  props: z.any().optional().default({}),
});
export type BlockInput = z.infer<typeof blockSchema>;

export const pageCreateSchema = z.object({
  slug: z.string().min(1),
  path: z.string().min(1),
  title: z.string().optional(),
  status: z.enum(["draft", "published"]).optional().default("draft"),
  layout: z.array(blockSchema).optional().default([]),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
    })
    .optional(),
});
export type PageCreateInput = z.infer<typeof pageCreateSchema>;

function validateLayout(layout: Block[]) {
  if (!Array.isArray(layout))
    throw { status: 400, message: "layout must be an array" };
  const errors: string[] = [];
  layout.forEach((b, i) => {
    try {
      blockSchema.parse(b);
    } catch (err: any) {
      if (err && err.name === "ZodError" && Array.isArray(err.errors)) {
        const msgs = err.errors.map((e: any) => {
          const path =
            Array.isArray(e.path) && e.path.length ? e.path.join(".") : "";
          return path ? `${path}: ${e.message}` : e.message;
        });
        errors.push(`Block ${i}: ${msgs.join("; ")}`);
      } else {
        const msg = err && err.message ? err.message : String(err);
        errors.push(`Block ${i}: ${msg}`);
      }
    }
  });
  if (errors.length)
    throw { status: 400, message: `Invalid layout: ${errors.join(" | ")}` };
}

export async function createPage(input: PageCreateInput, createdBy?: string) {
  if (!input || typeof input !== "object")
    throw { status: 400, message: "Invalid input" };
  if (!input.slug || !input.path)
    throw { status: 400, message: "slug and path are required" };
  if (input.layout) validateLayout(input.layout as any);
  const existing = await PageModel.findOne({ path: input.path });
  if (existing) throw { status: 400, message: "Path already exists" };

  const page = new PageModel({
    slug: input.slug,
    path: input.path,
    title: input.title,
    status: input.status ?? "draft",
    layout: input.layout ?? [],
    content: input.content, // Store the full HTML content
    seo: input.seo,
    createdBy,
  });
  await page.save();

  if (page.status === "published") {
    await cachePublishedPage(page);
    // Create a version for initial publish
    await createPageVersion(page._id, createdBy, "Initial publish");
  }

  return page;
}

export async function updatePage(
  pageId: string,
  input: Partial<PageCreateInput>,
  updatedBy?: string
) {
  if (!input || typeof input !== "object")
    throw { status: 400, message: "Invalid input" };
  if (input.layout) validateLayout(input.layout as any);
  const page = await PageModel.findById(pageId);
  if (!page) throw { status: 404, message: "Page not found" };

  if (input.slug !== undefined) page.slug = input.slug;
  if (input.path !== undefined) page.path = input.path;
  if (input.title !== undefined) page.title = input.title;
  if (input.status !== undefined) page.status = input.status as any;
  if (input.layout !== undefined) page.layout = input.layout as any;
  if (input.content !== undefined) page.content = input.content; // Update content field
  if (input.seo !== undefined) page.seo = input.seo as any;
  page.updatedBy = updatedBy as any;

  await page.save();

  if (page.status === "published") {
    await cachePublishedPage(page);
  } else {
    await invalidatePageCache(page.path);
  }

  return page;
}

/**
 * Publish page + create PageVersion snapshot
 */
export async function publishPage(pageId: string, publishedBy?: string) {
  const page = await PageModel.findById(pageId);
  if (!page) throw { status: 404, message: "Page not found" };

  page.status = "published";
  page.publishedAt = new Date();
  page.updatedBy = publishedBy as any;
  await page.save();

  await cachePublishedPage(page);

  // create version snapshot
  await createPageVersion(page._id, publishedBy, "Published");

  return page;
}

/**
 * Create a PageVersion snapshot with incrementing versionNumber.
 */
export async function createPageVersion(
  pageId: mongoose.Types.ObjectId | string,
  createdBy?: string,
  note?: string
) {
  const page = await PageModel.findById(pageId).lean();
  if (!page) throw { status: 404, message: "Page not found for versioning" };

  // determine next version number
  const last = await PageVersionModel.findOne({ pageId: page._id })
    .sort({ versionNumber: -1 })
    .lean();
  const nextVersion = last ? last.versionNumber + 1 : 1;

  const version = new PageVersionModel({
    pageId: page._id,
    versionNumber: nextVersion,
    snapshot: page,
    createdBy,
    note,
  });
  await version.save();
  logger.info("Created PageVersion %d for page %s", nextVersion, page.path);
  return version;
}

/**
 * List versions for a page
 */
export async function listPageVersions(
  pageId: string,
  { skip = 0, limit = 50 } = {}
) {
  const versions = await PageVersionModel.find({ pageId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  return versions.map((v: any) => ({
    id: v._id.toString(),
    versionNumber: v.versionNumber,
    note: v.note,
    createdBy: v.createdBy,
    createdAt: v.createdAt,
  }));
}

/**
 * Restore a page from a version
 */
export async function restorePageFromVersion(
  pageId: string,
  versionId: string,
  restoredBy?: string
) {
  const version = await PageVersionModel.findById(versionId).lean();
  if (!version) throw { status: 404, message: "Version not found" };
  if (version.pageId.toString() !== pageId)
    throw { status: 400, message: "Version does not belong to page" };

  // snapshot contains the page fields; perform a safe restore (slug, path, title, layout, seo)
  const snapshot = version.snapshot;
  const page = await PageModel.findById(pageId);
  if (!page) throw { status: 404, message: "Page not found" };

  page.slug = snapshot.slug;
  page.path = snapshot.path;
  page.title = snapshot.title;
  page.layout = snapshot.layout;
  page.seo = snapshot.seo;
  page.status = snapshot.status;
  page.updatedBy = restoredBy as any;
  await page.save();

  // create a new version noting the restore action
  await createPageVersion(
    page._id,
    restoredBy,
    `Restored from version ${version.versionNumber}`
  );

  // refresh cache if published
  if (page.status === "published") {
    await cachePublishedPage(page);
  } else {
    await invalidatePageCache(page.path);
  }

  return page;
}

/* caching helpers (unchanged) */

async function cachePublishedPage(page: IPage) {
  try {
    const key = cacheKeyForPath(page.path);
    // Ensure we cache the final injected HTML (with nav/footer) instead of
    // the raw stored page.content. Call getPageByPath with includeDrafts=true
    // to bypass reading from cache and build the injected content fresh.
    let cachedContent = sanitizeContent(page.content || "");
    try {
      const injected = await getPageByPath(page.path, true);
      if (injected && injected.content) cachedContent = injected.content;
    } catch (innerErr) {
      // Non-fatal: fall back to sanitized stored content
      logger &&
        logger.warn &&
        logger.warn(
          "cachePublishedPage: failed to build injected content for %s: %o",
          page.path,
          innerErr
        );
    }

    const payload = JSON.stringify({
      id: page._id.toString(),
      path: page.path,
      slug: page.slug,
      title: page.title,
      content: cachedContent,
      layout: page.layout,
      seo: page.seo,
      publishedAt: page.publishedAt,
    });
    await redis.set(key, payload, CACHE_TTL_SECONDS);
    logger.info("Cached published page: %s", page.path);
  } catch (err) {
    logger.warn("Failed to cache page %s: %o", page.path, err);
  }
}

export async function invalidatePageCache(path: string) {
  try {
    const key = cacheKeyForPath(path);
    await redis.del(key);
    logger.info("Invalidated cache for path %s", path);
  } catch (err) {
    logger.warn("Failed to invalidate cache for %s: %o", path, err);
  }
}

function cacheKeyForPath(path: string) {
  const p = normalizePathForCache(path);
  return `page:byPath:${p}`;
}

function normalizePathForCache(path: string) {
  if (!path) return "/";
  let p = String(path || "").trim();
  if (!p.startsWith("/")) p = "/" + p;
  return p.toLowerCase();
}

function sanitizeContent(content: string): string {
  if (!content) return "";
  // Remove legacy nav sign-in/signup button blocks if they exist
  return content.replace(/<button class="nav-btn">.*?<\/button>/gs, "");
}

export async function getPageByPath(path: string, includeDrafts = false) {
  if (!includeDrafts) {
    const key = cacheKeyForPath(path);
    try {
      const cached = await redis.get(key);
      if (cached) {
        logger.debug("Page cache hit for %s", path);
        const parsed = JSON.parse(cached);
        parsed.content = sanitizeContent(parsed.content || "");
        return parsed;
      }
    } catch (err) {
      logger.warn("Cache get error for %s: %o", path, err);
    }
  }

  // Use case-insensitive regex for path matching
  const query: any = { path: new RegExp(`^${path}$`, "i") };
  if (!includeDrafts) query.status = "published";
  const page = await PageModel.findOne(query).lean();
  if (!page) return null;

  let sanitizedContent = sanitizeContent(page.content || "");

  // Inject current global navigation into the page content so site-wide nav changes
  // apply immediately without needing to re-save every page. We look for a <nav class="nav">...</nav>
  // block in the stored HTML and replace it with a freshly generated nav based on SiteConfig.
  try {
    const cfg = await SiteConfig.findOne().lean();
    if (cfg && cfg.navConfig) {
      const nav = cfg.navConfig;
      const renderNavItems = (items: any[] | undefined) => {
        if (!items || items.length === 0) return "";
        return items
          .map((item) => {
            const href = item.href || "#";
            if (item.children && item.children.length) {
              const childrenHtml = item.children
                .map(
                  (ch: any) =>
                    `<a href="${escapeHtmlString(
                      ch.href || "#"
                    )}" class="dropdown-link">${escapeHtmlString(ch.label)}</a>`
                )
                .join("");
              return `<div class="nav-item has-dropdown"><a href="${escapeHtmlString(
                href
              )}" class="dropdown-toggle">${escapeHtmlString(
                item.label
              )}</a><div class="dropdown-menu">${childrenHtml}</div></div>`;
            }
            return `<a href="${escapeHtmlString(href)}">${escapeHtmlString(
              item.label
            )}</a>`;
          })
          .join("");
      };

      const ns = nav.navStyle || {};
      const navBg = ns.backgroundColor || "#ffffff";
      const navText = ns.textColor || "#0f172a";
      const navHoverBg = ns.hoverBackground || "#f8fafc";
      const navHoverText = ns.hoverTextColor || "#0f172a";
      const activeChildBg = ns.activeChildBackground || navHoverBg; // Active/hover background for child menu items
      const hoverEffect = ns.hoverEffect || "underline";
      const navEffectUnderline =
        hoverEffect === "underline" || hoverEffect === "underline-and-bg";
      const bgOnHover =
        hoverEffect === "background" || hoverEffect === "underline-and-bg";
      const navTextChangeOnHover =
        hoverEffect === "text-color" || hoverEffect === "underline-and-bg";
      const underlineColor = ns.underlineColor || "#2563eb";
      const underlineThickness =
        typeof ns.underlineThickness === "number" ? ns.underlineThickness : 1;
      const underlineTransitionMs =
        typeof ns.underlineTransitionMs === "number"
          ? ns.underlineTransitionMs
          : 220;
      const underlineDelayMs =
        typeof ns.underlineDelayMs === "number" ? ns.underlineDelayMs : 50;

      // Generate unique ID for this nav instance
      const navId = `site-nav-${Math.random().toString(36).slice(2, 8)}`;

      const navHtml = `
<nav id="${navId}" class="site-nav" data-open="false" style="background: ${escapeHtmlString(
        navBg
      )};">
  <style>
    /* Base nav layout */
    #${navId}.site-nav { position: sticky; top: 0; z-index: 1200; width: 100%; background: ${escapeHtmlString(
        navBg
      )}; box-shadow: 0 1px 6px rgba(2,6,23,0.06); padding: 0.75rem; }
    #${navId} .nav-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
    #${navId} .nav-left { display: flex; align-items: center; gap: 0.75rem; }
    #${navId} .nav-logo { width: 40px; height: 40px; object-fit: cover; border-radius: 6px; display: block; }
    #${navId} .nav-brand-text { font-weight: 700; color: ${escapeHtmlString(
        navText
      )}; font-size: 1.05rem; line-height: 1; }
    #${navId} .nav-toggle { display: none; background: none; border: none; font-size: 1.25rem; cursor: pointer; color: ${escapeHtmlString(
        navText
      )}; }

    /* Links container */
    #${navId} .nav-links { display: flex; align-items: center; }
    #${navId} .nav-links-inner { display: flex; align-items: center; gap: 0.5rem; }

    /* Top-level link styling */
    #${navId} .nav-links-inner > a, #${navId} .nav-links-inner .dropdown-toggle { 
      padding: 0.5rem 0.75rem; 
      border-radius: 8px; 
      color: ${escapeHtmlString(navText)}; 
      background: ${escapeHtmlString(navBg)};
      text-decoration: none; 
      font-weight: 500; 
      line-height: 1; 
      position: relative; 
      cursor: pointer; 
    }
    #${navId} .nav-links-inner > a:hover, #${navId} .nav-links-inner .dropdown-toggle:hover { 
      background: ${escapeHtmlString(bgOnHover ? navHoverBg : navBg)}; 
      color: ${escapeHtmlString(
        navTextChangeOnHover ? navHoverText : navText
      )}; 
    }

    /* Underline effect */
    #${navId} .nav-links-inner > a::after, #${navId} .nav-links-inner .dropdown-toggle::after {
      content: "";
      position: absolute;
      left: 8px; right: 8px; bottom: 2px;
      height: ${
        navEffectUnderline
          ? escapeHtmlString(String(underlineThickness) + "px")
          : "0px"
      };
      background: ${escapeHtmlString(underlineColor)};
      transform: scaleX(0);
      transform-origin: left;
      transition: transform ${escapeHtmlString(
        String(underlineTransitionMs)
      )}ms cubic-bezier(0.2,0.8,0.2,1) ${escapeHtmlString(
        String(underlineDelayMs)
      )}ms;
      border-radius: 2px;
      pointer-events: none;
    }
    #${navId} .nav-links-inner > a:hover::after, #${navId} .nav-links-inner .dropdown-toggle:hover::after { transform: scaleX(1); }

    /* Dropdown container */
    #${navId} .nav-item { position: relative; display: flex; flex-direction: column; }
    #${navId} .dropdown-menu { 
      position: absolute; 
      top: calc(100% + 6px); 
      left: 0; 
      display: none; 
      flex-direction: column;
      background: ${escapeHtmlString(navBg)}; 
      padding: 0.25rem 0; 
      border-radius: 8px; 
      box-shadow: 0 8px 24px rgba(2,6,23,0.12); 
      min-width: 12rem; 
      z-index: 2000; 
    }
    #${navId} .nav-item:hover > .dropdown-menu { display: flex; }
    #${navId} .nav-item[data-open="true"] > .dropdown-menu { display: flex !important; }
    
    /* Child menu links - same styling as parent */
    #${navId} .dropdown-menu .dropdown-link { 
      display: block; 
      padding: 0.6rem 1rem; 
      color: ${escapeHtmlString(navText)}; 
      background: ${escapeHtmlString(navBg)};
      text-decoration: none; 
      white-space: nowrap;
      font-weight: 500;
    }
    #${navId} .dropdown-menu .dropdown-link:hover { 
      background: ${escapeHtmlString(activeChildBg)}; 
      color: ${escapeHtmlString(
        navTextChangeOnHover ? navHoverText : navText
      )}; 
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      #${navId} .nav-toggle { display: block; }
      #${navId} .nav-links { 
        position: fixed; 
        top: 64px; 
        right: 12px; 
        background: ${escapeHtmlString(navBg)}; 
        box-shadow: 0 8px 24px rgba(2,6,23,0.12); 
        flex-direction: column; 
        padding: 0.5rem; 
        border-radius: 8px; 
        display: none; 
        min-width: 220px; 
        z-index: 1500; 
      }
      #${navId}[data-open="true"] .nav-links { display: flex; }
      #${navId} .nav-links-inner { flex-direction: column; gap: 0; width: 100%; }
      #${navId} .nav-links-inner > a, #${navId} .nav-links-inner .dropdown-toggle { 
        display: block; 
        padding: 0.75rem 1rem; 
        width: 100%; 
        text-align: left; 
        background: ${escapeHtmlString(navBg)}; 
        color: ${escapeHtmlString(navText)}; 
        border-radius: 6px;
      }
      #${navId} .nav-item { width: 100%; display: flex; flex-direction: column; }
      /* Child menu on mobile - below parent, full width, indented */
      #${navId} .dropdown-menu { 
        position: static !important; 
        top: auto !important;
        left: auto !important;
        box-shadow: none; 
        padding: 0;
        margin: 0;
        margin-left: 1rem;
        border-radius: 0;
        background: ${escapeHtmlString(navBg)}; 
        width: calc(100% - 1rem);
        border-left: 2px solid ${escapeHtmlString(navHoverBg)};
      }
      #${navId} .dropdown-menu .dropdown-link { 
        padding: 0.6rem 1rem; 
        color: ${escapeHtmlString(navText)}; 
        background: ${escapeHtmlString(navBg)};
        border-radius: 0;
      }
      #${navId} .dropdown-menu .dropdown-link:hover {
        background: ${escapeHtmlString(activeChildBg)};
        color: ${escapeHtmlString(
          navTextChangeOnHover ? navHoverText : navText
        )};
      }
    }
  </style>
  <div class="nav-inner">
    <div class="nav-left">
      ${
        nav.logoUrl
          ? `<img src="${escapeHtmlString(
              nav.logoUrl
            )}" alt="Logo" class="nav-logo" />`
          : ""
      }
      <span class="nav-brand-text">${escapeHtmlString(
        nav.brandName || ""
      )}</span>
    </div>
    <button class="nav-toggle" aria-label="Toggle navigation">☰</button>
    <div class="nav-links"><div class="nav-links-inner">${renderNavItems(
      nav.navItems || []
    )}</div></div>
  </div>
</nav>
<script>
(function(){
  try {
    var nav = document.getElementById('${navId}');
    if (!nav) return;
    var btn = nav.querySelector('.nav-toggle');
    var setOpen = function(open) {
      nav.setAttribute('data-open', open ? 'true' : 'false');
      if (btn) btn.textContent = open ? '✕' : '☰';
    };
    if (btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        setOpen(nav.getAttribute('data-open') !== 'true');
      });
    }
    // Handle dropdown clicks for touch devices
    var dropdownToggles = nav.querySelectorAll('.nav-item .dropdown-toggle');
    dropdownToggles.forEach(function(toggle) {
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var parent = toggle.parentElement;
        var isOpen = parent.getAttribute('data-open') === 'true';
        // Close all other dropdowns
        nav.querySelectorAll('.nav-item[data-open="true"]').forEach(function(item) {
          if (item !== parent) item.setAttribute('data-open', 'false');
        });
        parent.setAttribute('data-open', isOpen ? 'false' : 'true');
      });
    });
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!nav.contains(e.target)) {
        setOpen(false);
        nav.querySelectorAll('.nav-item[data-open="true"]').forEach(function(item) {
          item.setAttribute('data-open', 'false');
        });
      }
    });
    // Close on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        setOpen(false);
        nav.querySelectorAll('.nav-item[data-open="true"]').forEach(function(item) {
          item.setAttribute('data-open', 'false');
        });
      }
    });
  } catch(err) { console.warn('Nav init error:', err); }
})();
</script>`;

      // Replace first occurrence of <nav ...>...</nav> with generated navHtml
      // Match any <nav> tag regardless of attributes (class="nav", class="site-nav", id=..., etc)
      const navRegex = /<nav[^>]*>[\s\S]*?<\/nav>/i;
      if (navRegex.test(sanitizedContent)) {
        sanitizedContent = sanitizedContent.replace(navRegex, navHtml);
      } else {
        // If no nav wrapper found, prepend navHtml so pages without stored nav still get global nav
        sanitizedContent = navHtml + sanitizedContent;
      }

      // Build and inject footer. Prefer the global SiteConfig.footerConfig by
      // default. Only use a page-specific footer when the page explicitly
      // opts in by setting `seo.builderSchema.footerConfig.__perPage = true`.
      try {
        const pageFooterFromSeo =
          (page &&
            page.seo &&
            page.seo.builderSchema &&
            page.seo.builderSchema.footerConfig) ||
          null;
        // Default to site-level footer
        let fcfg = (cfg && cfg.footerConfig) || {};
        // If the page explicitly marks a per-page footer with `__perPage: true`, use it
        if (
          pageFooterFromSeo &&
          typeof pageFooterFromSeo === "object" &&
          pageFooterFromSeo.__perPage === true
        ) {
          fcfg = pageFooterFromSeo;
        }
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
            : 1;
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

        let sectionsHtml = "";
        if (footerSections.length) {
          // Build a map keyed by normalized heading and merge links to avoid duplicates
          const dedupMap: Record<string, any> = {};
          for (const s of footerSections) {
            const heading = String(s.heading || "").trim();
            const key = heading.toLowerCase();
            if (!dedupMap[key]) dedupMap[key] = { heading, links: [] };
            const existing = dedupMap[key];
            const linksArr = Array.isArray(s.links) ? s.links : [];
            for (const ln of linksArr) {
              const label =
                typeof ln === "string" ? ln : ln.label || String(ln || "");
              const href =
                typeof ln === "string"
                  ? "/" + String(ln).toLowerCase().replace(/\s+/g, "-")
                  : ln.href ||
                    "/" + String(label).toLowerCase().replace(/\s+/g, "-");
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
          const dedupedSections = Object.values(dedupMap);
          // If companyName/description provided, ensure a company/info section
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
          if (dedupedSections.length) {
            sectionsHtml = dedupedSections
              .map((sec: any) => {
                const heading = escapeHtmlString(String(sec.heading || ""));
                const linksArr = Array.isArray(sec.links) ? sec.links : [];
                if (sec.description) {
                  return `<div class="footer-section"><h4>${heading}</h4><p>${escapeHtmlString(
                    String(sec.description || "")
                  )}</p></div>`;
                }
                const linksHtml = linksArr
                  .map((ln: any) => {
                    if (!ln) return "";
                    const label = escapeHtmlString(String(ln.label || ln));
                    const href = escapeHtmlString(
                      String(
                        ln.href ||
                          "/" + String(label).toLowerCase().replace(/\s+/g, "-")
                      )
                    );
                    return `<li><a href="${href}">${label}</a></li>`;
                  })
                  .join("");
                return `<div class="footer-section"><h4>${heading}</h4><ul>${linksHtml}</ul></div>`;
              })
              .join("");
          }
        } else {
          const footerLinksArr = Array.isArray(fcfg.footerLinks)
            ? fcfg.footerLinks
            : [];
          const footerLinksHtml = footerLinksArr
            .map(
              (ln: any) =>
                `<li><a href="${escapeHtmlString(
                  String(ln)
                )}">${escapeHtmlString(String(ln))}</a></li>`
            )
            .join("");
          sectionsHtml = `
            <div class="footer-section"><h4>${escapeHtmlString(
              companyName
            )}</h4><p>${escapeHtmlString(description)}</p></div>
            <div class="footer-section"><h4>Legal</h4><ul>${footerLinksHtml}</ul></div>
          `;
        }

        const footerHtml = `
<footer class="footer">
  <style>
    .footer { background: ${escapeHtmlString(
      footerBg
    )}; color: ${escapeHtmlString(
          footerText
        )}; padding: 4rem 2rem; width: 100%; }
    .footer-content { max-width: 80rem; margin: 0 auto; width: 100%; }
    .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 3rem; margin-bottom: 2rem; }
    .footer-section h4 { color: ${escapeHtmlString(
      footerText
    )}; font-weight: bold; margin-bottom: 1rem; }
    .footer-section ul { list-style: none; padding: 0; margin: 0; }
    .footer-section a { color: ${escapeHtmlString(
      footerText
    )}; text-decoration: none; position: relative; display: inline-block; padding-bottom: 3px; }
    .footer-section a:hover { background: ${escapeHtmlString(
      footerBgOnHover ? footerHoverBg : "transparent"
    )}; color: ${escapeHtmlString(
          footerTextChangeOnHover ? footerHoverText : footerText
        )}; }
    .footer-section a::after { content: ""; position: absolute; left: 6px; right: 6px; bottom: 0px; height: ${
      footerEffectUnderline
        ? escapeHtmlString(String(footerUnderlineThickness) + "px")
        : "0px"
    }; background: ${escapeHtmlString(
          footerUnderlineColor
        )}; transform: scaleX(0); transform-origin: left; transition: transform ${escapeHtmlString(
          String(footerUnderlineTransitionMs)
        )}ms ease ${escapeHtmlString(
          String(footerUnderlineDelayMs)
        )}ms; pointer-events: none; border-radius: 2px; }
    .footer-section a:hover::after, .footer-section a.active::after { transform: scaleX(1); }
    .footer-bottom { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 2rem; text-align: center; }
  </style>
  <div class="footer-content">
    <div class="footer-grid">
      ${sectionsHtml}
    </div>
    <div class="footer-bottom">&copy; ${new Date().getFullYear()} ${escapeHtmlString(
          companyName
        )}</div>
  </div>
</footer>`;

        // Replace any existing <footer>...</footer> regardless of attributes.
        // If no footer exists, insert before </body> where possible, otherwise append.
        const footerRegex = /<footer[\s\S]*?<\/footer>/i;
        if (footerRegex.test(sanitizedContent)) {
          sanitizedContent = sanitizedContent.replace(footerRegex, footerHtml);
        } else if (/<\/body>/i.test(sanitizedContent)) {
          sanitizedContent = sanitizedContent.replace(
            /<\/body>/i,
            footerHtml + "</body>"
          );
        } else {
          // Append footerHtml when page has no footer and no </body>
          sanitizedContent = sanitizedContent + footerHtml;
        }
      } catch (err) {
        // Non-fatal: if footer injection fails, continue with content
        logger &&
          logger.warn &&
          logger.warn("Failed to inject site footer:", err);
      }
    }
  } catch (err) {
    // Non-fatal: if SiteConfig isn't available, continue with stored content
    logger && logger.warn && logger.warn("Failed to inject site nav:", err);
  }

  // Inject custom CSS if present
  if (page.customCss) {
    const customCssStyle = `<style id="custom-page-css">\n${page.customCss}\n</style>`;
    // Insert before </head> if it exists, otherwise prepend to content
    if (/<\/head>/i.test(sanitizedContent)) {
      sanitizedContent = sanitizedContent.replace(
        /<\/head>/i,
        customCssStyle + "</head>"
      );
    } else {
      sanitizedContent = customCssStyle + sanitizedContent;
    }
  }

  // Inject global font family from SiteConfig - MUST be last so it overrides everything
  try {
    const siteConfig = await SiteConfig.findOne().lean();
    const fontFamily = (siteConfig && siteConfig.fontFamily) || "Roboto";

    // Map font names to Google Fonts stack
    const fontStacks: Record<string, string> = {
      Roboto: "'Roboto', sans-serif",
      "Open Sans": "'Open Sans', sans-serif",
      Rubik: "'Rubik', sans-serif",
      "DM Sans": "'DM Sans', sans-serif",
    };

    const fontStack = fontStacks[fontFamily] || "'Roboto', sans-serif";

    const fontCss = `<style id="site-font-css">
      html, body, *, :root, :host {
        font-family: ${fontStack} !important;
      }
      :root {
        --site-font-family: ${fontStack} !important;
        --default-font-family: ${fontStack} !important;
        --font-sans: ${fontStack} !important;
      }
    </style>`;

    // Insert RIGHT BEFORE </body> closing tag as the VERY LAST thing
    // This ensures it overrides all previous font declarations
    if (/<\/body>/i.test(sanitizedContent)) {
      sanitizedContent = sanitizedContent.replace(
        /<\/body>/i,
        fontCss + "</body>"
      );
    } else if (/<\/html>/i.test(sanitizedContent)) {
      // If no body tag, insert before </html>
      sanitizedContent = sanitizedContent.replace(
        /<\/html>/i,
        fontCss + "</html>"
      );
    } else {
      // Fallback: append to end of content
      sanitizedContent = sanitizedContent + fontCss;
    }
  } catch (err) {
    // Non-fatal: if font injection fails, continue without custom font
    logger && logger.warn && logger.warn("Failed to inject site font:", err);
  }

  // Inject custom HTML if present based on position setting
  if (page.customHtml) {
    const position = page.customHtmlPosition || "start";
    const customHtmlBlock = `\n<!-- Custom HTML Start -->\n${page.customHtml}\n<!-- Custom HTML End -->\n`;

    switch (position) {
      case "end":
        // Insert before </body>
        if (/<\/body>/i.test(sanitizedContent)) {
          sanitizedContent = sanitizedContent.replace(
            /<\/body>/i,
            customHtmlBlock + "</body>"
          );
        } else {
          sanitizedContent = sanitizedContent + customHtmlBlock;
        }
        break;

      case "after-nav":
        // Insert after closing </nav> tag
        if (/<\/nav>/i.test(sanitizedContent)) {
          sanitizedContent = sanitizedContent.replace(
            /<\/nav>/i,
            "</nav>" + customHtmlBlock
          );
        } else {
          // Fallback to after <body> if no nav found
          if (/<body[^>]*>/i.test(sanitizedContent)) {
            sanitizedContent = sanitizedContent.replace(
              /(<body[^>]*>)/i,
              "$1" + customHtmlBlock
            );
          } else {
            sanitizedContent = customHtmlBlock + sanitizedContent;
          }
        }
        break;

      case "before-footer":
        // Insert before <footer> tag
        if (/<footer[^>]*>/i.test(sanitizedContent)) {
          sanitizedContent = sanitizedContent.replace(
            /(<footer[^>]*>)/i,
            customHtmlBlock + "$1"
          );
        } else {
          // Fallback to before </body> if no footer found
          if (/<\/body>/i.test(sanitizedContent)) {
            sanitizedContent = sanitizedContent.replace(
              /<\/body>/i,
              customHtmlBlock + "</body>"
            );
          } else {
            sanitizedContent = sanitizedContent + customHtmlBlock;
          }
        }
        break;

      case "after-selector":
        // Insert after a custom CSS selector (element)
        if (page.customHtmlSelector) {
          // Convert CSS selector to regex pattern for common selectors
          // Supports: #id, .class, tagname, [attribute]
          const selector = page.customHtmlSelector.trim();
          let matched = false;

          // Handle ID selector (#id)
          if (selector.startsWith("#")) {
            const id = selector.slice(1);
            const idRegex = new RegExp(
              `(<[^>]+\\sid=["']${id}["'][^>]*>)([\\s\\S]*?)(</[^>]+>)`,
              "i"
            );
            if (idRegex.test(sanitizedContent)) {
              // Find the element with this ID and insert after its closing tag
              const fullElementRegex = new RegExp(
                `(<[^>]+\\sid=["']${id}["'][^>]*>[\\s\\S]*?<\\/[^>]+>)`,
                "i"
              );
              sanitizedContent = sanitizedContent.replace(
                fullElementRegex,
                "$1" + customHtmlBlock
              );
              matched = true;
            }
          }
          // Handle class selector (.class)
          else if (selector.startsWith(".")) {
            const className = selector.slice(1);
            const classRegex = new RegExp(
              `(<[^>]+\\sclass=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>[\\s\\S]*?<\\/[^>]+>)`,
              "i"
            );
            if (classRegex.test(sanitizedContent)) {
              sanitizedContent = sanitizedContent.replace(
                classRegex,
                "$1" + customHtmlBlock
              );
              matched = true;
            }
          }
          // Handle element selector (div, section, etc.)
          else if (/^[a-zA-Z][a-zA-Z0-9]*$/.test(selector)) {
            const tagRegex = new RegExp(
              `(<${selector}[^>]*>[\\s\\S]*?<\\/${selector}>)`,
              "i"
            );
            if (tagRegex.test(sanitizedContent)) {
              sanitizedContent = sanitizedContent.replace(
                tagRegex,
                "$1" + customHtmlBlock
              );
              matched = true;
            }
          }

          // Fallback to after <body> if selector not found
          if (!matched) {
            if (/<body[^>]*>/i.test(sanitizedContent)) {
              sanitizedContent = sanitizedContent.replace(
                /(<body[^>]*>)/i,
                "$1" + customHtmlBlock
              );
            } else {
              sanitizedContent = customHtmlBlock + sanitizedContent;
            }
          }
        } else {
          // No selector provided, fallback to start
          if (/<body[^>]*>/i.test(sanitizedContent)) {
            sanitizedContent = sanitizedContent.replace(
              /(<body[^>]*>)/i,
              "$1" + customHtmlBlock
            );
          } else {
            sanitizedContent = customHtmlBlock + sanitizedContent;
          }
        }
        break;

      case "start":
      default:
        // Insert after <body> (original behavior)
        if (/<body[^>]*>/i.test(sanitizedContent)) {
          sanitizedContent = sanitizedContent.replace(
            /(<body[^>]*>)/i,
            "$1" + customHtmlBlock
          );
        } else {
          sanitizedContent = customHtmlBlock + sanitizedContent;
        }
        break;
    }
  }

  if (!includeDrafts && page.status === "published") {
    try {
      const key = cacheKeyForPath(path);
      await redis.set(
        key,
        JSON.stringify({
          id: page._id.toString(),
          path: page.path,
          slug: page.slug,
          title: page.title,
          layout: page.layout,
          content: sanitizedContent, // Include the HTML content
          seo: page.seo,
          publishedAt: page.publishedAt,
        }),
        CACHE_TTL_SECONDS
      );
    } catch (err) {
      logger.warn("Cache set failed for %s: %o", path, err);
    }
  }

  return {
    id: page._id.toString(),
    path: page.path,
    slug: page.slug,
    title: page.title,
    layout: page.layout,
    content: sanitizedContent, // Include the HTML content
    seo: page.seo,
    publishedAt: page.publishedAt,
  };
}

export async function listPages({
  status,
  skip = 0,
  limit = 20,
}: { status?: string; skip?: number; limit?: number } = {}) {
  const q: any = {};
  if (status) q.status = status;
  const pages = await PageModel.find(q)
    .skip(skip)
    .limit(limit)
    .sort({ updatedAt: -1 })
    .lean();
  return pages.map((p: any) => ({
    id: p._id.toString(),
    slug: p.slug,
    path: p.path,
    title: p.title,
    status: p.status,
    updatedAt: p.updatedAt,
  }));
}

/**
 * Delete a page by ID
 */
export async function deletePage(pageId: string) {
  const page = await PageModel.findById(pageId);
  if (!page) {
    throw { status: 404, message: "Page not found" };
  }

  // Invalidate cache before deleting
  await invalidatePageCache(page.path);

  // Delete the page
  await PageModel.findByIdAndDelete(pageId);

  // Optionally delete associated versions
  await PageVersionModel.deleteMany({ pageId });

  return { success: true, message: "Page deleted successfully" };
}
