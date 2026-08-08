import React, { useMemo, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import {
  getAdminAuthHeaders,
  normalizeProduct,
  notifyProductsUpdated,
  PRODUCTS_API_URL,
  resolveImageUrl,
} from "../../utils/api";
import "./Admin.css";

const parseSizesValue = (value) =>
  String(value || "")
    .split(",")
    .map((size) => size.trim().toUpperCase())
    .filter(Boolean);

const parseSizeStockValue = (value) => {
  if (!value) return {};

  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value).reduce((accumulator, [rawSize, rawQty]) => {
      const size = String(rawSize || "").trim().toUpperCase();
      const quantity = Math.trunc(Number(rawQty));
      if (!size || !Number.isInteger(quantity) || quantity < 0) return accumulator;
      accumulator[size] = quantity;
      return accumulator;
    }, {});
  }

  const raw = String(value || "").trim();
  if (!raw) return {};

  try {
    return parseSizeStockValue(JSON.parse(raw));
  } catch {
    return raw.split(/[\n,]/).reduce((accumulator, entry) => {
      const [rawSize, rawQty] = String(entry || "").split(":");
      const size = String(rawSize || "").trim().toUpperCase();
      const quantity = Math.trunc(Number(rawQty));
      if (!size || !Number.isInteger(quantity) || quantity < 0) return accumulator;
      accumulator[size] = quantity;
      return accumulator;
    }, {});
  }
};

const serializeSizeStockValue = (sizeStockMap, sizes) => {
  const allowedSizes = new Set((Array.isArray(sizes) ? sizes : []).map((size) => String(size).toUpperCase()));
  const normalized = Object.entries(sizeStockMap || {}).reduce((accumulator, [rawSize, rawQty]) => {
    const size = String(rawSize || "").trim().toUpperCase();
    const quantity = Math.trunc(Number(rawQty));

    if (!size || !allowedSizes.has(size) || !Number.isInteger(quantity) || quantity < 0) {
      return accumulator;
    }

    accumulator[size] = quantity;
    return accumulator;
  }, {});

  return Object.keys(normalized).length > 0 ? JSON.stringify(normalized) : "";
};

const sumSizeStockValue = (sizeStockMap) =>
  Object.values(sizeStockMap || {}).reduce((sum, qty) => sum + Math.max(0, Math.trunc(Number(qty) || 0)), 0);

const parseSizeChartValue = (value) => {
  if (!value) return {};

  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value).reduce((accumulator, [rawSize, rawValue]) => {
      const size = String(rawSize || "").trim().toUpperCase();
      const measurement = Number(rawValue);
      if (!size || !Number.isFinite(measurement) || measurement <= 0) return accumulator;
      accumulator[size] = Number(measurement.toFixed(2));
      return accumulator;
    }, {});
  }

  const raw = String(value || "").trim();
  if (!raw) return {};

  try {
    return parseSizeChartValue(JSON.parse(raw));
  } catch {
    return raw.split(/[\n,]/).reduce((accumulator, entry) => {
      const [rawSize, rawValue] = String(entry || "").split(":");
      const size = String(rawSize || "").trim().toUpperCase();
      const measurement = Number(rawValue);
      if (!size || !Number.isFinite(measurement) || measurement <= 0) return accumulator;
      accumulator[size] = Number(measurement.toFixed(2));
      return accumulator;
    }, {});
  }
};

const serializeSizeChartValue = (sizeChartMap, sizes) => {
  const allowedSizes = new Set((Array.isArray(sizes) ? sizes : []).map((size) => String(size).toUpperCase()));
  const normalized = Object.entries(sizeChartMap || {}).reduce((accumulator, [rawSize, rawValue]) => {
    const size = String(rawSize || "").trim().toUpperCase();
    const measurement = Number(rawValue);

    if (!size || !allowedSizes.has(size) || !Number.isFinite(measurement) || measurement <= 0) {
      return accumulator;
    }

    accumulator[size] = Number(measurement.toFixed(2));
    return accumulator;
  }, {});

  return Object.keys(normalized).length > 0 ? JSON.stringify(normalized) : "";
};

