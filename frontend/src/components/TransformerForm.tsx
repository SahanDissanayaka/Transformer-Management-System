import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Transformer } from "../api/endpoints";
import React from "react";

// Schema aligned with backend
const schema = z.object({
  region: z.string().min(1, "Region is required"),
  transformerNo: z.string().min(1, "Transformer No is required"),
  poleNo: z.string().min(1, "Pole No is required"),
  type: z.string().min(1, "Type is required"),
  locationDetails: z.string().min(1, "Location details are required"),
});

type FormValues = z.infer<typeof schema>;

const sriLankanProvinces = [
  "Central Province",
  "Eastern Province",
  "Northern Province",
  "Southern Province",
  "Western Province",
  "North Western Province",
  "North Central Province",
  "Uva Province",
  "Sabaragamuwa Province",
];

const transformerTypes = ["bulk", "distribution"];

export default function TransformerForm({
  onSubmit,
  submitting,
  initialValues,
}: {
  onSubmit: (data: Omit<Transformer, "id">) => void;
  submitting?: boolean;
  initialValues?: Partial<Transformer> | null;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues || {},
  });

  // When initialValues change (edit mode), reset the form
  React.useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  return (
    <form
      className="card"
      onSubmit={handleSubmit((v) => {
        onSubmit(v);
        reset(); // clear after submit
      })}
      style={{ display: "grid", gap: 12 }}
    >
      <div className="row">
        <div>
          <label className="label">Region</label>
          <select className="input" {...register("region")}>
            <option value="">Select a region</option>
            {sriLankanProvinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
          {errors.region && (
            <small style={{ color: "salmon" }}>{errors.region.message}</small>
          )}
        </div>
        <div>
          <label className="label">Transformer No</label>
          <input
            className="input"
            placeholder="e.g., T001"
            {...register("transformerNo")}
          />
          {errors.transformerNo && (
            <small style={{ color: "salmon" }}>
              {errors.transformerNo.message}
            </small>
          )}
        </div>
      </div>

      <div className="row">
        <div>
          <label className="label">Pole No</label>
          <input
            className="input"
            placeholder="e.g., P101"
            {...register("poleNo")}
          />
          {errors.poleNo && (
            <small style={{ color: "salmon" }}>{errors.poleNo.message}</small>
          )}
        </div>
        <div>
          <label className="label">Type</label>
          <select className="input" {...register("type")}>
            <option value="">Select a type</option>
            {transformerTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.type && (
            <small style={{ color: "salmon" }}>{errors.type.message}</small>
          )}
        </div>
      </div>

      <div>
        <label className="label">Location Details</label>
        <input
          className="input"
          placeholder="e.g., Main Street, Colombo 1"
          {...register("locationDetails")}
        />
        {errors.locationDetails && (
          <small style={{ color: "salmon" }}>
            {errors.locationDetails.message}
          </small>
        )}
      </div>

      <div>
        <button className="btn" disabled={submitting}>
          {submitting
            ? "Saving…"
            : initialValues
            ? "Update Transformer"
            : "Add Transformer"}
        </button>
      </div>
    </form>
  );
}
