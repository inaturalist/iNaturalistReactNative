import { MyObsSlice, StoreSlice } from "./types";

const createMyObsSlice: StoreSlice<MyObsSlice> = ( set, get ) => ( {
  // Stores y offset of MyObs so we can scroll back to the user's position
  // when returning from the NoBottomTabStackNavigator (MyObs will be trashed
  // when navigating to ObsEdit, so we lose scroll position)
  myObsOffset: 0,
  myObsOffsetToRestore: 0,
  resetMyObsOffsetToRestore: ( ) => set( { myObsOffsetToRestore: 0 } ),
  setMyObsOffset: newOffset => set( { myObsOffset: newOffset } ),
  setMyObsOffsetToRestore: ( ) => set( { myObsOffsetToRestore: get( ).myObsOffset } ),
  numOfUserObservations: 0,
  setNumOfUserObservations: newNum => set( { numOfUserObservations: newNum } ),
  numOfUserSpecies: 0,
  setNumOfUserSpecies: newNum => set( { numOfUserSpecies: newNum } )
} );

export default createMyObsSlice;
