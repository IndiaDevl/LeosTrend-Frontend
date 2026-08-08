import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import { ADMIN_REVIEWS_API_URL, getAdminAuthHeaders } from "../../utils/api";
import "./Admin.css";

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value || "";
  }
};

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [busyReviewId, setBusyReviewId] = useState("");

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(ADMIN_REVIEWS_API_URL, {
        headers: getAdminAuthHeaders(),
        params: {
          status: statusFilter,
          search: searchTerm.trim(),
          limit: 100,
          page: 1,
        },
      });

      setReviews(Array.isArray(response.data.reviews) ? response.data.reviews : []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [statusFilter]);

  const handleSearch = (event) => {
    event.preventDefault();
    loadReviews();
  };

  const toggleVisibility = async (review) => {
    const reviewId = String(review.id || "");
    if (!reviewId) return;

    try {
      setBusyReviewId(reviewId);
      const response = await axios.patch(
        `${ADMIN_REVIEWS_API_URL}/${reviewId}/visibility`,
        { isHidden: !review.isHidden },
        {
          headers: {
            ...getAdminAuthHeaders(),
            "Content-Type": "application/json",
          },
        }
      );

      const updated = response.data?.review;
      if (updated) {
        setReviews((prev) => prev.map((item) => (String(item.id) === reviewId ? updated : item)));
      }
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update visibility");
    } finally {
      setBusyReviewId("");
    }
  };

  const deleteReview = async (review) => {
    const reviewId = String(review.id || "");
    if (!reviewId) return;

    const shouldDelete = window.confirm("Delete this review permanently?");
    if (!shouldDelete) return;

    try {
      setBusyReviewId(reviewId);
      await axios.delete(`${ADMIN_REVIEWS_API_URL}/${reviewId}`, {
        headers: getAdminAuthHeaders(),
      });

      setReviews((prev) => prev.filter((item) => String(item.id) !== reviewId));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete review");
    } finally {
      setBusyReviewId("");
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <header className="admin-head">
          <h1>Reviews</h1>
          <p>Moderate customer reviews, hide low-quality content, and remove spam safely.</p>
        </header>

        <section className="admin-filters-row admin-reviews-filters">
          <label>
            Status
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All</option>
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
            </select>
          </label>

          <form onSubmit={handleSearch} className="admin-review-search-form">
            <label>
              Search
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Name, email, title, comment"
              />
            </label>
            <button type="submit" className="btn-primary admin-review-search-btn">Apply</button>
          </form>
        </section>

        {error && <p className="error-msg">{error}</p>}

        {loading ? (
          <p>Loading reviews...</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table admin-table-mobile-cards">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Flags</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length === 0 && (
                  <tr className="admin-empty-row">
                    <td colSpan={7}>No reviews found.</td>
                  </tr>
                )}

                {reviews.map((review) => {
                  const reviewId = String(review.id || "");
                  const isBusy = busyReviewId === reviewId;

                  return (
                    <tr key={reviewId}>
                      <td data-label="Customer">
                        <div className="admin-order-cell">
                          <strong>{review.customerName || "Anonymous"}</strong>
                          <span>{review.customerEmail || review.customerPhone || "No contact"}</span>
                        </div>
                      </td>
                      <td data-label="Product">
                        <span className="admin-category-pill">{review.productId}</span>
                      </td>
                      <td data-label="Rating">
                        <span className="admin-price-value">{Number(review.rating || 0).toFixed(1)} / 5</span>
                      </td>
                      <td data-label="Review">
                        <div className="admin-review-copy">
                          <strong>{review.title || "No title"}</strong>
                          <p>{review.comment || "-"}</p>
                        </div>
                      </td>
                      <td data-label="Flags">
                        <div className="admin-review-flags">
                          {review.isVerifiedBuyer && <span className="admin-status-pill">Verified Buyer</span>}
                          <span className={`admin-status-pill ${review.isHidden ? "admin-status-pill-hidden" : ""}`}>
                            {review.isHidden ? "Hidden" : "Visible"}
                          </span>
                        </div>
                      </td>
                      <td data-label="Created">{formatDate(review.createdAt)}</td>
                      <td data-label="Actions" className="table-actions">
                        <button
                          type="button"
                          className="btn-warning"
                          onClick={() => toggleVisibility(review)}
                          disabled={isBusy}
                        >
                          {review.isHidden ? "Unhide" : "Hide"}
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => deleteReview(review)}
                          disabled={isBusy}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminReviews;
