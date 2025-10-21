# Annotation Workflow Enhancements

## Overview
Enhanced the annotation system with improved user workflow for fault type selection, AI annotation review, and persistent save functionality.

## New Features

### 1. **Fault Type Selection During Drawing** 
**User Request:** "when manually add boundary boxes...allow user to select type of fault"

**Implementation:**
- Green panel appears in the toolbar when draw mode is active
- Dropdown selector shows all available fault types:
  - Loose Joint Faulty
  - Loose Joint Potentially Faulty
  - Point Overload Faulty
  - Point Overload Potentially Faulty
  - Full Wire Overload (Potentially Faulty)
  - Unknown
- Selected fault type is automatically applied to newly drawn annotations
- Fault type persists across multiple drawings until changed

**How to Use:**
1. Enable Edit Mode
2. Click "Draw New" button
3. Select desired fault type from the green panel dropdown
4. Draw your bounding box on the image
5. The annotation is created with the selected fault type

### 2. **Explicit Save Button**
**User Request:** "add save button...allow user to update anytime"

**Implementation:**
- Green "💾 Save Changes" button prominently displayed in edit panel
- Appears when:
  - An annotation is selected
  - A new annotation is just created (auto-opens edit panel)
- Allows updating:
  - Fault type classification
  - Comment/notes for the annotation
- Cancel button discards unsaved changes

**How to Use:**
1. Click on any annotation to select it
2. Edit panel opens automatically
3. Modify fault type or add comments
4. Click "💾 Save Changes" to persist changes
5. Or click "Cancel" to discard edits

### 3. **AI Annotation Review (Accept/Reject)**
**User Request:** "accept or reject [AI errors]...change boundary box size if needed"

**Implementation:**
- Yellow warning panel appears when AI annotation is selected
- Shows annotation status (pending/accepted/rejected)
- Two action buttons:
  - **Accept**: Marks AI detection as correct, changes status to "accepted"
  - **Reject**: Marks AI detection as incorrect, soft-deletes it (sets status to "rejected" and isDeleted=true)
- Accepted annotations remain visible and editable
- Rejected annotations are hidden from the list

**How to Use:**
1. Select an AI-detected annotation (shown with confidence %)
2. Yellow "Quick Actions" panel appears
3. Review the detection:
   - **Accept** if detection is correct
   - **Reject** if detection is wrong
4. Optionally resize/move the bounding box before accepting
5. Optionally update fault type if AI classification is wrong

### 4. **Annotation Status Tracking**
**Implementation:**
- New `status` field in Annotation type: `'pending' | 'accepted' | 'rejected'`
- All new AI detections start with status: "pending"
- Manual annotations don't have status (USER source)
- Status updates trigger history tracking

## Technical Changes

### Type Updates (types.ts)
```typescript
export type AnnotationStatus = 'pending' | 'accepted' | 'rejected';

export interface Annotation {
  // ... existing fields
  status?: AnnotationStatus; // for AI annotations: pending/accepted/rejected
  // ... rest of fields
}
```

### Component Updates

#### AnnotationToolbar.tsx
- Added `onFaultTypeChange` callback prop to communicate fault type to parent
- Added `onAcceptAnnotation` and `onRejectAnnotation` callback props
- Auto-opens edit panel when new annotation is created (`newAnnotationPending`)
- Shows fault type selector in green panel during draw mode
- Shows Accept/Reject buttons in yellow panel for AI annotations
- Enhanced save button with emoji and green styling

#### InspectionDetailPage.tsx
- Added state:
  - `newAnnotationPending`: Triggers auto-open of edit panel
  - `selectedFaultType`: Tracks currently selected fault type for drawing
- New handlers:
  - `handleAcceptAnnotation`: Updates status to "accepted"
  - `handleRejectAnnotation`: Updates status to "rejected" and soft-deletes
- Updated `handleAnnotationCreate` to:
  - Use `selectedFaultType` from toolbar
  - Set `newAnnotationPending` flag
  - Auto-select newly created annotation
- All AI detections now start with `status: "pending"`

## User Workflow Examples

### Adding a Manual Annotation
1. Upload thermal image (detection runs automatically)
2. Click "Enable Edit Mode"
3. Click "Draw New"
4. Select fault type from green dropdown (e.g., "Point Overload Faulty")
5. Draw bounding box on image
6. Edit panel opens automatically
7. Add any comments
8. Click "💾 Save Changes"

### Reviewing AI Detections
1. AI detections appear with confidence % after upload
2. Each detection has status: "pending"
3. Select an AI detection
4. Yellow "Quick Actions" panel shows:
   - Current status
   - Accept/Reject buttons
5. If bounding box needs adjustment:
   - Resize using corner/edge handles
   - Move by dragging
6. If classification is wrong:
   - Change fault type in edit panel
   - Click "💾 Save Changes"
7. Click "Accept" to confirm or "Reject" to remove

### Editing Existing Annotations
1. Click on any annotation (AI or manual)
2. Edit panel opens
3. Modify as needed:
   - Change fault type
   - Update comments
   - Resize/move bounding box
4. Click "💾 Save Changes" when done
5. Or "Cancel" to discard changes

## Visual Indicators

### Color Coding
- **Green Panel**: Active drawing mode - select fault type
- **Yellow Panel**: AI annotation selected - review needed
- **Green Button**: Save action - confirms changes
- **Blue Border**: Selected annotation
- **Confidence Badge**: AI detections show % confidence

### Bounding Box Handles
- **Corners**: Resize diagonally
- **Edges**: Resize in one direction
- **Inside Box**: Move entire annotation
- **Hover**: Cursor changes to indicate action

## Backend Requirements

The following API endpoints should support the new status field:

```typescript
// Save/Update annotation with status
POST /api/annotations
PUT /api/annotations/:id
{
  // ... existing fields
  status?: 'pending' | 'accepted' | 'rejected'
}

// Response should include status
{
  responseCode: "2000",
  responseData: {
    // ... existing annotation fields
    status: 'accepted' // or 'pending' / 'rejected'
  }
}
```

## Benefits

1. **Faster Workflow**: Fault type selection during drawing eliminates extra step
2. **Better Accuracy**: Accept/reject workflow ensures AI detections are reviewed
3. **Clear Status**: Visual indicators show what needs review vs. confirmed
4. **Audit Trail**: Status changes tracked in annotation history
5. **Flexibility**: Can still edit annotations anytime, even after accepting

## Future Enhancements

Potential improvements:
- Batch accept/reject for multiple AI detections
- Confidence threshold filtering (show only low-confidence for review)
- Statistics dashboard (% accepted/rejected by fault type)
- Export reviewed annotations for model retraining
- Keyboard shortcuts for accept/reject (A/R keys)
