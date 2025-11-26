import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInspectionsForTransformer,
  createInspection,
} from "../api/inspectionDataApi";

/**
 * Fetch and manage inspections for a transformer
 */
export function useInspections(transformerNo: string, offset = 0, limit = 10) {
  const qc = useQueryClient();
  const queryKey = ["inspections", transformerNo, offset, limit];

  const listQuery = useQuery({
    queryKey,
    queryFn: () =>
      getInspectionsForTransformer(transformerNo, offset, limit),
    enabled: !!transformerNo,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => createInspection(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
    },
  });

  return {
    ...listQuery,
    createInspection: createMutation.mutateAsync,
    creating: createMutation.isPending,
  };
}
