import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TransformersAPI, type Transformer } from '../api/endpoints';

export function useTransformers() {
  const qc = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['transformers'],
    queryFn: () => TransformersAPI.filter([], 0, 1000), // ✅ fetch all, paginate locally
  });

  const createMutation = useMutation({
    mutationFn: (body: Omit<Transformer, 'id'>) => TransformersAPI.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transformers'] }),
  });

  const updateMutation = useMutation({
    mutationFn: (body: Transformer) => TransformersAPI.update(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transformers'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => TransformersAPI.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transformers'] }),
  });

  return {
    ...listQuery,
    createTransformer: createMutation.mutateAsync,
    updateTransformer: updateMutation.mutateAsync,
    deleteTransformer: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    deleting: deleteMutation.isPending,
  };
}
