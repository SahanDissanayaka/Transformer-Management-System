import { useState } from 'react';
import ImageUploadForm from '../components/ImageUploadForm';
import { useTransformers } from '../hooks/useTransformers';
import { useUploadImage } from '../hooks/useImages';
import type { EnvCondition, ImageType } from '../types';


export default function UploadImagesPage() {
const { data: transformers } = useTransformers();
const [selectedTransformerId, setSelectedTransformerId] = useState<string | undefined>(undefined);
const uploadMutation = useUploadImage(selectedTransformerId);


return (
<div className="container">
<h2 style={{ marginBottom: 12 }}>Upload Thermal Images</h2>
<div className="card" style={{ marginBottom: 12 }}>
<label className="label">Choose Transformer (sets target for uploads)</label>
<select className="input" value={selectedTransformerId || ''} onChange={(e) => setSelectedTransformerId(e.target.value || undefined)}>
<option value="">Select transformer…</option>
{transformers?.map(t => <option key={t.id} value={t.id}>{t.id}</option>)}
</select>
</div>


<ImageUploadForm
transformers={transformers || []}
onUpload={({ transformerId, type, envCondition, file }: { transformerId: string; type: ImageType; envCondition?: EnvCondition; file: File }) => {
uploadMutation.mutate({ file, type, envCondition });
}}
/>


{uploadMutation.isPending && <p>Uploading…</p>}
{uploadMutation.error && <p style={{ color: 'salmon' }}>Upload failed.</p>}
{uploadMutation.isSuccess && <p>Uploaded successfully!</p>}
</div>
);
}