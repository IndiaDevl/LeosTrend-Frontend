import React, { useEffect, useMemo, useState } from "react";
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

const initialDraft = {
  name: "",
  price: "",
  mrp: "",
  brand: "LeosTrend",
  category: "oversized",
  description: "",
  sizes: "",
  colors: "",
  stock: "",
  material: "",
  fit: "",
  careInstructions: "",
  sku: "",
  rating: "New",
  galleryImages: "",
};

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState("");
  const [draft, setDraft] = useState(initialDraft);
  const [imageFile, setImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [products, searchTerm, categoryFilter]);

  const metrics = useMemo(() => {
    const outOfStock = products.filter((product) => product.stock === 0).length;
    const lowStock = products.filter((product) => product.stock > 0 && product.stock <= 10).length;

    return {
      total: products.length,
      visible: filteredProducts.length,
      outOfStock,
      lowStock,
    };
  }, [products, filteredProducts]);

  const formatList = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return "Not set";
    }

    return items.join(", ");
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(PRODUCTS_API_URL);
      setProducts(response.data.map(normalizeProduct));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${PRODUCTS_API_URL}/${id}`, {
        headers: {
          ...getAdminAuthHeaders(),
        },
      });

      setProducts((prev) => prev.filter((item) => item._id !== id));
      notifyProductsUpdated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product");
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setDraft({
      name: product.name,
      price: String(product.price),
      mrp: String(product.mrp || ""),
      brand: product.brand || "LeosTrend",
      category: product.category,
      description: product.description || "",
      sizes: Array.isArray(product.sizes) ? product.sizes.join(",") : "",
      colors: Array.isArray(product.colors) ? product.colors.join(",") : "",
      stock: String(product.stock),
      material: product.material || "",
      fit: product.fit || "",
      careInstructions: product.careInstructions || "",
      sku: product.sku || "",
      rating: product.rating || "New",
      galleryImages: Array.isArray(product.galleryImages) ? product.galleryImages.join("\n") : "",
    });
    setImageFile(null);
    setImagePreview(product.image || "");
    setGalleryFiles([]);
    setGalleryPreviews(Array.isArray(product.galleryImages) ? product.galleryImages : []);
  };

  const cancelEdit = () => {
    setEditingId("");
    setDraft(initialDraft);
    setImageFile(null);
    setGalleryFiles([]);
    setImagePreview("");
    setGalleryPreviews([]);
  };

  const handleDraftChange = (event) => {
    const { name, value } = event.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
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

  const saveEdit = async () => {
    try {
      const formData = new FormData();
      formData.append("name", draft.name);
      formData.append("price", draft.price);
      formData.append("mrp", draft.mrp);
      formData.append("brand", draft.brand);
      formData.append("category", draft.category);
      formData.append("description", draft.description);
      formData.append("sizes", draft.sizes);
      formData.append("colors", draft.colors);
      formData.append("stock", draft.stock);
      formData.append("material", draft.material);
      formData.append("fit", draft.fit);
      formData.append("careInstructions", draft.careInstructions);
      formData.append("sku", draft.sku);
      formData.append("rating", draft.rating);
      formData.append("galleryImages", draft.galleryImages);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      galleryFiles.forEach((file) => formData.append("galleryImages", file));

      const response = await axios.put(`${PRODUCTS_API_URL}/${editingId}`, formData, {
        headers: {
          ...getAdminAuthHeaders(),
        },
      });

      const updated = normalizeProduct(response.data);
      setProducts((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
      notifyProductsUpdated();
      cancelEdit();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update product");
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <header className="admin-head">
          <h1>Manage Products</h1>
          <p>Refine inventory, adjust pricing, and keep your catalog presentation sharp.</p>
        </header>

        <section className="manage-products-toolbar">
          <div className="admin-metrics-grid">
            <article className="admin-metric-card">
              <span>Total Products</span>
              <strong>{metrics.total}</strong>
            </article>
            <article className="admin-metric-card">
              <span>Visible Results</span>
              <strong>{metrics.visible}</strong>
            </article>
            <article className="admin-metric-card warning">
              <span>Low Stock (1-10)</span>
              <strong>{metrics.lowStock}</strong>
            </article>
            <article className="admin-metric-card danger">
              <span>Out of Stock</span>
              <strong>{metrics.outOfStock}</strong>
            </article>
          </div>

          <div className="admin-filters-row">
            <label>
              Search
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name or description"
              />
            </label>

            <label>
              Category
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="all">All categories</option>
                <option value="oversized">Oversized</option>
                <option value="sweatshirts">Sweatshirts</option>
                <option value="hoodies">Hoodies</option>
                <option value="zip">Zip Sweatshirts</option>
              </select>
            </label>
          </div>
        </section>

        {error && <p className="error-msg">{error}</p>}

        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table admin-table-mobile-cards">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const isEditing = editingId === product._id;

                  return (
                    <tr key={product._id}>
                      <td data-label="Name">
                        {isEditing ? (
                          <div className="edit-fields-grid">
                            <input
                              name="name"
                              value={draft.name}
                              onChange={handleDraftChange}
                              placeholder="Name"
                            />
                            <select
                              name="category"
                              value={draft.category}
                              onChange={handleDraftChange}
                            >
                              <option value="oversized">Oversized</option>
                              <option value="sweatshirts">Sweatshirts</option>
                              <option value="hoodies">Hoodies</option>
                              <option value="zip">Zip Sweatshirts</option>
                            </select>
                            <input
                              name="sizes"
                              value={draft.sizes}
                              onChange={handleDraftChange}
                              placeholder="Sizes (S,M,L)"
                            />
                            <input
                              name="colors"
                              value={draft.colors}
                              onChange={handleDraftChange}
                              placeholder="Colors (Black,White)"
                            />
                            <textarea
                              name="description"
                              value={draft.description}
                              onChange={handleDraftChange}
                              placeholder="Description"
                              className="admin-edit-textarea"
                            />
                            <input
                              name="material"
                              value={draft.material}
                              onChange={handleDraftChange}
                              placeholder="Material (e.g. 100% Cotton)"
                            />
                            <select name="fit" value={draft.fit} onChange={handleDraftChange}>
                              <option value="">Fit type...</option>
                              <option value="Oversized">Oversized</option>
                              <option value="Relaxed">Relaxed</option>
                              <option value="Regular">Regular</option>
                              <option value="Slim">Slim</option>
                              <option value="Boxy">Boxy</option>
                            </select>
                            <input
                              name="careInstructions"
                              value={draft.careInstructions}
                              onChange={handleDraftChange}
                              placeholder="Care instructions"
                            />
                            <input
                              name="brand"
                              value={draft.brand}
                              onChange={handleDraftChange}
                              placeholder="Brand"
                            />
                            <input
                              type="number"
                              name="mrp"
                              value={draft.mrp}
                              onChange={handleDraftChange}
                              placeholder="MRP (original price)"
                            />
                            <input
                              name="sku"
                              value={draft.sku}
                              onChange={handleDraftChange}
                              placeholder="SKU (e.g. LT-OVR-001)"
                            />
                            <select name="rating" value={draft.rating} onChange={handleDraftChange}>
                              <option value="New">New</option>
                              <option value="Bestseller">Bestseller</option>
                              <option value="Hot">Hot</option>
                              <option value="Limited">Limited</option>
                              <option value="Sale">Sale</option>
                            </select>
                            <input type="file" accept="image/*" onChange={handleImageChange} />
                            <input type="file" accept="image/*" multiple onChange={handleGalleryChange} />
                            <textarea
                              name="galleryImages"
                              value={draft.galleryImages}
                              onChange={handleDraftChange}
                              placeholder="Gallery image URLs (comma or newline separated)"
                              className="admin-edit-textarea"
                            />
                            {imagePreview && (
                              <img
                                src={resolveImageUrl(imagePreview)}
                                alt="Product preview"
                                className="admin-edit-image-preview"
                              />
                            )}
                            {galleryPreviews.length > 0 && (
                              <div className="admin-edit-gallery-grid">
                                {galleryPreviews.map((preview, index) => (
                                  <img
                                    key={`${preview}-${index}`}
                                    src={resolveImageUrl(preview)}
                                    alt={`Gallery preview ${index + 1}`}
                                    className="admin-edit-image-preview"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="admin-product-cell">
                            <img
                              src={resolveImageUrl(product.image)}
                              alt={product.name}
                              className="admin-product-thumb"
                            />
                            <div>
                              <p className="admin-product-title">{product.name}</p>
                              <p className="admin-product-meta">Sizes: {formatList(product.sizes)}</p>
                              <p className="admin-product-meta">Colors: {formatList(product.colors)}</p>
                              <p className="admin-product-meta">Gallery: {Array.isArray(product.galleryImages) ? product.galleryImages.length : 0} extra</p>
                            </div>
                          </div>
                        )}
                      </td>
                      <td data-label="Category">
                        <span className="admin-category-pill">{product.category}</span>
                      </td>
                      <td data-label="Price">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            name="price"
                            value={draft.price}
                            onChange={handleDraftChange}
                          />
                        ) : (
                          <span className="admin-price-value">Rs {product.price}</span>
                        )}
                      </td>
                      <td data-label="Stock">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            name="stock"
                            value={draft.stock}
                            onChange={handleDraftChange}
                          />
                        ) : (
                          <span
                            className={`admin-stock-badge ${
                              product.stock === 0 ? "danger" : product.stock <= 10 ? "warning" : "safe"
                            }`}
                          >
                            {product.stock}
                          </span>
                        )}
                      </td>
                      <td data-label="Actions" className="table-actions">
                        {isEditing ? (
                          <>
                            <button type="button" className="btn-primary" onClick={saveEdit}>
                              Save
                            </button>
                            <button type="button" className="btn-ghost" onClick={cancelEdit}>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="btn-primary"
                              onClick={() => startEdit(product)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn-danger"
                              onClick={() => handleDelete(product._id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {!filteredProducts.length && (
                  <tr className="admin-empty-row">
                    <td colSpan="5" className="admin-empty-state">
                      No products matched your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default ManageProducts;
