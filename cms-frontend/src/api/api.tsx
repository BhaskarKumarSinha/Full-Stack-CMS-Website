import axios from "axios";

const API_BASE =
  (import.meta.env.VITE_API_BASE as string) || "http://localhost:4000";

const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

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

// Response interceptor to handle token expiration (401 errors)
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
  updateSiteConfig: (body: { navConfig?: any; footerConfig?: any }) =>
    client.put(endpoints.siteConfig, body),
  listMedia: () => client.get("/api/media"),
  uploadMedia: (formData: FormData) =>
    client.post("/api/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteMedia: (id: string) => client.delete(`/api/media/${id}`),
};
