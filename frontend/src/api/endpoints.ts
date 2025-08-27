import client from './client';
import type { ThermalImageMeta, EnvCondition, ImageType } from '../types';
// Types from your backend
export interface Transformer {
  id?: string;             // returned from backend
  region: string;
  transformerNo: string;
  poleNo: string;
  type: string;
  locationDetails: string;
}

export const TransformersAPI = {
  // CREATE
  create: async (body: Omit<Transformer, 'id'>): Promise<any> => {
    const { data } = await client.post(
      '/transformer-thermal-inspection/transformer-data/create',
      body
    );
    return data;
  },

  // VIEW
  view: async (id: string): Promise<any> => {
    const { data } = await client.get(
      `/transformer-thermal-inspection/transformer-data/view/${id}`
    );
    return data.responseData;
  },

  // UPDATE
  update: async (body: Transformer): Promise<any> => {
    const { data } = await client.put(
      '/transformer-thermal-inspection/transformer-data/update',
      body
    );
    return data;
  },

  // DELETE
  remove: async (id: string): Promise<any> => {
    const { data } = await client.delete(
      `/transformer-thermal-inspection/transformer-data/delete/${id}`
    );
    return data;
  },

  // FILTER (list/search)
  filter: async (filters: any = {}, offset = 0, limit = 10): Promise<any> => {
    const { data } = await client.post(
      '/transformer-thermal-inspection/transformer-data/filter',
      { filterValues: filters, offset, limit }
    );
    return data.responseData;
  },
};

export const ImagesAPI = {
  uploadToTransformer: async (
    transformerId: string,
    file: File,
    type: ImageType,
    envCondition?: EnvCondition
  ): Promise<ThermalImageMeta> => {
    const form = new FormData();
    form.append('file', file);
    form.append('type', type);
    if (type === 'baseline') {
      if (!envCondition) throw new Error('envCondition is required for baseline');
      form.append('envCondition', envCondition);
    }
    const { data } = await client.post(`/api/transformers/${encodeURIComponent(transformerId)}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  listByEnv: async (envCondition: EnvCondition): Promise<ThermalImageMeta[]> => {
    const { data } = await client.get('/api/images', { params: { type: 'baseline', envCondition } });
    return data;
  }
};