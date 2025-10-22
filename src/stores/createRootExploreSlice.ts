import { RootExploreSlice, StoreSlice } from "./types";

const DEFAULT_STATE = {
  rootStoredParams: {},
  rootExploreView: "observations"
};

const createRootExploreSlice: StoreSlice<RootExploreSlice> = set => ( {
  ...DEFAULT_STATE,
  setRootStoredParams: rootStoredParams => set( ( ) => ( { rootStoredParams } ) ),
  setRootExploreView: rootExploreView => set( ( ) => ( { rootExploreView } ) )
} );

export default createRootExploreSlice;
