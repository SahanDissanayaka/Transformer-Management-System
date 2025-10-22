# Transformer Inspection System - Annotation Module

## Description

The Transformer Inspection System's annotation module is a web-based tool designed for analyzing and annotating thermal images of transformers. It enables users to work with both baseline and thermal inspection images, supporting AI-assisted anomaly detection and manual annotation capabilities.

### Key Features

- **Dual Image Display**: Side-by-side viewing of baseline and thermal images
- **AI-Assisted Anomaly Detection**: Automatic detection of potential faults
- **Manual Annotation Tools**: User-driven annotation capabilities
- **Feedback Logging System**: Tracks modifications to AI detections for model improvement
- **Interactive Image Controls**: Pan, zoom, and rotate functionalities

## Annotation System

### Types of Annotations

1. **AI-Detected Anomalies**

   - Automatically detected by the AI model
   - Includes confidence scores
   - Can be modified or deleted by users
   - Modifications are logged for model improvement

2. **User-Added Anomalies**
   - Manually drawn by users
   - Supports multiple fault types:
     - Loose Joint Faulty
     - Loose Joint Potentially Faulty
     - Point Overload Faulty
     - Point Overload Potentially Faulty
     - Full Wire Overload (Potentially Faulty)

### Annotation Features

- **Bounding Box Drawing**: Click and drag interface for defining anomaly areas
- **Class Selection**: Dropdown menu for selecting fault types
- **Confidence Display**: Shows AI confidence scores for detected anomalies
- **Edit Capabilities**: Modify existing annotations
- **Delete Function**: Remove incorrect or outdated annotations

## Backend Structure

### API Endpoints

1. **Image Data Management**

   ```
   GET /transformer-thermal-inspection/image-data/view
   - Parameters: transformerNo, inspectionNo, type
   - Returns: Image data, annotations, and feedback logs

   PUT /transformer-thermal-inspection/image-data/update
   - Parameters: transformerNo, inspectionNo
   - Body: FormData containing type, detectionJson, logs
   ```

### Data Structure

1. **Anomaly Object**

   ```typescript
   {
     box: [number, number, number, number], // Normalized coordinates
     class: string,                         // Fault type
     manual: boolean,                       // Whether user-added
     confidence?: number,                   // AI confidence score
     user?: string                          // User who modified/added
   }
   ```

2. **Feedback Log Object**
   ```typescript
   {
     imageId: string,                       // transformerNo_inspectionNo
     // For AI-detected anomalies
     originalAIDetection?: {
       box: [number, number, number, number],
       class: string,
       confidence: number
     },
     userModification?: {
       action: "modified" | "deleted",
       finalBox?: [number, number, number, number],
       finalClass?: string,
       modifiedAt: string,
       modifiedBy: string
     },
     // For user-added anomalies
     userAddition?: {
       box: number[],
       class: string,
       addedAt: string,
       addedBy: string
     }
   }
   ```

### Data Persistence

- Annotations are stored in the backend database
- Each annotation is linked to specific transformer and inspection IDs
- Feedback logs are maintained for tracking AI model improvements
- Images are stored with associated metadata (datetime, weather conditions)

## Known Limitations and Bugs

1. **Image Size Limitations**

   - Maximum supported image size depends on browser limitations
   - Large images may cause performance issues

2. **Annotation Limitations**

   - Only rectangular bounding boxes are supported
   - No support for polygon or freeform annotations
   - Cannot annotate overlapping areas with different fault types

3. **UI Considerations**

   - Zoom level resets when switching between images
   - Canvas size is fixed at 360px height
   - Initial scale is set to 1.6x for better visibility

4. **Performance Notes**

   - Heavy images might cause lag during pan/zoom operations
   - Multiple concurrent annotations might affect performance

5. **Data Handling**
   - Feedback logs require proper JSON parsing when received from backend
   - Initial image load might be slow for high-resolution images

## Future Improvements

1. **Annotation Enhancements**

   - Support for polygon annotations
   - Multi-class annotations for overlapping areas
   - Annotation templates for common patterns

2. **UI Improvements**

   - Responsive canvas size
   - Synchronized zoom between baseline and thermal images
   - Better touch device support

3. **Performance Optimizations**

   - Image compression for large files
   - Lazy loading for historical data
   - Cached annotations for frequently accessed images

4. **Data Management**
   - Batch export of annotations
   - Automated backup of user modifications
   - Version control for annotations

## System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Minimum screen resolution: 1280x720
- Stable internet connection for real-time updates
