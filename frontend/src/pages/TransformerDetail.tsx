import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useInspections } from "../hooks/useInspections";
import AddInspectionModal from "../components/AddInspectionModal";
import { deleteInspection } from "../api/inspectionApi";

export default function TransformerDetailPage() {
  const { transformerNo = "" } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editInspection, setEditInspection] = useState(null);
  const ITEMS_PER_PAGE = 10;
  const offset = currentPage - 1;

  const {
    data: inspections,
    isLoading,
    createInspection,
    creating,
  } = useInspections(transformerNo, offset, ITEMS_PER_PAGE);

  const totalPages =
    inspections?.length < ITEMS_PER_PAGE ? currentPage : currentPage + 1;

  const handleEdit = (inspection: any) => {
    setEditInspection(inspection);
    setShowAddModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this inspection?"))
      return;

    try {
      await deleteInspection(id);
      alert("✅ Inspection deleted successfully.");
      window.location.reload();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("❌ Failed to delete inspection.");
    }
  };

 const handleView = (inspection: any) => {
  navigate(`/transformers/${transformerNo}/inspections/${inspection.inspectionNo}`, {
    state: { inspection },
  });
};


  return (
    <div className="container">
      <button
        className="btn secondary"
        onClick={() => navigate("/transformers")}
      >
        ← Back to Transformers
      </button>

      <h2 style={{ marginTop: 16 }}>
        Inspections for Transformer{" "}
        <span className="badge">{transformerNo}</span>
      </h2>

      <button
        className="btn primary"
        style={{ marginTop: 16, marginBottom: 16 }}
        onClick={() => {
          setEditInspection(null);
          setShowAddModal(true);
        }}
      >
        Add Inspection
      </button>

      {showAddModal && (
        <AddInspectionModal
          transformerNo={transformerNo}
          inspection={editInspection}
          onClose={() => {
            setEditInspection(null);
            setShowAddModal(false);
          }}
          onSuccess={() => {
            setEditInspection(null);
            setShowAddModal(false);
            window.location.reload();
          }}
        />
      )}

      {isLoading ? (
        <p>Loading inspections…</p>
      ) : !inspections || inspections.length === 0 ? (
        <p>No inspections found.</p>
      ) : (
        <table className="table" style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th>Inspection No</th>
              <th>Branch</th>
              <th>Inspected Date</th>
              <th>Maintenance Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inspections.map((insp: any, i: number) => (
              <tr key={i}>
                <td>{insp.inspectionNo}</td>
                <td>{insp.branch}</td>
                <td>{insp.inspectedDate}</td>
                <td>{insp.maintenanceDate || "-"}</td>
                <td>
                  <span className="badge">{insp.status}</span>
                </td>
                <td>
                  <button
                    className="btn small"
                    style={{color: 'white' ,background: '#1e293b', marginRight: 6 }}
                    onClick={() => handleEdit(insp)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn small danger"
                    style={{ background: 'crimson', marginRight: 6 }}
                    onClick={() => handleDelete(insp.id)}
                  >
                    Delete
                  </button>
                  <button
                    className="btn small"
                    style={{ backgroundColor: '#3b82f6', color: 'white' }}
                    onClick={() => handleView(insp)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <div style={{ marginTop: 16 }}>
          <strong>Pages:</strong>{" "}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className="btn secondary"
              style={{
                margin: '0 5px',
                padding: '6px 12px',
                borderRadius: 6,
                fontWeight: 'bold',
                backgroundColor: currentPage === page ? '#334155' : '#1e293b',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
