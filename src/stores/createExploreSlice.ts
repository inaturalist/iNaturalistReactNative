import { StateCreator } from "zustand";

const DELTA = 0.2;

export const initialMapRegion = {
  latitude: 0.0,
  longitude: 0.0,
  latitudeDelta: DELTA,
  longitudeDelta: DELTA
};

const DEFAULT_STATE = {
  exploreView: "species",
  mapRegion: initialMapRegion
};

interface MapRegion {
  latitude: number,
  longitude: number,
  latitudeDelta: number,
  longitudeDelta: number
}

interface ExploreSlice {
  exploreView: string,
  setExploreView: ( _view: string ) => void,
  mapRegion: MapRegion,
  setMapRegion: ( _region: MapRegion ) => void
}

const createExploreSlice: StateCreator<ExploreSlice> = set => ( {
  ...DEFAULT_STATE,
  setExploreView: exploreView => set( ( ) => ( { exploreView } ) ),
  setMapRegion: mapRegion => set( ( ) => ( { mapRegion } ) )
} );

export default createExploreSlice;
