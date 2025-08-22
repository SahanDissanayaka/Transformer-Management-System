import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TransformersAPI, type Transformer } from '../api/endpoints';

export function useTransformers() {
  const qc = useQueryClient();

  // Instead of GET /api/transformers, we use filter API
  const listQuery = useQuery({
    queryKey: ['transformers'],
    queryFn: () => TransformersAPI.filter([], 0, 20), // no filters = all
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
