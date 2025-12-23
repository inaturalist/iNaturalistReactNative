import type { StateCreator } from "zustand";

const DEFAULT_STATE = {
  exploreView: "observations",
};

interface ExploreSlice {
  exploreView: string;
  setExploreView: ( _view: string ) => void;
}

const createExploreSlice: StateCreator<ExploreSlice> = set => ( {
  ...DEFAULT_STATE,
  setExploreView: exploreView => set( ( ) => ( { exploreView } ) ),
} );

export default createExploreSlice;
