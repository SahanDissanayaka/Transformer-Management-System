import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TransformerForm from "../components/TransformerForm";
import { useTransformers } from "../hooks/useTransformers";

const ITEMS_PER_PAGE = 10;

export default function TransformersPage() {
  const navigate = useNavigate();
  const [editItem, setEditItem] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const {
    data,
    isLoading,
    error,
    createTransformer,
    updateTransformer,
    deleteTransformer,
    creating,
    updating,
    deleting,
  } = useTransformers();

  const fullList = Array.isArray(data) ? data : [];
  const totalRecords = fullList.length;
  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);
  const transformerList = fullList.slice(offset, offset + ITEMS_PER_PAGE);

  const handleSubmit = (values: any) => {
    if (editItem) {
      updateTransformer({ ...editItem, ...values }).then(() =>
        setEditItem(null)
      );
    } else {
      createTransformer(values);
    }
  };

  return (
    <div className="container">
      <h2 style={{ marginBottom: 12 }}>Transformers</h2>

      <TransformerForm
        initialValues={editItem}
        onSubmit={handleSubmit}
        submitting={creating || updating}
      />

      {editItem && (
        <p style={{ marginTop: 8, color: "orange" }}>
          Editing transformer <strong>{editItem.transformerNo}</strong>.
          <button
            className="btn secondary"
            style={{ marginLeft: 8 }}
            onClick={() => setEditItem(null)}
          >
            Cancel
          </button>
        </p>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Existing Records</h3>
        {isLoading && <p>Loading…</p>}
        {error && <p style={{ color: "salmon" }}>Failed to load.</p>}

        {transformerList.length > 0 ? (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Region</th>
                  <th>Transformer No</th>
                  <th>Pole No</th>
                  <th>Type</th>
                  <th>Location Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transformerList.map((t: any, idx: number) => (
                  <tr key={idx}>
                    <td>{t.region}</td>
                    <td>
                      <span className="badge">{t.transformerNo}</span>
                    </td>
                    <td>{t.poleNo}</td>
                    <td>{t.type}</td>
                    <td>{t.locationDetails}</td>
                    <td>
                      <button
                        className="btn secondary"
                        style={{
                          color: "white",
                          background: "#1e293b",
                          marginRight: 6,
                        }}
                        onClick={() => setEditItem(t)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn"
                        style={{ background: "crimson", marginRight: 6 }}
                        disabled={deleting}
                        onClick={() => deleteTransformer(t.id)}
                      >
                        {deleting ? "Deleting…" : "Delete"}
                      </button>
                      <button
                        className="btn"
                        style={{ backgroundColor: "#3b82f6", color: "white" }}
                        onClick={() => navigate(`/transformers/${t.transformerNo}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div style={{ marginTop: 16 }}>
                <strong style={{ marginRight: 8 }}>Pages:</strong>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        margin: "0 5px",
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontWeight: "bold",
                        backgroundColor:
                          currentPage === page ? "#334155" : "#1e293b",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
            )}
          </>
        ) : (
          <p>No transformer records found.</p>
        )}
      </div>
    </div>
  );
}
