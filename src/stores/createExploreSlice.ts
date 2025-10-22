import { ExploreSlice, StoreSlice } from "./types";

const DEFAULT_STATE = {
  exploreView: "observations"
};

const createExploreSlice: StoreSlice<ExploreSlice> = set => ( {
  ...DEFAULT_STATE,
  setExploreView: exploreView => set( ( ) => ( { exploreView } ) )
} );

export default createExploreSlice;
