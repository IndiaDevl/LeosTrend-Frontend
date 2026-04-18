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

const initialForm = {
  name: "",
  price: "",
  mrp: "",
  brand: "LeosTrend",
  category: "oversized",
  sizes: "",
  colors: "",
  description: "",
  stock: "",
  material: "",
  fit: "",
  careInstructions: "",
  sku: "",
  rating: "New",
  galleryImages: "",
};

function AddProduct() {
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return (
      form.name.trim() &&
      form.price !== "" &&
      form.category.trim() &&
      form.sizes.trim() &&
      form.colors.trim() &&
      form.description.trim() &&
      form.stock !== "" &&
      Boolean(imageFile)
    );
  }, [form, imageFile]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
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
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append("image", imageFile);
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
      setGalleryFiles([]);
        event.preventDefault();
        setSubmitting(true);
        setMessage("");
        setError("");
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
              required
            />
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

          <label>
            Product Image
            <input type="file" accept="image/*" onChange={handleImageChange} required />
          </label>

          <label className="full-width">
            Gallery Image Uploads
            <input type="file" accept="image/*" multiple onChange={handleGalleryChange} />
          </label>

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
              <img src={resolveImageUrl(imagePreview)} alt="Preview" />
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
