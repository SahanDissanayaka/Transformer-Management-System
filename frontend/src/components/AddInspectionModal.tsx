import { useState, useEffect } from 'react';
import { createInspection, updateInspection } from '../api/inspectionApi';
import './AddInspectionModal.css';

export default function AddInspectionModal({ transformerNo, inspection, onClose, onSuccess }: any) {
  // Prefill state if editing
  const [branch, setBranch] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [time, setTime] = useState('');

  // When modal opens or inspection changes, populate state
  useEffect(() => {
    if (inspection) {
      setBranch(inspection.branch || '');
      setInspectionDate(inspection.inspectionDate ? inspection.inspectionDate.split('T')[0] : '');
      setTime(inspection.time || '');
    } else {
      setBranch('');
      setInspectionDate('');
      setTime('');
    }
  }, [inspection]);

const handleSubmit = async () => {
  if (!branch || !inspectionDate || !time) {
    alert("Please fill all fields.");
    return;
  }

  try {
    const formattedDate = new Date(inspectionDate).toISOString().split("T")[0];

    const [hours, minutes] = time.split(":");
    const hourNum = parseInt(hours, 10);
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const hour12 = hourNum % 12 || 12;
    const formattedTime = `${hour12}:${minutes} ${ampm}`;

    // Build payload according to backend structure
    const payload = {
      id: inspection?.id || 0,          // use existing id for update
      transformerNo,
      branch,
      inspectionDate: formattedDate,
      time: formattedTime,
      status: inspection?.status || "Pending", // keep existing status if editing
      maintenanceDate: inspection?.maintenanceDate || null, // keep existing
    };

    if (inspection) {
      await updateInspection(payload);
      alert("✅ Inspection updated successfully.");
    } else {
      await createInspection(payload);
      alert("✅ Inspection added successfully.");
    }

    onSuccess();
  } catch (error) {
    console.error("❌ Failed to save inspection:", error);
    alert("Failed to save inspection. See console for details.");
  }
};


  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{inspection ? "Edit Inspection" : "New Inspection"}</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="modal-body">
          <label>Branch</label>
          <input
            type="text"
            placeholder="Enter Branch"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          />

          <label>Transformer No</label>
          <input type="text" value={transformerNo} disabled />

          <label>Date of Inspection</label>
          <input
            type="date"
            value={inspectionDate}
            onChange={(e) => setInspectionDate(e.target.value)}
          />

          <label>Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn cancel">Cancel</button>
          <button onClick={handleSubmit} className="btn confirm">Confirm</button>
        </div>
      </div>
    </div>
  );
}
