import { useEffect, useState } from 'react';
import { getInspectionsForTransformer, deleteInspection } from '../api/inspectionApi';
import AddInspectionModal from './AddInspectionModal';

export default function TransformerDetail({ transformer, onClose }: any) {
  const [inspections, setInspections] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    getInspectionsForTransformer(transformer.transformerNo).then(setInspections);
  }, [transformer]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'orange';
      case 'Completed':
        return 'green';
      case 'In Progress':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const handleEdit = (inspection: any) => {
    alert(`TODO: Open edit modal for ${inspection.inspectionNo}`);
    // You can replace this with actual edit modal logic
  };

  const handleDelete = async (inspectionId: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this inspection?");
    if (!confirmed) return;

    try {
      await deleteInspection(inspectionId);
      const updated = await getInspectionsForTransformer(transformer.transformerNo);
      setInspections(updated);
      alert("✅ Inspection deleted successfully.");
    } catch (error) {
      console.error("❌ Delete failed:", error);
      alert("❌ Failed to delete inspection.");
    }
  };

  const handleView = (inspection: any) => {
    alert(
      `Inspection: ${inspection.inspectionNo}\nBranch: ${inspection.branch || "N/A"}\nStatus: ${inspection.status}`
    );
  };

  return (
    <div className="card" style={{ marginTop: 32 }}>
      <h3>Transformer: {transformer.transformerNo}</h3>
      <p>{transformer.region} – {transformer.locationDetails}</p>
      <button className="btn secondary" onClick={onClose}>Close</button>

      <button
        className="btn primary"
        style={{ marginTop: 16, marginBottom: 16 }}
        onClick={() => setShowAddModal(true)}
      >
        Add Inspection
      </button>

      <table className="table" style={{ marginTop: 16 }}>
        <thead>
          <tr>
            <th>Inspection No</th>
            <th>Inspected Date</th>
            <th>Maintenance Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inspections.length === 0 && (
            <tr>
              <td colSpan={5}>No inspections found.</td>
            </tr>
          )}
          {inspections.map((insp, i) => (
            <tr key={i}>
              <td>{insp.inspectionNo}</td>
              <td>{insp.inspectedDate}</td>
              <td>{insp.maintenanceDate || '-'}</td>
              <td>
                <span className="badge" style={{
                  backgroundColor: getStatusColor(insp.status),
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: 5,
                }}>
                  {insp.status}
                </span>
              </td>
              <td>
                <button className="btn secondary" onClick={() => handleEdit(insp)}>Edit</button>{' '}
                <button className="btn danger" onClick={() => handleDelete(insp.id)}>Delete</button>{' '}
                <button className="btn primary" onClick={() => handleView(insp)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddModal && (
        <AddInspectionModal
          transformerNo={transformer.transformerNo}
          onClose={() => setShowAddModal(false)}
          onSuccess={async () => {
            const updated = await getInspectionsForTransformer(transformer.transformerNo);
            setInspections(updated);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}
