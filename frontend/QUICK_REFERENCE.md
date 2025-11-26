# Quick Reference Guide - Component Usage

## 🎯 Which File Should You Use?

### For Image Display
```typescript
import { ImagePanel } from "../components/inspection/ImagePanelComponent";

<ImagePanel
  title="Baseline Image"
  src={baseline}
  which="baseline"
  boxes={boxes}
  scale={scale}
  offX={offX}
  offY={offY}
  rot={rot}
  onScaleChange={setScale}
  onOffXChange={setOffX}
  onOffYChange={setOffY}
  onRotChange={setRot}
  onResetView={resetView}
/>
```

### For Anomaly Lists
```typescript
import { AnomaliesList } from "../components/inspection/AnomaliesListComponent";

<AnomaliesList
  boxes={thermalMeta.boxes}
  onEdit={(anomalyIdx) => { /* handle */ }}
  onDelete={(anomalyIdx) => { /* handle */ }}
  onReject={(anomalyIdx) => { /* handle */ }}
/>
```

### For Single Anomaly Display
```typescript
import { AnomalyCard } from "../components/inspection/AnomalyCardComponent";

<AnomalyCard
  box={anomaly}
  onEdit={() => { /* handle */ }}
  onDelete={() => { /* handle */ }}
  onReject={() => { /* handle */ }}
/>
```

### For Rules Modal
```typescript
import { RulesModal } from "../components/inspection/RulesModalComponent";

<RulesModal
  isOpen={showRulesModal}
  onClose={() => setShowRulesModal(false)}
  tempThreshold={tempThreshold}
  onTempThresholdChange={setTempThreshold}
  rule2Enabled={rule2Enabled}
  onRule2Change={setRule2Enabled}
  rule3Enabled={rule3Enabled}
  onRule3Change={setRule3Enabled}
/>
```

### For Image Transforms (Zoom/Pan/Rotate)
```typescript
import { useImageTransform } from "../hooks/useImageTransform";

// In your component
const transform = useImageTransform(2); // Initial scale of 2

// Use properties
console.log(transform.scale);  // Current scale
console.log(transform.offX);   // X offset
console.log(transform.offY);   // Y offset
console.log(transform.rot);    // Rotation

// Update values
transform.setScale(3);
transform.setOffX(10);
transform.setOffY(-5);
transform.setRot(90);

// Reset everything
transform.reset();
```

### For Anomaly Operations
```typescript
import { 
  updateAnomalies, 
  deleteAnomaly, 
  editAnomaly, 
  addAnomaly 
} from "../services/anomalyService";

// Delete anomaly
const logData = await deleteAnomaly(
  transformerNo,
  inspectionNo,
  boxToDelete,
  remainingBoxes
);

// Edit anomaly coordinates
const logData = await editAnomaly(
  transformerNo,
  inspectionNo,
  boxToEdit,
  newCoords,
  allBoxes
);

// Add new anomaly
const logData = await addAnomaly(
  transformerNo,
  inspectionNo,
  newCoords,
  anomalyClass,
  allBoxes
);

// Generic update
await updateAnomalies(
  transformerNo,
  inspectionNo,
  anomalies,
  logData
);
```

### For Data Transformation
```typescript
import { 
  normalizeWeather, 
  mapAnomaliestoBoxes 
} from "../utils/inspectionHelpers";

// Normalize weather
const weather = normalizeWeather("sunny"); // Returns "SUNNY" or null

// Map API response to UI format
const boxes = mapAnomaliestoBoxes(anomaliesFromAPI);
```

---

## 📦 Component Props Quick Reference

### ImagePanelComponent
```typescript
{
  title: string;                              // Panel title
  src: string | null;                         // Image source (base64 or URL)
  which: "baseline" | "thermal";              // Image type
  boxes?: Box[];                              // Anomalies to display
  scale: number;                              // Current zoom scale
  offX: number;                               // X pan offset
  offY: number;                               // Y pan offset
  rot: number;                                // Rotation degrees
  onScaleChange: (scale: number) => void;    // Zoom callback
  onOffXChange: (offX: number) => void;      // X pan callback
  onOffYChange: (offY: number) => void;      // Y pan callback
  onRotChange: (rot: number) => void;        // Rotation callback
  onResetView: () => void;                   // Reset callback
  addDrawingActive?: boolean;                // Drawing mode enabled
  newAnomalyClass?: string;                  // Current class for drawing
  onAnnotationCreate?: (coords) => void;     // Drawing complete callback
}
```

### AnomalyCardComponent
```typescript
{
  box: Box;                                   // Anomaly data
  onReject?: () => void;                     // Reject handler
  onDelete?: () => void;                     // Delete handler
  onEdit?: () => void;                       // Edit handler
  isEditing?: boolean;                       // Currently editing
  onSave?: () => void;                       // Save edit handler
}
```

