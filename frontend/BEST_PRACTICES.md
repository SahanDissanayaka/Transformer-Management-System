# React & TypeScript Best Practices Applied

## Overview
This document outlines the best practices implemented during the refactoring of the Inspection Detail Page.

---

## 1. Component Architecture

### ✅ Single Responsibility Principle
**What:** Each component has exactly one reason to change
**Examples:**
- `AnomalyCardComponent`: Only displays a single anomaly card
- `ImagePanelComponent`: Only handles image display and transform controls
- `RulesModalComponent`: Only manages rules configuration UI

**Benefits:**
- Easier to understand
- Easier to test
- Easier to modify

### ✅ Composition Over Inheritance
**What:** Build complex UIs from simple, focused components
**Example:**
```typescript
// Instead of a mega-component with everything
// We have: AnomaliesList → AnomalyCard
```

### ✅ Props-Driven Configuration
**What:** Pass configuration through props, not globals
**Example:**
```typescript
interface ImagePanelProps {
  title: string;
  src: string | null;
  which: "baseline" | "thermal";
  scale: number;
  onScaleChange: (scale: number) => void;
  // ... more props
}
```

**Benefits:**
- Component reusability
- Easy testing
- Clear dependencies

---

## 2. State Management

### ✅ Custom Hooks for Reusable State
**Pattern:** `useImageTransform`
```typescript
const transform = useImageTransform(2);
// Returns: { scale, setScale, offX, setOffX, offY, setOffY, rot, setRot, reset }
```

**When to use:**
- Stateful logic shared between components
- Complex state with related setters
- Need for reset functionality

**Benefits:**
- No prop drilling
- Easier to test
- Reusable logic

### ✅ Local Component State
**Pattern:** `useState` for component-specific state
```typescript
const [expanded, setExpanded] = useState(false);
const [notes, setNotes] = useState("");
```

**Rules:**
- Use when state affects only one component
- Use for UI state (expanded, loading, etc.)
- Keep state close to where it's used

### ✅ Derived State Avoidance
**Anti-pattern:**
```typescript
// ❌ Don't do this
const [firstName, setFirstName] = useState("John");
const [lastName, setLastName] = useState("Doe");
const [fullName, setFullName] = useState(""); // Derived state!
```

**Pattern:**
```typescript
// ✅ Do this instead
const [firstName, setFirstName] = useState("John");
const [lastName, setLastName] = useState("Doe");
const fullName = `${firstName} ${lastName}`; // Computed
```

---

## 3. TypeScript Best Practices

### ✅ Type-Only Imports (verbatimModuleSyntax)
**Pattern:**
```typescript
// ✅ Correct for types only
import type { Box, FeedbackLog } from "../types/inspection.types";

// ✅ Correct for values
import { normalizeWeather } from "../utils/inspectionHelpers";
```

**Why:** Better tree-shaking, smaller bundle size

### ✅ Strict Interface Definitions
**Pattern:**
```typescript
interface ImagePanelProps {
  title: string;
  src: string | null;
  which: "baseline" | "thermal";
  boxes?: Box[]; // Optional property
  // ... more typed properties
}
```

**Benefits:**
- IDE autocomplete
- Type checking
- Self-documenting code

### ✅ Discriminated Unions
**Pattern:**
```typescript
export type FeedbackLog =
  | {
      imageId: string;
      originalAIDetection: { /* ... */ };
      userModification: { /* ... */ };
    }
  | {
      imageId: string;
      userAddition: { /* ... */ };
    };
```

**Benefits:**
- Type-safe pattern matching
- Exhaustive checking
- Clear intent

---

## 4. Function Design

### ✅ Pure Functions
**Pattern:** Functions that don't cause side effects
```typescript
// ✅ Pure function
function normalizeWeather(w: unknown): Weather | null {
  if (!w || typeof w !== "string") return null;
  const u = w.trim().toUpperCase();
  return u === "SUNNY" || u === "CLOUDY" || u === "RAINY" ? (u as Weather) : null;
}

// ✅ Easy to test
expect(normalizeWeather("sunny")).toBe("SUNNY");
```

### ✅ Callback Pattern
**Pattern:** Functions that modify parent state
```typescript
interface AnomalyCardProps {
  box: Box;
  onReject?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

// Usage
<AnomalyCard
  box={anomaly}
  onDelete={() => handleDelete(anomaly.idx)}
/>
```

**Benefits:**
- No prop drilling
- Easy to handle multiple operations
- Clear action names

### ✅ Async Error Handling
**Pattern:**
```typescript
try {
  const logData = await editAnomaly(/* ... */);
  // Update UI only on success
  setThermalMeta(prev => ({ ...prev, boxes: updatedBoxes }));
  setFeedbackLog(prev => [...prev, logData]);
} catch (err) {
  console.error(err);
  alert("Error updating anomaly");
  // Optionally rollback UI changes
}
```

---

## 5. Service Layer

### ✅ Separation of Concerns
**Pattern:** Business logic in services, UI in components

