import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function InspectionForm({ transformerNo, onSubmit, submitting }: any) {
  const { isAuthenticated, role, username } = useAuth();
  const canEdit = isAuthenticated && role === "engineer";

  const [form, setForm] = useState({
    inspectionNo: "",
    branch: "",
    inspectedDate: "",
    maintenancedate: "",
    status: "Pending",
    // Engineer editable fields
    inspectorName: "",
    engineerStatus: "OK",
    voltage: "",
    current: "",
    recommendedAction: "",
    additionalRemarks: "",
  });

  useEffect(() => {
    if (canEdit && username) {
      setForm((f) => ({ ...f, inspectorName: f.inspectorName || username }));
    }
  }, [canEdit, username]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ ...form, transformerNo });
      }}
      className="bg-gray-900 p-4 rounded-lg shadow-sm mb-6"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col">
          <label className="text-sm mb-1">Inspection No</label>
          <input
            name="inspectionNo"
            placeholder="Enter No"
            value={form.inspectionNo}
            onChange={handleChange}
            className="input input-bordered"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm mb-1">Branch</label>
          <input
            name="branch"
            placeholder="Enter Branch"
            value={form.branch}
            onChange={handleChange}
            className="input input-bordered"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm mb-1">Inspected Date</label>
          <input
            name="inspectedDate"
            type="datetime-local"
            value={form.inspectedDate}
            onChange={handleChange}
            className="input input-bordered"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm mb-1">Maintenance Date</label>
          <input
            name="maintenancedate"
            type="datetime-local"
            value={form.maintenancedate}
            onChange={handleChange}
            className="input input-bordered"
          />
        </div>

        <div className="flex flex-col col-span-2 sm:col-span-1">
          <label className="text-sm mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="input input-bordered"
            disabled={!canEdit}
          >
            <option value="OK">OK</option>
            <option value="Needs Maintenance">Needs Maintenance</option>
            <option value="Urgent Attention">Urgent Attention</option>
          </select>
        </div>

        {/* Engineer-only inputs separated visually */}
        <div className="col-span-2 md:col-span-4 border-t border-gray-700 pt-4 mt-4">
          <h3 className="text-sm font-semibold mb-2">Engineer Inputs</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-sm mb-1">Inspector Name</label>
              <input
                name="inspectorName"
                placeholder="Inspector name"
                value={form.inspectorName}
                onChange={handleChange}
                className="input input-bordered"
                disabled={!canEdit}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm mb-1">Transformer Status</label>
              <select
                name="engineerStatus"
                value={form.engineerStatus}
                onChange={handleChange}
                className="input input-bordered"
                disabled={!canEdit}
              >
                <option value="OK">OK</option>
                <option value="Needs Maintenance">Needs Maintenance</option>
                <option value="Urgent Attention">Urgent Attention</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm mb-1">Voltage (V)</label>
              <input
                name="voltage"
                type="number"
                step="any"
                placeholder="Voltage"
                value={form.voltage}
                onChange={handleChange}
                className="input input-bordered"
                disabled={!canEdit}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm mb-1">Current (A)</label>
              <input
                name="current"
                type="number"
                step="any"
                placeholder="Current"
                value={form.current}
                onChange={handleChange}
                className="input input-bordered"
                disabled={!canEdit}
              />
            </div>

            <div className="flex flex-col md:col-span-3">
              <label className="text-sm mb-1">Recommended Action</label>
              <textarea
                name="recommendedAction"
                placeholder="Recommended action"
                value={form.recommendedAction}
                onChange={handleChange}
                className="textarea textarea-bordered w-full"
                disabled={!canEdit}
              />
            </div>

            <div className="flex flex-col md:col-span-3">
              <label className="text-sm mb-1">Additional Remarks</label>
              <textarea
                name="additionalRemarks"
                placeholder="Additional remarks"
                value={form.additionalRemarks}
                onChange={handleChange}
                className="textarea textarea-bordered w-full"
                disabled={!canEdit}
              />
            </div>
          </div>
        </div>

        <div className="flex items-end col-span-2 sm:col-span-1">
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={submitting}
          >
            {submitting ? "Adding…" : "Add Inspection"}
          </button>
        </div>
      </div>
    </form>
  );
}