### AnomaliesListComponent
```typescript
{
  boxes: Box[];                              // All anomalies
  onReject: (anomalyIdx: number) => void;   // Reject handler
  onDelete?: (anomalyIdx: number) => void;  // Delete handler
  onEdit?: (anomalyIdx: number) => void;    // Edit handler
  editingBoxId?: number | null;              // Currently editing ID
  onSave?: (anomalyIdx: number) => void;    // Save handler
}
```

### RulesModalComponent
```typescript
{
  isOpen: boolean;                           // Modal visibility
  onClose: () => void;                       // Close handler
  tempThreshold: string;                     // Threshold value (e.g., "20%")
  onTempThresholdChange: (value: string) => void;  // Threshold change
  rule2Enabled: boolean;                     // Rule 2 enabled state
  onRule2Change: (value: boolean) => void;   // Rule 2 toggle
  rule3Enabled: boolean;                     // Rule 3 enabled state
  onRule3Change: (value: boolean) => void;   // Rule 3 toggle
}
```

---

## 🔌 Integration Example

### Setting up ImagePanel with Transform
```typescript
import { useImageTransform } from "../hooks/useImageTransform";
import { ImagePanel } from "../components/inspection/ImagePanelComponent";

export function MyInspectionPage() {
  const transform = useImageTransform(2);
  const [image, setImage] = useState<string | null>(null);

  return (
    <ImagePanel
      title="Maintenance Image"
      src={image}
      which="thermal"
      scale={transform.scale}
      offX={transform.offX}
      offY={transform.offY}
      rot={transform.rot}
      onScaleChange={transform.setScale}
      onOffXChange={transform.setOffX}
      onOffYChange={transform.setOffY}
      onRotChange={transform.setRot}
      onResetView={transform.reset}
    />
  );
}
```

### Setting up Anomaly Management
```typescript
import { AnomaliesList } from "../components/inspection/AnomaliesListComponent";
import { deleteAnomaly, editAnomaly } from "../services/anomalyService";

export function MyAnomaliesPage() {
  const [boxes, setBoxes] = useState<Box[]>([]);

  const handleDelete = async (anomalyIdx: number) => {
    const boxToDelete = boxes.find(b => b.idx === anomalyIdx);
    if (!boxToDelete) return;

    try {
      const logData = await deleteAnomaly(
        transformerNo,
        inspectionNo,
        boxToDelete,
        boxes.filter(b => b.idx !== anomalyIdx)
      );
      
      setBoxes(prev => prev.filter(b => b.idx !== anomalyIdx));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <AnomaliesList
      boxes={boxes}
      onDelete={handleDelete}
      onEdit={(idx) => { /* handle edit */ }}
      onReject={(idx) => { /* handle reject */ }}
    />
  );
}
```

---

## 🚨 Common Mistakes to Avoid

### ❌ Don't mix old and new components
```typescript
// ❌ WRONG
import { AnomalyCard } from "../components/AnomalyCard"; // OLD
import { AnomaliesListComponent } from "../components/inspection/AnomaliesListComponent"; // NEW

// ✅ CORRECT
import { AnomaliesList } from "../components/inspection/AnomaliesListComponent";
import { AnomalyCard } from "../components/inspection/AnomalyCardComponent";
```

### ❌ Don't forget type imports
```typescript
// ❌ WRONG
import { Box, FeedbackLog } from "../types/inspection.types";

// ✅ CORRECT
import type { Box, FeedbackLog } from "../types/inspection.types";
```

### ❌ Don't call updateAnomalies directly
```typescript
// ❌ WRONG - duplicates logic
const res = await fetch(url, { method: "PUT", body: formData });

// ✅ CORRECT
import { deleteAnomaly } from "../services/anomalyService";
await deleteAnomaly(transformerNo, inspectionNo, box, remaining);
```

---

## 📖 File Location Reference

| File | Purpose | Location |
|------|---------|----------|
| InspectionDetailPage.tsx | Main page orchestrator | `src/pages/` |
| AnomalyCardComponent.tsx | Single anomaly card | `src/components/inspection/` |
| AnomaliesListComponent.tsx | Anomaly list wrapper | `src/components/inspection/` |
| ImagePanelComponent.tsx | Image display with controls | `src/components/inspection/` |
| RulesModalComponent.tsx | Rules configuration modal | `src/components/inspection/` |
| useImageTransform.ts | Transform state hook | `src/hooks/` |
| anomalyService.ts | Anomaly API operations | `src/services/` |
| inspectionHelpers.ts | Utility functions | `src/utils/` |
| inspection.types.ts | TypeScript types | `src/types/` |
| inspection.constants.ts | Constants | `src/constants/` |

---

## ✨ Pro Tips

1. **Use the service layer** for all API calls - don't make fetch calls directly
2. **Use useImageTransform hook** when you need to manage image transforms
3. **Pass callbacks** to components instead of managing complex state
4. **Keep components small** - if a component does more than one thing, split it
5. **Type everything** - use TypeScript strictly for better IDE support
6. **Use clear names** - component names should describe what they render
7. **Document complex logic** - add comments for non-obvious code

---

For more details, see:
- **REFACTORING_SUMMARY.md** - Comprehensive overview
- **BEST_PRACTICES.md** - React & TypeScript patterns