**Service Layer (`anomalyService.ts`):**
```typescript
// Handles all API logic
export async function updateAnomalies(
  transformerNo: string,
  inspectionNo: string,
  anomalies: AnomalyPayload[],
  logs?: FeedbackLog | null
): Promise<void> {
  const url = `${API_BASE}/image-data/update?...`;
  const formData = new FormData();
  // ... API logic
}
```

**Component:**
```typescript
// Uses service, focuses on UI
try {
  await updateAnomalies(transformerNo, inspectionNo, anomalies);
  // Update UI
} catch (err) {
  // Handle error
}
```

**Benefits:**
- Easy to test
- Easy to mock
- Reusable logic
- API changes isolated to service

---

## 6. React Patterns

### ✅ Controlled Components
**Pattern:**
```typescript
<input
  type="file"
  onChange={(e) => {
    const f = e.target.files?.[0] ?? null;
    setBaselineFile(f); // State in parent
  }}
/>
```

### ✅ Conditional Rendering
**Good pattern:**
```typescript
// ✅ Readable
{detectionRan ? (
  <div>No detected errors.</div>
) : (
  <div>No detection run yet.</div>
)}
```

**Avoid:**
```typescript
// ❌ Harder to read
{detectionRan && <div>No detected errors.</div>}
{!detectionRan && <div>No detection run yet.</div>}
```

### ✅ Event Handling
**Pattern:**
```typescript
const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
  if (e.button && e.button !== 0) return; // Only left click
  // ... handle event
};
```

---

## 7. Performance Optimizations

### ✅ Callback Memoization (When Needed)
**Pattern:**
```typescript
const mapAnomaliestoBoxes = useCallback((anomalies: AnomalyResponse[]): Box[] => {
  return anomalies.map((a, i: number) => {
    // ... mapping logic
  });
}, []); // Memoized with empty deps
```

### ✅ Component Splitting
**Pattern:** Split large components into smaller ones
```
InspectionDetailPage (orchestrator)
├── ImagePanel (reusable)
├── AnomaliesList
│   └── AnomalyCard
└── RulesModal
```

**Benefits:**
- Easier to optimize
- Can apply React.memo if needed
- Smaller re-render scope

---

## 8. File Organization

### ✅ Logical Folder Structure
```
src/
├── components/          # UI components
│   └── inspection/      # Feature-specific components
├── pages/              # Page-level components
├── services/           # Business logic
├── hooks/              # Custom hooks
├── utils/              # Utility functions
├── types/              # TypeScript types
├── constants/          # Constants
└── api/                # API client
```

**Benefits:**
- Easy to find code
- Clear boundaries
- Scalable structure

### ✅ Naming Conventions
**Components:** `PascalCase` ending in `Component`
```
AnomalyCardComponent.tsx
AnomaliesListComponent.tsx
ImagePanelComponent.tsx
```

**Hooks:** `use` prefix
```
useImageTransform.ts
useImages.ts
```

**Services:** Action-based names
```
anomalyService.ts
```

**Utils:** Function-based names
```
inspectionHelpers.ts
anomalyMappers.ts
```

---

## 9. Error Handling

### ✅ User-Friendly Messages
```typescript
try {
  const res = await fetch(url, { method: "PUT", body: formData });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update anomalies: ${errorText}`);
  }
} catch (err) {
  const error = err as { response?: { data?: { message?: string } }; message?: string };
  setErrorMsg(error?.message || "Update failed");
}
```

### ✅ Validation
```typescript
if (!transformerNo || !inspectionNo) {
  setErrorMsg("Missing transformer/inspection id.");
  return;
}

if (!file) {
  setErrorMsg(`Please choose a ${which.toLowerCase()} image first.`);
  return;
}
```

---

## 10. Documentation

### ✅ Clear Comments for Complex Logic
```typescript
// Load feedback logs to track anomaly modifications
const loadFeedbackLogs = useCallback(async () => {
  // Implementation
}, [transformerNo, inspectionNo]);
```

### ✅ Self-Documenting Code
```typescript
// Instead of: const x = f ? true : false
// Do this:
const isEditingBox = editingBoxId !== null;

// Instead of: onClick={() => { /* 10 lines of code */ }}
// Extract to named handler:
const handleAnomalyEdit = (anomalyIdx: number) => {
  setEditingBoxId(anomalyIdx);
  setAddDrawingActive(true);
};
```

---

## Summary of Key Principles

| Principle | Application |
|-----------|------------|
| SRP | One component per responsibility |
| DRY | Shared logic in hooks/services |
| KISS | Simple, readable code |
| SOLID | Interface-based design |
| Composition | Small focused components |
| Type Safety | Strict TypeScript usage |
| Separation of Concerns | Components, hooks, services |
| Error Handling | Try-catch with user messages |
| Performance | Code splitting and memoization |
| Documentation | Clear naming and comments |

---

## Quick Reference Checklist

When creating new features, ensure:

- [ ] Component has single responsibility
- [ ] Props are typed with interfaces
- [ ] Type imports use `type` keyword
- [ ] Callback functions have clear names
- [ ] Async operations have error handling
- [ ] Component is in appropriate folder
- [ ] No duplicate state
- [ ] Complex logic extracted to services/hooks
- [ ] Comments for non-obvious code
- [ ] Proper naming conventions followed
