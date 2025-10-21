export type EnvCondition = 'sunny' | 'cloudy' | 'rainy';


export interface Transformer {
id: string; // business ID provided by admin
location: string;
capacity: number; // kVA or MVA
}


export type ImageType = 'baseline' | 'thermal';


export interface ThermalImageMeta {
id: string;
transformerId: string;
url: string; // served by backend or CDN
type: ImageType;
envCondition?: EnvCondition; // required if type === 'baseline'
createdAt: string;
}

// Annotation types for FR3.1 & FR3.2
export type AnnotationType = 'AI_DETECTED' | 'MANUAL_ADDED' | 'EDITED' | 'DELETED';
export type AnnotationSource = 'AI' | 'USER';
export type AnnotationStatus = 'pending' | 'accepted' | 'rejected';

export interface AnnotationMetadata {
  userId?: string;
  userName?: string;
  timestamp: string;
  actionType: AnnotationType;
  comment?: string;
}

export type AnnotationShape = 'bbox' | 'polygon';

export interface Annotation {
  id: string; // unique identifier
  transformerId: string;
  inspectionId: string;
  imageId?: string;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2] normalized coords
  // Optional polygon points (normalized [0..1] pairs). When present, bbox is the polygon's bounding box.
  polygon?: Array<[number, number]>;
  shape?: AnnotationShape; // default 'bbox' if omitted
  className: string;
  confidence?: number; // for AI detections
  color: string;
  source: AnnotationSource;
  annotationType: AnnotationType;
  status?: AnnotationStatus; // for AI annotations: pending/accepted/rejected
  createdBy: string;
  createdAt: string;
  modifiedBy?: string;
  modifiedAt?: string;
  comment?: string;
  isDeleted: boolean;
  history?: AnnotationMetadata[]; // track all changes
}

export interface AnnotationAction {
  annotationId: string;
  actionType: AnnotationType;
  userId: string;
  userName?: string;
  timestamp: string;
  comment?: string;
  previousState?: Partial<Annotation>;
  newState?: Partial<Annotation>;
}