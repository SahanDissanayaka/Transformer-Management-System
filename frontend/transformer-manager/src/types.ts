export type EnvCondition = 'sunny' | 'cloudy' | 'rainy';


export interface Transformer {
id: string; // business ID provided by admin
location: string;
capacity: number; // kVA or MVA
}


export type ImageType = 'baseline' | 'maintenance';


export interface ThermalImageMeta {
id: string;
transformerId: string;
url: string; // served by backend or CDN
type: ImageType;
envCondition?: EnvCondition; // required if type === 'baseline'
createdAt: string;
}