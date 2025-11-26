export type EnvCondition = "sunny" | "cloudy" | "rainy";

export interface Transformer {
  id: string;
  location: string;
  capacity: number;
}

export type ImageType = "baseline" | "thermal";

export interface ThermalImageMeta {
  id: string;
  transformerId: string;
  url: string;
  type: ImageType;
  envCondition?: EnvCondition;
  createdAt: string;
}