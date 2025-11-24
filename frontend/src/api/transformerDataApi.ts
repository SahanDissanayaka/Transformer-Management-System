import client from "./client";
import type { Transformer } from "../types";

const BASE_PATH = "/transformer-thermal-inspection/transformer-data";


export const TransformerAPI = {

  create: async (body: Omit<Transformer, "id">): Promise<any> => {
    const { data } = await client.post(`${BASE_PATH}/create`, body);
    return data;
  },

  view: async (id: string): Promise<any> => {
    const { data } = await client.get(`${BASE_PATH}/view/${id}`);
    return data.responseData;
  },

  update: async (body: Transformer): Promise<any> => {
    const { data } = await client.put(`${BASE_PATH}/update`, body);
    return data;
  },

  delete: async (id: string): Promise<any> => {
    const { data } = await client.delete(`${BASE_PATH}/delete/${id}`);
    return data;
  },

  filter: async (filters: any = {}, offset = 0, limit = 10): Promise<any> => {
    const { data } = await client.post(`${BASE_PATH}/filter`, {
      filterValues: filters,
      offset,
      limit,
    });
    return data.responseData;
  },
};
