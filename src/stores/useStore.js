import { create } from "zustand";

import createExploreSlice from "./createExploreSlice";
import createObservationFlowSlice from "./createObservationFlowSlice";

// Using slices to separate store for Explore and Observation creation flow
// https://docs.pmnd.rs/zustand/guides/slices-pattern
const useStore = create( ( ...a ) => ( {
  ...createExploreSlice( ...a ),
  ...createObservationFlowSlice( ...a )
} ) );

export default useStore;
