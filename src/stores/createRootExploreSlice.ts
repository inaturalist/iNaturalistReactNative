import { StateCreator } from "zustand";

const DEFAULT_STATE = {
  rootStoredParams: {},
  rootExploreView: "observations"
};

interface RootExploreSlice {
  rootStoredParams: Object,
  setRootStoredParams: ( _params: Object ) => void,
  rootExploreView: string,
  setRootExploreView: ( _view: string ) => void
}

const createRootExploreSlice: StateCreator<RootExploreSlice> = set => ( {
  ...DEFAULT_STATE,
  setRootStoredParams: rootStoredParams => set( ( ) => ( { rootStoredParams } ) ),
  setRootExploreView: rootExploreView => set( ( ) => ( { rootExploreView } ) )
} );

export default createRootExploreSlice;
