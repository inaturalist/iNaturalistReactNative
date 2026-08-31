import { SPECIES_TAB } from "appConstants/tabs";
import applySavedSearch from "components/Explore/ExploreV2/helpers/applySavedSearch";
import {
  defaultExploreV2Filters,
  EXPLORE_V2_PLACE_MODE,
  exploreV2Reducer,
  initialExploreV2State,
} from "providers/ExploreV2Context";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import { SPECIES_SORT } from "sharedHelpers/speciesSort";
import { savedSearch as buildSavedSearch } from "tests/helpers/savedSearch";

const TAXON_SUBJECT = { type: "taxon", taxon: { id: 12, name: "Opuntia fragilis" } };
const PLACE = { id: 1, display_name: "Minnesota, US", place_type: 9 };

// Every field set to something other than the initial state, so a field left unrestored shows
// up as a failure
const savedSearch = ( overrides = {} ) => buildSavedSearch( {
  subject: TAXON_SUBJECT,
  location: { placeMode: EXPLORE_V2_PLACE_MODE.PLACE, place: PLACE },
  sortBy: OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST,
  speciesSortBy: SPECIES_SORT.COUNT_ASC,
  filters: { ...defaultExploreV2Filters, casual: true },
  ...overrides,
} );

// Runs the real reducer so we assert on the state the user would see, not on dispatch calls
const applyTo = ( search, startingState = initialExploreV2State ) => {
  let state = startingState;
  applySavedSearch( search, action => {
    state = exploreV2Reducer( state, action );
  } );
  return state;
};

describe( "applySavedSearch", ( ) => {
  it( "restores the subject, location, both sort orders, and the filters", ( ) => {
    const search = savedSearch( );
    const state = applyTo( search );

    expect( state.subject ).toEqual( TAXON_SUBJECT );
    expect( state.location ).toEqual( {
      placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
      place: PLACE,
    } );
    expect( state.sortBy ).toEqual( OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST );
    expect( state.speciesSortBy ).toEqual( SPECIES_SORT.COUNT_ASC );
    expect( state.filters ).toEqual( search.filters );
  } );

  it( "clears the subject for a search that had none", ( ) => {
    const state = applyTo( savedSearch( { subject: null } ), {
      ...initialExploreV2State,
      subject: TAXON_SUBJECT,
    } );

    expect( state.subject ).toBeNull( );
  } );

  it( "restores each kind of location", ( ) => {
    const bounds = {
      swlat: 44.9, swlng: -93.3, nelat: 45.1, nelng: -93.1,
    };

    expect( applyTo( savedSearch( {
      location: { placeMode: EXPLORE_V2_PLACE_MODE.NEARBY },
    } ) ).location ).toEqual( { placeMode: EXPLORE_V2_PLACE_MODE.NEARBY } );
    expect( applyTo( savedSearch( {
      location: { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE },
    } ) ).location ).toEqual( { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE } );
    expect( applyTo( savedSearch( {
      location: { placeMode: EXPLORE_V2_PLACE_MODE.MAP_AREA, bounds },
    } ) ).location ).toEqual( { placeMode: EXPLORE_V2_PLACE_MODE.MAP_AREA, bounds } );
  } );

  it( "leaves the tab the user is on alone", ( ) => {
    const state = applyTo( savedSearch( ), {
      ...initialExploreV2State,
      activeTab: SPECIES_TAB,
    } );

    expect( state.activeTab ).toEqual( SPECIES_TAB );
  } );
} );
