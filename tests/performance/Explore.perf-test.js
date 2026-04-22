import {
  QueryClientProvider,
} from "@tanstack/react-query";
import RootExploreContainer from "components/Explore/RootExploreContainer";
import React from "react";
import { measureRenders } from "reassure";
import { queryClient } from "tests/helpers/render";

// Mock inaturalistjs so test suite can run
jest.mock( "inaturalistjs" );

test( "Measure Explore renders", async () => {
  await measureRenders(
    <QueryClientProvider client={queryClient}>
      <RootExploreContainer />
    </QueryClientProvider>,
  );
} );
