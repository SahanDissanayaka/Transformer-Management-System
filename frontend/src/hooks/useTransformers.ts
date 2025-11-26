import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TransformerAPI } from "../api/transformerDataApi";
import type { Transformer } from "../types";

/**
 * Manage transformer CRUD operations with React Query
 */
export function useTransformers() {
  const qc = useQueryClient();
  const queryKey = ["transformers"];

  const listQuery = useQuery({
    queryKey,
    queryFn: () => TransformerAPI.filter([], 0, 1000),
  });

  const createMutation = useMutation({
    mutationFn: (body: Omit<Transformer, "id">) =>
      TransformerAPI.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const updateMutation = useMutation({
    mutationFn: (body: Transformer) => TransformerAPI.update(body),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => TransformerAPI.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
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
