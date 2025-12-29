import {
  QueryClientProvider,
} from "@tanstack/react-query";
import ObsEdit from "components/ObsEdit/ObsEdit";
import React from "react";
import { measureRenders } from "reassure";
import { queryClient } from "tests/helpers/render";

// Mock inaturalistjs so test suite can run
jest.mock( "inaturalistjs" );

test( "Measure ObsEdit renders", async () => {
  await measureRenders(
    <QueryClientProvider client={queryClient}>
      <ObsEdit />
    </QueryClientProvider>,
  );
} );
