// Admin session keys
export const ADMIN_TOKEN_KEY = "admin_token";
export const ADMIN_ROLE_KEY = "admin_role";
export const ADMIN_SESSION_EXPIRY_KEY = "admin_session_expiry";

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const liveBackendUrl = "https://leostrend.com";

  if (envUrl && envUrl.trim() !== "") {
    return envUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;

    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:1000";
    }

    return liveBackendUrl;
  }

  return liveBackendUrl;
};

export const API_BASE_URL = getApiBaseUrl();
export const PRODUCTS_API_URL = `${API_BASE_URL}/api/products`;
export const ORDERS_API_URL = `${API_BASE_URL}/api/orders`;
export const CREATE_ORDER_API_URL = `${API_BASE_URL}/api/create-order`;
export const HEALTH_API_URL = `${API_BASE_URL}/api/health`;
export const ADMIN_STATS_API_URL = `${API_BASE_URL}/api/admin/stats`;

export const PRODUCTS_UPDATED_EVENT = "products:updated";

export const notifyProductsUpdated = () => {
  window.dispatchEvent(new Event(PRODUCTS_UPDATED_EVENT));
};

export const isAdminUser = () => {
  const expiry = Number(localStorage.getItem(ADMIN_SESSION_EXPIRY_KEY) || 0);

  if (expiry && Date.now() > expiry) {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_ROLE_KEY);
    localStorage.removeItem(ADMIN_SESSION_EXPIRY_KEY);
    return false;
  }

  return (
    localStorage.getItem(ADMIN_ROLE_KEY) === "admin" &&
    Boolean(localStorage.getItem(ADMIN_TOKEN_KEY))
  );
};

export const setAdminSession = ({ token, role = "admin", expiresAt }) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_ROLE_KEY, role);

  if (expiresAt) {
    localStorage.setItem(ADMIN_SESSION_EXPIRY_KEY, String(expiresAt));
  } else {
    localStorage.removeItem(ADMIN_SESSION_EXPIRY_KEY);
  }
};

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_ROLE_KEY);
  localStorage.removeItem(ADMIN_SESSION_EXPIRY_KEY);
};

export const getAdminAuthHeaders = () => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const resolveImageUrl = (image) => {
  if (!image) return "";
  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  if (image.startsWith("/") && !image.startsWith("/uploads/")) {
    return image;
  }

  const prefixed = image.startsWith("/") ? image : `/${image}`;
  return `${API_BASE_URL}${prefixed}`;
};

export const resolveImageUrls = (images) => {
  if (!Array.isArray(images)) return [];

  return [...new Set(images.map((image) => resolveImageUrl(image)).filter(Boolean))];
};

export const normalizeProduct = (product) => {
  const normalizedId = product._id || product.id;
  const imageSource = product.imageUrl || product.image;
  const gallerySources = resolveImageUrls(
    product.images || product.galleryImages || product.gallery || product.additionalImages || []
  );
  const primaryImage = resolveImageUrl(imageSource) || gallerySources[0] || "";
  const mergedImages = [...new Set([primaryImage, ...gallerySources].filter(Boolean))];

  return {
    ...product,
    id: normalizedId,
    _id: normalizedId,
    brand: product.brand || "LeosTrend",
    mrp: product.mrp ?? product.price,
    rating: product.rating || "New",
    imageUrl: primaryImage,
    image: primaryImage,
    images: mergedImages,
    galleryImages: mergedImages.slice(1),
    additionalImages: mergedImages.slice(1),
    gallery: mergedImages.slice(1),
  };
};


