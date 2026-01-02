/**
 * @file api/api.tsx
 * @description Centralized API Client Configuration
 *
 * This module provides a configured Axios instance for all API calls:
 *
 * @features
 * - Base URL configuration from environment variable
 * - Automatic JWT token injection for authenticated requests
 * - Response interceptor for handling 401 (token expiration)
 * - Centralized endpoint definitions
 *
 * @authentication
 * The request interceptor automatically:
 * 1. Retrieves JWT token from localStorage ('cms_token')
 * 2. Adds Authorization header if token exists
 * 3. Logs token status for debugging
 *
 * @error-handling
 * The response interceptor handles:
 * - 401 errors: Clears token and redirects to login
 * - Other errors: Passes through for component handling
 *
 * @environment
 * Set VITE_API_BASE in .env file:
 * VITE_API_BASE=http://localhost:4000
 *
 * @usage
 * import api from './api/api';
 * const response = await api.getPages();
 * const page = await api.getPageById('pageId');
 */

import axios from "axios";

/** API base URL from environment or default to localhost */
const API_BASE =
  (import.meta.env.VITE_API_BASE as string) || "http://localhost:4000";

/**
 * Configured Axios instance with base URL and default headers
 * All API calls should use this client for consistency
 */
const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

/**
 * Request Interceptor
 * Automatically adds JWT token to all outgoing requests
 */
client.interceptors.request.use((cfg) => {
  try {
    const token = localStorage.getItem("cms_token");
    if (token) {
      cfg.headers.Authorization = `Bearer ${token}`;
      console.log("[API] Token found, length:", token.length);
    } else {
      console.warn("[API] No token in localStorage");
    }
  } catch (err) {
    console.error("[API] Error getting token:", err);
  }
  return cfg;
});

/**
 * Response Interceptor
 * Handles authentication errors (401) by clearing token and redirecting
 * This prevents the user from seeing broken authenticated pages
 */
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.warn("[API] Unauthorized (401) - Token may have expired");

      // Clear token from localStorage
      localStorage.removeItem("cms_token");

      // Redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/**
 * API Endpoints Constants
 * Centralized endpoint definitions for maintainability
 */
export const endpoints = {
  login: "/api/auth/login",
  pages: "/api/admin/pages",
  siteConfig: "/api/site-config",
  components: "/api/admin/components",
  publicPage: "/api/pages/resolve", // GET /api/pages/resolve?path=/about
};

export default {
  login: (creds: { email: string; password: string }) =>
    client.post(endpoints.login, creds),
  getPages: () => client.get(endpoints.pages),
  getPageById: (id: string) => client.get(`${endpoints.pages}/${id}`),
  createPage: (body: {
    title: string;
    path: string;
    content: string;
    layout?: any[];
    published?: boolean;
    seo?: any;
  }) => client.post(endpoints.pages, body),
  updatePage: (
    id: string,
    body: Partial<{
      title: string;
      path: string;
      content: string;
      layout: any[];
      published: boolean;
      seo: any;
      customCss: string;
      customHtml: string;
      customHtmlPosition:
        | "start"
        | "after-nav"
        | "before-footer"
        | "end"
        | "after-selector";
      customHtmlSelector: string;
    }>
  ) => client.put(`${endpoints.pages}/${id}`, body),
  deletePage: (id: string) => client.delete(`${endpoints.pages}/${id}`),
  publishPage: (id: string) => client.post(`${endpoints.pages}/${id}/publish`),
  getComponents: () => client.get(endpoints.components),
  createComponent: (body: {
    type: string;
    displayName?: string;
    propsSchema?: any;
    category?: string;
    previewImage?: string;
  }) => client.post(endpoints.components, body),
  getPublicByPath: (path: string) =>
    client.get(`${endpoints.publicPage}?path=${encodeURIComponent(path)}`),
  // Site config (navigation/footer)
  getSiteConfig: () => client.get(endpoints.siteConfig),
  getRenderedFooter: () => client.get(`${endpoints.siteConfig}/render-footer`),
  refreshPublishedPages: () =>
    client.post(`${endpoints.siteConfig}/refresh-pages`),
  updateSiteConfig: (body: {
    navConfig?: any;
    footerConfig?: any;
    fontFamily?: string;
  }) => client.put(endpoints.siteConfig, body),
  listMedia: () => client.get("/api/media"),
  uploadMedia: (formData: FormData) =>
    client.post("/api/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteMedia: (id: string) => client.delete(`/api/media/${id}`),
};
