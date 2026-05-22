import { useQueryClient } from "@tanstack/react-query";

interface UseObsDetailsSharedLogicParams {
  skip: boolean;
}

interface UseObsDetailsSharedLogicReturn {
  // State

  // Computed
  queryClient: unknown;
  // Callbacks
}

const useObsDetailsSharedLogic = ( {
  skip,
}: UseObsDetailsSharedLogicParams ): UseObsDetailsSharedLogicReturn => {
  const queryClient = useQueryClient( );

  console.log( skip );

  return {
    // State

    // Computed
    queryClient,

    // Callbacks
  };
};

export default useObsDetailsSharedLogic;