const initialForm = {
  name: "",
  price: "",
  mrp: "",
  brand: "LeosTrend",
  category: "oversized",
  sizes: "",
  sizeStock: "",
  sizeChart: "",
  colors: "",
  description: "",
  stock: "",
  material: "",
  fit: "",
  careInstructions: "",
  sku: "",
  rating: "New",
  galleryImages: "",
  isTrending: false,
  trendingPosition: "1",
};

function AddProduct() {
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const parsedSizes = useMemo(() => parseSizesValue(form.sizes), [form.sizes]);
  const parsedSizeStock = useMemo(() => parseSizeStockValue(form.sizeStock), [form.sizeStock]);
  const parsedSizeChart = useMemo(() => parseSizeChartValue(form.sizeChart), [form.sizeChart]);
  const hasSizeStockEntries = Object.keys(parsedSizeStock).length > 0;

  const canSubmit = useMemo(() => {
    return (
      form.name.trim() &&
      form.price !== "" &&
      form.category.trim() &&
      form.sizes.trim() &&
      form.colors.trim() &&
      form.description.trim() &&
      form.stock !== "" &&
      (Boolean(imageFile) || Boolean(imageUrl.trim()))
    );
  }, [form, imageFile, imageUrl]);

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => {
      const nextValue = type === "checkbox" ? checked : value;

      if (name !== "sizes") {
        return { ...prev, [name]: nextValue };
      }

      const nextSizes = parseSizesValue(nextValue);
      const nextSizeStock = serializeSizeStockValue(parseSizeStockValue(prev.sizeStock), nextSizes);
      const nextSizeChart = serializeSizeChartValue(parseSizeChartValue(prev.sizeChart), nextSizes);

      return {
        ...prev,
        sizes: nextValue,
        sizeStock: nextSizeStock,
        sizeChart: nextSizeChart,
      };
    });
  };

  const updateSizeStockForSize = (size, rawValue) => {
    setForm((prev) => {
      const nextSizes = parseSizesValue(prev.sizes);
      const nextMap = { ...parseSizeStockValue(prev.sizeStock) };
      const normalizedSize = String(size || "").trim().toUpperCase();

      if (!normalizedSize) {
        return prev;
      }

      if (rawValue === "") {
        delete nextMap[normalizedSize];
      } else {
        const nextQty = Math.max(0, Math.trunc(Number(rawValue) || 0));
        nextMap[normalizedSize] = nextQty;
      }

      const normalizedSizeStock = serializeSizeStockValue(nextMap, nextSizes);
      const normalizedMap = parseSizeStockValue(normalizedSizeStock);
      const totalFromSizes = sumSizeStockValue(normalizedMap);

      return {
        ...prev,
        sizeStock: normalizedSizeStock,
        stock: Object.keys(normalizedMap).length > 0 ? String(totalFromSizes) : prev.stock,
      };
    });
  };

  const updateSizeChartForSize = (size, rawValue) => {
    setForm((prev) => {
      const nextSizes = parseSizesValue(prev.sizes);
      const nextMap = { ...parseSizeChartValue(prev.sizeChart) };
      const normalizedSize = String(size || "").trim().toUpperCase();

      if (!normalizedSize) {
        return prev;
      }

      if (rawValue === "") {
        delete nextMap[normalizedSize];
      } else {
        const nextValue = Number(rawValue);
        if (!Number.isFinite(nextValue) || nextValue <= 0) {
          return prev;
        }
        nextMap[normalizedSize] = Number(nextValue.toFixed(2));
      }

      return {
        ...prev,
        sizeChart: serializeSizeChartValue(nextMap, nextSizes),
      };
    });
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImageUrl(""); // Clear URL if file is chosen
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageUrlChange = (event) => {
    const url = event.target.value;
    setImageUrl(url);
    setImageFile(null); // Clear file if URL is entered
    setImagePreview(url);
  };

  const handleGalleryChange = (event) => {
    const files = Array.from(event.target.files || []);
    setGalleryFiles(files);
    setGalleryPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (event) => {
    if (event && event.preventDefault) event.preventDefault();

    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const normalizedSizeStock = serializeSizeStockValue(parsedSizeStock, parsedSizes);
      const normalizedSizeStockMap = parseSizeStockValue(normalizedSizeStock);
      const totalFromSizes = sumSizeStockValue(normalizedSizeStockMap);
      const normalizedSizeChart = serializeSizeChartValue(parsedSizeChart, parsedSizes);

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "sizeStock") return;
        if (key === "sizeChart") return;
        if (key === "stock" && Object.keys(normalizedSizeStockMap).length > 0) {
          formData.append("stock", String(totalFromSizes));
          return;
        }
        formData.append(key, value);
      });
      formData.append("sizeStock", normalizedSizeStock);
      formData.append("sizeChart", normalizedSizeChart);
      // Prefer file, else use URL
      if (imageFile) {
        formData.append("image", imageFile);
      } else if (imageUrl.trim()) {
        formData.append("image", imageUrl.trim());
      }
      galleryFiles.forEach((file) => formData.append("galleryImages", file));

      const response = await axios.post(PRODUCTS_API_URL, formData, {
        headers: {
          ...getAdminAuthHeaders(),
        },
      });

      const saved = normalizeProduct(response.data);
      setMessage(`Product added: ${saved.name}`);
      notifyProductsUpdated();
      setForm(initialForm);
      setImageFile(null);
      setImageUrl("");
      setGalleryFiles([]);
      setImagePreview("");
    } catch (err) {
      const apiMessage = err.response?.data?.message;
      const apiError = err.response?.data?.error;
      const networkMessage = err.message;
      setError(apiError || apiMessage || networkMessage || "Failed to add product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <header className="admin-head">
          <h1>Add Product</h1>
          <p>New products added here will appear on the main store automatically.</p>
        </header>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            Product Name
            <input name="name" value={form.name} onChange={onChange} required />
          </label>

          <label>
            Price (selling price)
            <input
              type="number"
              min="0"
              name="price"
              value={form.price}
              onChange={onChange}
              required
            />
          </label>

          <label>
            MRP (original price)
            <input
              type="number"
              min="0"
              name="mrp"
              value={form.mrp}
              onChange={onChange}
              placeholder="Leave blank to match price"
            />
          </label>

          <label>
            Brand
            <input name="brand" value={form.brand} onChange={onChange} />
          </label>

          <label>
            Category
            <select name="category" value={form.category} onChange={onChange} required>
              <option value="oversized">Oversized</option>
              <option value="sweatshirts">Sweatshirts</option>
              <option value="hoodies">Hoodies</option>
              <option value="zip">Zip Sweatshirts</option>
            </select>
          </label>

          <label>
            Sizes (comma separated)
            <input name="sizes" value={form.sizes} onChange={onChange} placeholder="S,M,L,XL" required />
          </label>

          {parsedSizes.length > 0 && (
            <div className="full-width">
              <label style={{ display: "block", marginBottom: 8 }}>Size-wise Stock</label>
              <div className="edit-fields-grid" style={{ marginBottom: 0 }}>
                {parsedSizes.map((size) => (
                  <label key={`add-size-stock-${size}`}>
                    {size} Stock
                    <input
                      type="number"
                      min="0"
                      value={
                        Object.prototype.hasOwnProperty.call(parsedSizeStock, size)
                          ? String(parsedSizeStock[size])
                          : ""
                      }
                      onChange={(event) => updateSizeStockForSize(size, event.target.value)}
                      placeholder="0"
                    />
                  </label>
                ))}
              </div>
              <small>Example: M=1, L=4, XL=5. If you set this, ordering is validated per size.</small>
            </div>
          )}

          {parsedSizes.length > 0 && (
            <div className="full-width">
              <label style={{ display: "block", marginBottom: 8 }}>Size Chart (Chest in inches)</label>
              <div className="edit-fields-grid" style={{ marginBottom: 0 }}>
                {parsedSizes.map((size) => (
                  <label key={`add-size-chart-${size}`}>
                    {size} Chest
                    <input
                      type="number"
                      min="1"
                      step="0.5"
                      value={
                        Object.prototype.hasOwnProperty.call(parsedSizeChart, size)
                          ? String(parsedSizeChart[size])
                          : ""
                      }
                      onChange={(event) => updateSizeChartForSize(size, event.target.value)}
                      placeholder="39"
                    />
                  </label>
                ))}
              </div>
              <small>Example: M = 39, L = 41, XL = 43</small>
            </div>
          )}

          <label>
            Colors (comma separated)
            <input
              name="colors"
              value={form.colors}
              onChange={onChange}
              placeholder="Black,White"
              required
            />
          </label>

          <label className="full-width">
            Description
            <textarea name="description" value={form.description} onChange={onChange} required />
          </label>

          <label>
            Stock
            <input
              type="number"
              min="0"
              name="stock"
              value={form.stock}
              onChange={onChange}
              readOnly={hasSizeStockEntries}
              required
            />
            {hasSizeStockEntries && (
              <small>Total stock is auto-calculated from size-wise stock.</small>
            )}
          </label>

          <label>
            Material / Fabric
            <input
              name="material"
              value={form.material}
              onChange={onChange}
              placeholder="e.g. 100% Cotton"
            />
          </label>

          <label>
            Fit Type
            <select name="fit" value={form.fit} onChange={onChange}>
              <option value="">Not specified</option>
              <option value="Oversized">Oversized</option>
              <option value="Relaxed">Relaxed</option>
              <option value="Regular">Regular</option>
              <option value="Slim">Slim</option>
              <option value="Boxy">Boxy</option>
            </select>
          </label>

          <label className="full-width">
            Care Instructions
            <input
              name="careInstructions"
              value={form.careInstructions}
              onChange={onChange}
              placeholder="e.g. Machine wash cold, do not bleach"
            />
          </label>

          <label>
            SKU / Product Code
            <input
              name="sku"
              value={form.sku}
              onChange={onChange}
              placeholder="e.g. LT-OVR-001"
            />
          </label>

          <label>
            Label / Tag
            <select name="rating" value={form.rating} onChange={onChange}>
              <option value="New">New</option>
              <option value="Bestseller">Bestseller</option>
              <option value="Hot">Hot</option>
              <option value="Limited">Limited</option>
              <option value="Sale">Sale</option>
            </select>
          </label>

          <div className="trending-toggle-card full-width">
            <div className="trending-toggle-inner">
              <div className="trending-toggle-info">
                <span className="trending-toggle-icon">🔥</span>
                <div>
                  <p className="trending-toggle-title">Feature in Trending Now</p>
                  <p className="trending-toggle-desc">Pin this product to the Trending Now section on the homepage (max 4 per category).</p>
                </div>
              </div>
              <label className="trending-switch" aria-label="Feature in Trending Now">
                <input
                  type="checkbox"
                  name="isTrending"
                  checked={form.isTrending}
                  onChange={onChange}
                />
                <span className="trending-switch-track">
                  <span className="trending-switch-thumb" />
                </span>
              </label>
            </div>
            {form.isTrending && (
              <>
                <p className="trending-toggle-active-note">✦ This product will appear in the selected Trending Now card on the homepage.</p>
                <label>
                  Trending card position
                  <select name="trendingPosition" value={form.trendingPosition} onChange={onChange}>
                    <option value="1">1st card</option>
                    <option value="2">2nd card</option>
                    <option value="3">3rd card</option>
                    <option value="4">4th card</option>
                  </select>
                </label>
              </>
            )}
          </div>


          <label>
            Product Image
            <input type="file" accept="image/*" onChange={handleImageChange} disabled={Boolean(imageUrl.trim())} required={!imageUrl.trim()} />
          </label>
          <label>
            Product Image URL
            <input
              type="url"
              placeholder="Paste image URL (https://...)"
              value={imageUrl}
              onChange={handleImageUrlChange}
              disabled={Boolean(imageFile)}
              style={{marginTop:4}}
            />
          </label>

          {/* Gallery Image Uploads removed. Use only URLs below. */}

          <label className="full-width">
            Gallery Image URLs
            <textarea
              name="galleryImages"
              value={form.galleryImages}
              onChange={onChange}
              placeholder="Optional: paste extra image URLs separated by commas or new lines"
            />
          </label>

          {imagePreview && (
            <div className="image-preview full-width">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}

          {galleryPreviews.length > 0 && (
            <div className="gallery-preview-grid full-width">
              {galleryPreviews.map((preview, index) => (
                <img key={`${preview}-${index}`} src={preview} alt={`Gallery preview ${index + 1}`} />
              ))}
            </div>
          )}

          {message && <p className="success-msg full-width">{message}</p>}
          {error && <p className="error-msg full-width">{error}</p>}

          <button type="submit" className="admin-submit full-width" disabled={!canSubmit || submitting}>
            {submitting ? "Saving..." : "Add Product"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default AddProduct;
