import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminContacts.css";

interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
  submittedAt: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

const AdminContacts: React.FC = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterRead, setFilterRead] = useState<"all" | "read" | "unread">(
    "all"
  );

  // Fetch submissions
  useEffect(() => {
    // Use a stable reference for pagination to avoid infinite loops
    const limit = pagination.limit;
    const page = pagination.page;
    const filter = filterRead;

    const loadSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);

        const skip = (page - 1) * limit;
        const token = localStorage.getItem("cms_token");

        if (!token) {
          setError("No authentication token found. Please login again.");
          setSubmissions([]);
          setLoading(false);
          return;
        }

        const response = await axios.get("/api/admin/contact-submissions", {
          params: {
            skip,
            limit,
            read: filter === "all" ? undefined : filter === "read",
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const submissions = response.data?.submissions || [];
        const total = response.data?.total || 0;

        setSubmissions(Array.isArray(submissions) ? submissions : []);
        setPagination((prev) => ({
          ...prev,
          total: typeof total === "number" ? total : 0,
        }));
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        const errorMessage =
          error.response?.data?.message || "Failed to fetch submissions";
        console.error("Error fetching submissions:", errorMessage, err);
        setError(errorMessage);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, [pagination.page, pagination.limit, filterRead]);

  const markAsRead = async (id: string) => {
    try {
      await axios.patch(
        `/api/admin/contact-submissions/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("cms_token")}`,
          },
        }
      );

      setSubmissions((prev) =>
        prev.map((sub) => (sub._id === id ? { ...sub, read: true } : sub))
      );
      setSelectedId(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to mark as read");
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) {
      return;
    }

    try {
      await axios.delete(`/api/admin/contact-submissions/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("cms_token")}`,
        },
      });

      setSubmissions((prev) => prev.filter((sub) => sub._id !== id));
      setSelectedId(null);
      setPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
      }));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to delete submission");
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="admin-contacts-container">
      <div className="admin-contacts-header">
        <h1>📧 Contact Form Submissions</h1>
        <p>Total: {pagination.total} submissions</p>
      </div>

      {error && (
        <div className="error-banner">
          <span>✗ {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="admin-contacts-controls">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select
            value={filterRead}
            onChange={(e) => {
              setFilterRead(e.target.value as "all" | "read" | "unread");
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          >
            <option value="all">All Submissions</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
        </div>

        <div className="pagination-info">
          <span>
            Page {pagination.page} of {totalPages || 1} ({pagination.total}{" "}
            total)
          </span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading submissions...</div>
      ) : !Array.isArray(submissions) || submissions.length === 0 ? (
        <div className="empty-state">
          <p>No submissions found.</p>
          <p>Contact form submissions will appear here.</p>
        </div>
      ) : (
        <div className="submissions-grid">
          {submissions.map((submission) => (
            <div
              key={submission._id}
              className={`submission-card ${
                submission.read ? "read" : "unread"
              } ${selectedId === submission._id ? "selected" : ""}`}
              onClick={() => setSelectedId(submission._id)}
            >
              <div className="submission-header">
                <h3>{submission.name}</h3>
                <span
                  className={`status-badge ${
                    submission.read ? "read" : "unread"
                  }`}
                >
                  {submission.read ? "✓ Read" : "● Unread"}
                </span>
              </div>

              <div className="submission-meta">
                <p>
                  <strong>Email:</strong> {submission.email}
                </p>
                <p>
                  <strong>Phone:</strong> {submission.phone}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(submission.submittedAt).toLocaleString()}
                </p>
              </div>

              <div className="submission-message">
                <strong>Message:</strong>
                <p>{submission.message}</p>
              </div>

              {selectedId === submission._id && (
                <div className="submission-actions">
                  {!submission.read && (
                    <button
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(submission._id);
                      }}
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    className="btn btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSubmission(submission._id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            disabled={pagination.page === 1}
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
            }
          >
            ← Previous
          </button>

          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const pageNum = pagination.page - 2 + i;
              if (pageNum < 1 || pageNum > totalPages) return null;

              return (
                <button
                  key={pageNum}
                  className={`page-btn ${
                    pageNum === pagination.page ? "active" : ""
                  }`}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: pageNum }))
                  }
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            disabled={pagination.page === totalPages}
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
            }
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;
