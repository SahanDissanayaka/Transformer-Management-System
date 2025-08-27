import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInspectionsForTransformer, createInspection } from "../api/inspectionApi";

export function useInspections(transformerNo: string, offset = 0, limit = 10) {
  const qc = useQueryClient();

  const queryKey = ["inspections", transformerNo, offset, limit];

  const listQuery = useQuery({
    queryKey,
    queryFn: () => getInspectionsForTransformer(transformerNo, offset, limit),
    enabled: !!transformerNo, // Only run if transformerNo exists
    staleTime: 0,             // Always fetch fresh
    refetchOnWindowFocus: true,
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => createInspection(body),
    onSuccess: () => {
      console.log("✅ Mutation success, refetching inspections");
      qc.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      console.error("❌ Mutation error:", error);
    },
  });

  return {
    ...listQuery,
    createInspection: createMutation.mutateAsync,
    creating: createMutation.isPending,
  };
}
