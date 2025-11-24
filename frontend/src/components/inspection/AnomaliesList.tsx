import type { Box } from "../../types/inspection.types";
import { AnomalyCard } from "./AnomalyCard";

interface AnomaliesListProps {
  boxes: Box[];
  onReject: (anomalyIdx: number) => void;
  onDelete?: (anomalyIdx: number) => void;
  onEdit?: (anomalyIdx: number) => void;
  editingBoxId?: number | null;
  onSave?: (anomalyIdx: number) => void;
}

export function AnomaliesList({
  boxes,
  onReject,
  onDelete,
  onEdit,
  editingBoxId,
  onSave,
}: AnomaliesListProps) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {boxes.map((box) => (
        <AnomalyCard
          key={box.idx}
          box={box}
          onReject={() => onReject(box.idx)}
          onDelete={onDelete ? () => onDelete(box.idx) : undefined}
          onEdit={onEdit ? () => onEdit(box.idx) : undefined}
          isEditing={editingBoxId === box.idx}
          onSave={onSave ? () => onSave(box.idx) : undefined}
        />
      ))}
    </div>
  );
}
