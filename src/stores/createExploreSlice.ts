import { StateCreator } from "zustand";

const DELTA = 0.2;

export const initialMapRegion = {
  latitude: 0.0,
  longitude: 0.0,
  latitudeDelta: DELTA,
  longitudeDelta: DELTA
};

const DEFAULT_STATE = {
  storedParams: {},
  exploreView: "species",
  mapRegion: initialMapRegion
};

interface MapRegion {
  latitude: number,
  longitude: number,
  latitudeDelta: double,
  longitudeDelta: double
}

interface ExploreSlice {
  storedParams: Object,
  setStoredParams: ( _params: Object ) => void,
  exploreView: string,
  setExploreView: ( _view: string ) => void,
  mapRegion: MapRegion,
  setMapRegion: ( _region: MapRegion ) => void
}

const createExploreSlice: StateCreator<ExploreSlice> = set => ( {
  ...DEFAULT_STATE,
  setStoredParams: params => set( ( ) => ( { storedParams: params } ) ),
  setExploreView: exploreView => set( ( ) => ( { exploreView } ) ),
  setMapRegion: region => set( ( ) => ( { mapRegion: region } ) )
} );

export default createExploreSlice;
