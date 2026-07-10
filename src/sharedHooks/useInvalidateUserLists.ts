import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

// Following/followers lists are fetched via useInfiniteUserScroll, which nests
// the query key as [queryKey, baseParams], so the effective key is
// [["fetchUsers", ...], baseParams]. Invalidating with the nested [["fetchUsers"]]
// prefix refreshes those lists so a followed/unfollowed user appears/disappears.
const useInvalidateUserLists = ( ) => {
  const queryClient = useQueryClient( );
  return useCallback(
    ( ) => queryClient.invalidateQueries( { queryKey: [["fetchUsers"]] } ),
    [queryClient],
  );
};

export default useInvalidateUserLists;
