import apiClient from './client';

export interface MaintenanceRecord {
  id?: number;
  inspectionId: number;
  // Transformer and inspection details
  transformerNo?: string;
  branch?: string;
  inspectionDate?: string;
  time?: string;
  // Maintenance form fields
  poleNo?: string;
  locationDetails?: string;
  type?: string;
  inspected?: string;
  irLeft?: string;
  irRight?: string;
  irFront?: string;
  lastMonthKva?: string;
  lastMonthDate?: string;
  lastMonthTime?: string;
  currentMonthKva?: string;
  serial?: string;
  meterCtRatio?: string;
  make?: string;
  startTime?: string;
  completionTime?: string;
  supervisedBy?: string;
  techI?: string;
  techII?: string;
  techIII?: string;
  helpers?: string;
  inspectedBy?: string;
  inspectedByDate?: string;
  reflectedBy?: string;
  reflectedByDate?: string;
  reInspectedBy?: string;
  reInspectedByDate?: string;
  css?: string;
  cssDate?: string;
}

export interface MaintenanceRecordResponse {
  responseCode: number;
  responseDescription: string;
  responseData?: MaintenanceRecord | MaintenanceRecord[];
}

export const maintenanceApi = {
  // Save a new maintenance record
  save: async (record: MaintenanceRecord): Promise<MaintenanceRecordResponse> => {
    const response = await apiClient.post<MaintenanceRecordResponse>(
      '/api/maintenanceRecord/save',
      record
    );
    return response.data;
  },

  // Update an existing maintenance record
  update: async (record: MaintenanceRecord): Promise<MaintenanceRecordResponse> => {
    const response = await apiClient.put<MaintenanceRecordResponse>(
      '/api/maintenanceRecord/update',
      record
    );
    return response.data;
  },

  // Get maintenance record by ID
  getById: async (id: number): Promise<MaintenanceRecordResponse> => {
    const response = await apiClient.get<MaintenanceRecordResponse>(
      `/api/maintenanceRecord/${id}`
    );
    return response.data;
  },

  // Get maintenance records by inspection ID
  getByInspectionId: async (inspectionId: number): Promise<MaintenanceRecordResponse> => {
    const response = await apiClient.get<MaintenanceRecordResponse>(
      `/api/maintenanceRecord/inspection/${inspectionId}`
    );
    return response.data;
  },

  // Delete maintenance record
  delete: async (id: number): Promise<MaintenanceRecordResponse> => {
    const response = await apiClient.delete<MaintenanceRecordResponse>(
      `/api/maintenanceRecord/${id}`
    );
    return response.data;
  },
};
