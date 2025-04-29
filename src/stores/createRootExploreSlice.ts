import { StateCreator } from "zustand";

const DELTA = 0.2;

export const initialMapRegion = {
  latitude: 0.0,
  longitude: 0.0,
  latitudeDelta: DELTA,
  longitudeDelta: DELTA
};

const DEFAULT_STATE = {
  rootStoredParams: {},
  rootExploreView: "species",
  rootMapRegion: initialMapRegion
};

interface MapRegion {
  latitude: number,
  longitude: number,
  latitudeDelta: number,
  longitudeDelta: number
}

interface RootExploreSlice {
  rootStoredParams: Object,
  setRootStoredParams: ( _params: Object ) => void,
  rootExploreView: string,
  setRootExploreView: ( _view: string ) => void,
  rootMapRegion: MapRegion,
  setRootMapRegion: ( _region: MapRegion ) => void
}

const createRootExploreSlice: StateCreator<RootExploreSlice> = set => ( {
  ...DEFAULT_STATE,
  setRootStoredParams: rootStoredParams => set( ( ) => ( { rootStoredParams } ) ),
  setRootExploreView: rootExploreView => set( ( ) => ( { rootExploreView } ) ),
  setRootMapRegion: rootMapRegion => set( ( ) => ( { rootMapRegion } ) )
} );

export default createRootExploreSlice;
