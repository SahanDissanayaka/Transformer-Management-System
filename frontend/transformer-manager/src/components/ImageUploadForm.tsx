import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { EnvCondition, ImageType } from "../types";

const schema = z
  .object({
    transformerId: z.string().min(1, "Transformer is required"),
    type: z.enum(["baseline", "maintenance"]),
    envCondition: z.enum(["sunny", "cloudy", "rainy"]).optional(),
    file: z.any(),
  })
  .refine(
    (v) =>
      v.type === "maintenance" || (v.type === "baseline" && !!v.envCondition),
    {
      message: "Env condition is required for baseline",
      path: ["envCondition"],
    }
  )
  .refine(
    (v) => v.file instanceof File || (v.file && v.file[0] instanceof File),
    {
      message: "Image file is required",
      path: ["file"],
    }
  );

type Values = z.infer<typeof schema>;

export default function ImageUploadForm({
  transformers,
  onUpload,
}: {
  transformers: { id: string }[];
  onUpload: (payload: {
    transformerId: string;
    type: ImageType;
    envCondition?: EnvCondition;
    file: File;
  }) => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<Values>({ resolver: zodResolver(schema) });
  const type = watch("type");

  return (
    <form
      className="card"
      onSubmit={handleSubmit((v) => {
        const file = (v.file as FileList)[0];
        onUpload({
          transformerId: v.transformerId,
          type: v.type,
          envCondition: v.envCondition as EnvCondition | undefined,
          file,
        });
        reset({ type: "maintenance" });
      })}
      style={{ display: "grid", gap: 12 }}
    >
      <div className="row">
        <div>
          <label className="label">Transformer</label>
          <select className="input" {...register("transformerId")}>
            <option value="">Select transformer…</option>
            {transformers?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id}
              </option>
            ))}
          </select>
          {errors.transformerId && (
            <small style={{ color: "salmon" }}>
              {errors.transformerId.message}
            </small>
          )}
        </div>
        <div>
          <label className="label">Image Type</label>
          <select
            className="input"
            defaultValue="maintenance"
            {...register("type")}
          >
            <option value="baseline">Baseline</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {type === "baseline" && (
        <div style={{ maxWidth: 300 }}>
          <label className="label">Env Condition (Baseline only)</label>
          <select className="input" {...register("envCondition")}>
            <option value="">Select condition…</option>
            <option value="sunny">Sunny</option>
            <option value="cloudy">Cloudy</option>
            <option value="rainy">Rainy</option>
          </select>
          {errors.envCondition && (
            <small style={{ color: "salmon" }}>
              {errors.envCondition.message as string}
            </small>
          )}
        </div>
      )}

      <div>
        <label className="label">Thermal Image</label>
        <input
          className="input"
          type="file"
          accept="image/*"
          {...register("file")}
        />
        {errors.file && (
          <small style={{ color: "salmon" }}>
            {errors.file.message as string}
          </small>
        )}
      </div>

      <div>
        <button className="btn">Upload</button>
      </div>
    </form>
  );
}
