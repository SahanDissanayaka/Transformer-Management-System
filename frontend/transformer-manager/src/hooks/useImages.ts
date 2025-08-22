import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagesAPI } from '../api/endpoints';
import type { EnvCondition, ImageType, ThermalImageMeta } from '../types';


export function useBaselineByEnv(env: EnvCondition) {
return useQuery<ThermalImageMeta[]>({
queryKey: ['images', 'baseline', env],
queryFn: () => ImagesAPI.listByEnv(env),
});
}


export function useUploadImage(transformerId?: string) {
const qc = useQueryClient();
return useMutation({
mutationFn: ({ file, type, envCondition }: { file: File; type: ImageType; envCondition?: EnvCondition }) => {
if (!transformerId) throw new Error('transformerId required');
return ImagesAPI.uploadToTransformer(transformerId, file, type, envCondition);
},
onSuccess: () => {
qc.invalidateQueries();
}
});
}