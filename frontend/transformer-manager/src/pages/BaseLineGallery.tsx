import { useState } from "react";
import { useBaselineByEnv } from "../hooks/useImages";
import type { EnvCondition } from "../types";

export default function BaselineGalleryPage() {
  const [env, setEnv] = useState<EnvCondition>("sunny");
  const { data, isLoading, error } = useBaselineByEnv(env);

  return (
    <div className="container">
      <h2 style={{ marginBottom: 12 }}>Baseline Gallery</h2>
      <div className="card" style={{ marginBottom: 12 }}>
        <label className="label">Filter by environment</label>
        <select
          className="input"
          value={env}
          onChange={(e) => setEnv(e.target.value as EnvCondition)}
        >
          <option value="sunny">Sunny</option>
          <option value="cloudy">Cloudy</option>
          <option value="rainy">Rainy</option>
        </select>
      </div>

      <div className="card">
        {isLoading && <p>Loading…</p>}
        {error && <p style={{ color: "salmon" }}>Failed to load images.</p>}
        <div className="grid">
          {data?.map((img) => (
            <figure key={img.id}>
              <img
                className="thumb"
                src={img.url}
                alt={`${img.transformerId} ${img.type}`}
              />
              <figcaption
                style={{ marginTop: 6, fontSize: 12, color: "#9fb0ca" }}
              >
                <strong>{img.transformerId}</strong> · {img.envCondition}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
