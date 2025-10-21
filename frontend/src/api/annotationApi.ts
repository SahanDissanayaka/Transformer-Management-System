import apiClient from "./client";
import type { Annotation, AnnotationAction } from "../types";

export interface SaveAnnotationRequest {
  transformerId: string;
  inspectionId: string;
  imageId?: string;
  bbox: [number, number, number, number];
  polygon?: Array<[number, number]>;
  shape?: 'bbox' | 'polygon';
  className: string;
  confidence?: number;
  source: "AI" | "USER";
  annotationType: string;
  comment?: string;
  userId: string;
  userName?: string;
}

export interface UpdateAnnotationRequest {
  annotationId: string;
  bbox?: [number, number, number, number];
  polygon?: Array<[number, number]>;
  shape?: 'bbox' | 'polygon';
  className?: string;
  comment?: string;
  userId: string;
  userName?: string;
}

export interface DeleteAnnotationRequest {
  annotationId: string;
  userId: string;
  userName?: string;
  comment?: string;
}

export interface AnnotationResponse {
  responseCode: string;
  responseDescription: string;
  responseData?: Annotation;
}

export interface AnnotationsListResponse {
  responseCode: string;
  responseDescription: string;
  responseData?: {
    annotations: Annotation[];
    totalCount: number;
  };
}

export interface AnnotationHistoryResponse {
  responseCode: string;
  responseDescription: string;
  responseData?: {
    actions: AnnotationAction[];
  };
}

/**
 * Get all annotations for a specific inspection
 */
export async function getAnnotations(
  transformerId: string,
  inspectionId: string
): Promise<AnnotationsListResponse> {
  try {
    const response = await apiClient.get(
      `/transformers/${transformerId}/inspections/${inspectionId}/annotations`
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch annotations:", error);
    return {
      responseCode: "5000",
      responseDescription: error.message || "Failed to fetch annotations",
    };
  }
}

/**
 * Save a new annotation
 */
export async function saveAnnotation(
  request: SaveAnnotationRequest
): Promise<AnnotationResponse> {
  try {
    const response = await apiClient.post(
      `/transformers/${request.transformerId}/inspections/${request.inspectionId}/annotations`,
      {
        bbox: request.bbox,
        polygon: request.polygon,
        shape: request.shape,
        className: request.className,
        confidence: request.confidence,
        source: request.source,
        annotationType: request.annotationType,
        comment: request.comment,
        userId: request.userId,
        userName: request.userName,
        timestamp: new Date().toISOString(),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to save annotation:", error);
    return {
      responseCode: "5000",
      responseDescription: error.message || "Failed to save annotation",
    };
  }
}

/**
 * Update an existing annotation
 */
export async function updateAnnotation(
  request: UpdateAnnotationRequest
): Promise<AnnotationResponse> {
  try {
    const response = await apiClient.put(
      `/annotations/${request.annotationId}`,
      {
        bbox: request.bbox,
        polygon: request.polygon,
        shape: request.shape,
        className: request.className,
        comment: request.comment,
        userId: request.userId,
        userName: request.userName,
        timestamp: new Date().toISOString(),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to update annotation:", error);
    return {
      responseCode: "5000",
      responseDescription: error.message || "Failed to update annotation",
    };
  }
}

/**
 * Delete an annotation (soft delete - marks as deleted)
 */
export async function deleteAnnotation(
  request: DeleteAnnotationRequest
): Promise<AnnotationResponse> {
  try {
    const response = await apiClient.delete(`/annotations/${request.annotationId}`, {
      data: {
        userId: request.userId,
        userName: request.userName,
        comment: request.comment,
        timestamp: new Date().toISOString(),
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to delete annotation:", error);
    return {
      responseCode: "5000",
      responseDescription: error.message || "Failed to delete annotation",
    };
  }
}

/**
 * Get annotation history (all actions taken on an annotation)
 */
export async function getAnnotationHistory(
  annotationId: string
): Promise<AnnotationHistoryResponse> {
  try {
    const response = await apiClient.get(`/annotations/${annotationId}/history`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch annotation history:", error);
    return {
      responseCode: "5000",
      responseDescription: error.message || "Failed to fetch annotation history",
    };
  }
}

/**
 * Bulk save annotations (useful for initial AI detection results)
 */
export async function bulkSaveAnnotations(
  transformerId: string,
  inspectionId: string,
  annotations: Omit<SaveAnnotationRequest, "transformerId" | "inspectionId">[]
): Promise<AnnotationsListResponse> {
  try {
    const response = await apiClient.post(
      `/transformers/${transformerId}/inspections/${inspectionId}/annotations/bulk`,
      {
        annotations,
        timestamp: new Date().toISOString(),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to bulk save annotations:", error);
    return {
      responseCode: "5000",
      responseDescription: error.message || "Failed to bulk save annotations",
    };
  }
}
