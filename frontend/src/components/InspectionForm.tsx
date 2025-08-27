import { useState } from "react";

export default function InspectionForm({ transformerNo, onSubmit, submitting }: any) {
  const [form, setForm] = useState({
    inspectionNo: "",
    branch: "",
    inspectedDate: "",
    maintenancedate: "",
    status: "Pending",
  });

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
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
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
