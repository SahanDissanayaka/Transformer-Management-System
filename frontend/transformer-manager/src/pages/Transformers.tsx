import { useState } from 'react';
import TransformerForm from '../components/TransformerForm';
import { useTransformers } from '../hooks/useTransformers';

export default function TransformersPage() {
  const { data, isLoading, error, createTransformer, updateTransformer, deleteTransformer, creating, updating, deleting } =
    useTransformers();

  const [editItem, setEditItem] = useState<any | null>(null);

  return (
    <div className="container">
      <h2 style={{ marginBottom: 12 }}>Transformers</h2>

      {/* Form handles both create and update */}
      <TransformerForm
        initialValues={editItem}
        onSubmit={(v) => {
          if (editItem) {
            updateTransformer({ ...editItem, ...v }).then(() => setEditItem(null));
          } else {
            createTransformer(v);
          }
        }}
        submitting={creating || updating}
      />

      {editItem && (
        <p style={{ marginTop: 8, color: 'orange' }}>
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
        {error && <p style={{ color: 'salmon' }}>Failed to load.</p>}

        {data && data.length > 0 ? (
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
              {data.map((t: any, idx: number) => (
                <tr key={idx}>
                  <td>{t.region}</td>
                  <td><span className="badge">{t.transformerNo}</span></td>
                  <td>{t.poleNo}</td>
                  <td>{t.type}</td>
                  <td>{t.locationDetails}</td>
                  <td>
                    <button
                      className="btn secondary"
                      style={{ marginRight: 6 }}
                      onClick={() => setEditItem(t)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn"
                      style={{ background: 'crimson' }}
                      disabled={deleting}
                      onClick={() => deleteTransformer(t.id)}
                    >
                      {deleting ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No transformer records found.</p>
        )}
      </div>
    </div>
  );
}
