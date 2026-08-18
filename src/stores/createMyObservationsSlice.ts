import type { Region } from "react-native-maps";
import type { ICONIC_TAXA_GROUP } from "sharedHelpers/iconicTaxaGroupOrder";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import { SPECIES_SORT } from "sharedHelpers/speciesSort";
import type { StateCreator } from "zustand";

// Everything My Observations needs to remember for the length of a session:
// sort, search, view state, and scroll position. It lives here rather than
// in React because the MyObs component tree gets destroyed constantly: Mortal
// unmounts the whole bottom tab navigator whenever it blurs (camera use or visit
// to ObsEdit), and CustomTabBarContainer resets the navigator on some
// tab presses. State mounted inside the ObsList screen cannot survive either
// one, so the user would lose their sort and search every time.

export interface MyObservationsTaxon {
  id: number;
  name: string;
  preferredCommonName?: string;
  iconUri?: string;
}

export interface MyObservationsState {
  observationsSort: OBSERVATIONS_SORT;
  speciesSort: SPECIES_SORT;
  searchedTaxon: MyObservationsTaxon | null;
}

export const initialMyObservationsState: MyObservationsState = {
  observationsSort: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
  speciesSort: SPECIES_SORT.COUNT_DESC,
  searchedTaxon: null,
};

export interface MyObservationsSlice {
  // Sort and search
  myObservations: MyObservationsState;
  updateMyObservations: (
    _updater: ( _previous: MyObservationsState ) => MyObservationsState
  ) => void;

  // State that only relevant while its view is the active view. Kept out
  // of myObservations because the map writes on every pan, and everything
  // reading myObservations would re-render along with it. Cleared when the user
  // switches views.
  myObservationsMapRegion: Region | null;
  setMyObservationsMapRegion: ( _region: Region | null ) => void;
  myObservationsClosedIconicTaxaCategories: Set<ICONIC_TAXA_GROUP>;
  setMyObservationsClosedIconicTaxaCategories: ( _closed: Set<ICONIC_TAXA_GROUP> ) => void;
  clearMyObservationsViewState: ( ) => void;

  // Scroll position so we can put the user back where they were when they
  // return from the NoBottomTabStackNavigator.
  myObsOffset: number;
  setMyObsOffset: ( _newOffset: number ) => void;
  myObsOffsetToRestore: number;
  setMyObsOffsetToRestore: ( ) => void;
  resetMyObsOffsetToRestore: ( ) => void;

  // Nothing reads or writes these yet. The live values are read straight from
  // MMKV in MyObservationsResults, AddObsButton, and SimpleUploadBannerContainer.
  // Kept here as the destination for MOB-1374, which moves that direct MMKV
  // access into the store.
  numOfUserObservations: number;
  setNumOfUserObservations: ( _newNum: number ) => void;
  numOfUserSpecies: number;
  setNumOfUserSpecies: ( _newNum: number ) => void;
}

const createMyObservationsSlice: StateCreator<MyObservationsSlice> = ( set, get ) => ( {
  myObservations: initialMyObservationsState,
  updateMyObservations: updater => set( state => {
    const myObservations = updater( state.myObservations );
    if ( myObservations.searchedTaxon?.id === state.myObservations.searchedTaxon?.id ) {
      return { myObservations };
    }
    // TBD: what to do re: expanded header set when a search becomes active.
    // do we clear them, or should they re-appear as they were before?
    return { myObservations, myObservationsMapRegion: null };
  } ),

  myObservationsMapRegion: null,
  setMyObservationsMapRegion: region => set( { myObservationsMapRegion: region } ),
  myObservationsClosedIconicTaxaCategories: new Set( ),
  setMyObservationsClosedIconicTaxaCategories: closed => set( {
    myObservationsClosedIconicTaxaCategories: closed,
  } ),
  clearMyObservationsViewState: ( ) => set( {
    myObservationsMapRegion: null,
    myObservationsClosedIconicTaxaCategories: new Set( ),
  } ),

  myObsOffset: 0,
  setMyObsOffset: newOffset => set( { myObsOffset: newOffset } ),
  myObsOffsetToRestore: 0,
  setMyObsOffsetToRestore: ( ) => set( { myObsOffsetToRestore: get( ).myObsOffset } ),
  resetMyObsOffsetToRestore: ( ) => set( { myObsOffsetToRestore: 0 } ),

  numOfUserObservations: 0,
  setNumOfUserObservations: newNum => set( { numOfUserObservations: newNum } ),
  numOfUserSpecies: 0,
  setNumOfUserSpecies: newNum => set( { numOfUserSpecies: newNum } ),
} );

export default createMyObservationsSlice;
