import type { Weather } from "../api/imageDataApi";

export interface Box {
  n: [number, number, number, number];
  color: string;
  idx: number;
  klass: string;
  conf: number;
  aiDetected?: boolean;
  rejectedBy?: string;
  rejectedAt?: string;
  userAdded?: boolean;
}

export interface ThermalMeta {
  dateTime?: string;
  weather?: Weather | null;
  boxes?: Box[];
}

export interface AnomalyResponse {
  box: number[];
  class: string;
  confidence?: number;
  conf?: number;
  manual?: boolean;
  rejectedBy?: string;
  rejectedAt?: string;
}

export type FeedbackLog =
  | {
      imageId: string;
      originalAIDetection: {
        box: [number, number, number, number];
        class: string;
        confidence: number;
      };
      userModification: {
        action: "modified" | "deleted";
        finalBox?: [number, number, number, number];
        finalClass?: string;
        modifiedAt: string;
        modifiedBy: string;
      };
    }
  | {
      imageId: string;
      userAddition: {
        box: number[];
        class: string;
        addedAt: string;
        addedBy: string;
      };
    };

export interface NoteItem {
  text: string;
  by: string;
  at: string;
}
