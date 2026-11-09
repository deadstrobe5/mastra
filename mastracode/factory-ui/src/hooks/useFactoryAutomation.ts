import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useApiConfig } from '../api/config';
import { queryKeys } from '../api/keys';
import { updateFactoryAutomation } from '../ui/domains/workspaces/services/github';

/** Turn the review test commit check on or off. The board's phases own every other automation. */
export function useSetReviewTestChecksMutation(factoryProjectId: string) {
  const { baseUrl } = useApiConfig();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) =>
      updateFactoryAutomation(baseUrl, factoryProjectId, { reviewTestChecksEnabled: enabled }),
    onSuccess: project => {
      queryClient.setQueryData(queryKeys.factoryProject(factoryProjectId), project);
      void queryClient.invalidateQueries({ queryKey: queryKeys.factories() });
    },
  });
}
