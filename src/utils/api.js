// Admin session keys
export const ADMIN_TOKEN_KEY = "admin_token";
export const ADMIN_ROLE_KEY = "admin_role";
export const ADMIN_SESSION_EXPIRY_KEY = "admin_session_expiry";

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const liveBackendUrl = "https://leostrend.com";
  const localBackendUrl = "http://localhost:1000";

  if (envUrl && envUrl.trim() !== "") {
    return envUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const host = String(window.location.hostname || "").toLowerCase();
    const origin = window.location.origin.replace(/\/$/, "");

    if (host === "localhost" || host === "127.0.0.1") {
      return localBackendUrl;
    }

    if (host === "leostrend.com" || host === "www.leostrend.com") {
      return origin;
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

const CLOUDINARY_UPLOAD_SEGMENT = "/image/upload/";
const CLOUDINARY_FETCH_BASE = "https://res.cloudinary.com/dppuhxbti/image/fetch/";

export const getOptimizedImageUrl = (image, options = {}) => {
  const resolved = resolveImageUrl(image);
  if (!resolved) return "";

  const {
    width,
    height,
    crop = "limit",
    quality = "auto",
    format = "auto",
    dpr = "auto",
  } = options;

  const resolvedUrl = (() => {
    try {
      return new URL(resolved, window.location.origin);
    } catch {
      return null;
    }
  })();

  if (resolvedUrl && resolvedUrl.pathname.startsWith("/uploads/")) {
    const params = new URLSearchParams({ src: resolvedUrl.pathname.replace(/^\/+/, "") });
    if (Number.isFinite(width) && width > 0) {
      params.set("w", String(Math.round(width)));
    }
    if (Number.isFinite(height) && height > 0) {
      params.set("h", String(Math.round(height)));
    }
    if (quality !== undefined && quality !== null && quality !== "auto") {
      params.set("q", String(quality));
    }

    return `${API_BASE_URL}/api/image?${params.toString()}`;
  }

  if (resolvedUrl && resolvedUrl.hostname.includes("images.unsplash.com")) {
    if (Number.isFinite(width) && width > 0) {
      resolvedUrl.searchParams.set("w", String(Math.round(width)));
    }
    if (Number.isFinite(height) && height > 0) {
      resolvedUrl.searchParams.set("h", String(Math.round(height)));
    }
    resolvedUrl.searchParams.set("q", quality === "auto" ? "80" : String(quality));
    resolvedUrl.searchParams.set("auto", "format,compress");
    resolvedUrl.searchParams.set("fit", "max");
    return resolvedUrl.toString();
  }

  if (!resolved.includes("res.cloudinary.com") || !resolved.includes(CLOUDINARY_UPLOAD_SEGMENT)) {
    const transforms = [`f_${format}`, `q_${quality}`, `dpr_${dpr}`];

    if (crop) {
      transforms.push(`c_${crop}`);
    }

    if (Number.isFinite(width) && width > 0) {
      transforms.push(`w_${Math.round(width)}`);
    }

    if (Number.isFinite(height) && height > 0) {
      transforms.push(`h_${Math.round(height)}`);
    }

    return `${CLOUDINARY_FETCH_BASE}${transforms.join(",")}/${encodeURIComponent(resolved)}`;
  }

  const transforms = [`f_${format}`, `q_${quality}`, `dpr_${dpr}`];

  if (crop) {
    transforms.push(`c_${crop}`);
  }

  if (Number.isFinite(width) && width > 0) {
    transforms.push(`w_${Math.round(width)}`);
  }

  if (Number.isFinite(height) && height > 0) {
    transforms.push(`h_${Math.round(height)}`);
  }

  const transformationString = transforms.join(",");
  return resolved.replace(CLOUDINARY_UPLOAD_SEGMENT, `${CLOUDINARY_UPLOAD_SEGMENT}${transformationString}/`);
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
  const rawTrendingPosition = Number(product.trendingPosition);
  const trendingPosition = Number.isInteger(rawTrendingPosition) && rawTrendingPosition >= 1 && rawTrendingPosition <= 4
    ? rawTrendingPosition
    : null;

  return {
    ...product,
    id: normalizedId,
    _id: normalizedId,
    brand: product.brand || "LeosTrend",
    mrp: product.mrp ?? product.price,
    rating: product.rating || "New",
    isTrending: product.isTrending === true || product.isTrending === 1 || product.isTrending === "true",
    trendingPosition,
    imageUrl: primaryImage,
    image: primaryImage,
    images: mergedImages,
    galleryImages: mergedImages.slice(1),
    additionalImages: mergedImages.slice(1),
    gallery: mergedImages.slice(1),
  };
};


