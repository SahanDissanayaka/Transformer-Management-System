import { useState } from 'react';
import { createInspection } from '../api/inspectionApi';
import './AddInspectionModal.css';

export default function AddInspectionModal({ transformerNo, onClose, onSuccess }: any) {
  const [branch, setBranch] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = async () => {
    if (!branch || !inspectionDate || !time) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const formattedDate = new Date(inspectionDate).toISOString().split("T")[0];

      // Convert 24h → 12h AM/PM format
      const [hours, minutes] = time.split(":");
      const hourNum = parseInt(hours, 10);
      const ampm = hourNum >= 12 ? "PM" : "AM";
      const hour12 = hourNum % 12 || 12;
      const formattedTime = `${hour12}:${minutes} ${ampm}`;

      const payload = {
        branch,
        transformerNo,
        inspectionDate: formattedDate,
        time: formattedTime,
      };

      console.log("Submitting inspection:", payload);
      await createInspection(payload);
      alert("✅ Inspection added successfully.");
      onSuccess(); // Refresh or reload
    } catch (error) {
      console.error("❌ Failed to create inspection:", error);
      alert("Failed to create inspection. See console for details.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>New Inspection</h2>
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
