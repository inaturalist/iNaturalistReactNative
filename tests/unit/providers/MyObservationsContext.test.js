import {
  initialMyObservationsState,
  MY_OBSERVATIONS_ACTION,
  myObservationsReducer,
} from "providers/MyObservationsContext";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import { SPECIES_SORT } from "sharedHelpers/speciesSort";

describe( "initialMyObservationsState", ( ) => {
  it( "starts with obs sorted by date uploaded (newest), species sort desc, and no taxon", ( ) => {
    expect( initialMyObservationsState.observationsSort )
      .toBe( OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST );
    expect( initialMyObservationsState.speciesSort ).toBe( SPECIES_SORT.COUNT_DESC );
    expect( initialMyObservationsState.searchedTaxon ).toBeNull( );
  } );
} );

describe( "myObservationsReducer", ( ) => {
  describe( MY_OBSERVATIONS_ACTION.SET_OBSERVATIONS_SORT, ( ) => {
    it( "updates observationsSort", ( ) => {
      const next = myObservationsReducer( initialMyObservationsState, {
        type: MY_OBSERVATIONS_ACTION.SET_OBSERVATIONS_SORT,
        observationsSort: OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST,
      } );
      expect( next.observationsSort ).toBe( OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST );
    } );

    it( "preserves speciesSort and searchedTaxon", ( ) => {
      const taxon = { id: 42, name: "Canis latrans" };
      const state = {
        observationsSort: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
        speciesSort: SPECIES_SORT.COUNT_ASC,
        searchedTaxon: taxon,
      };
      const next = myObservationsReducer( state, {
        type: MY_OBSERVATIONS_ACTION.SET_OBSERVATIONS_SORT,
        observationsSort: OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST,
      } );
      expect( next.speciesSort ).toBe( state.speciesSort );
      expect( next.searchedTaxon ).toEqual( taxon );
    } );
  } );

  describe( MY_OBSERVATIONS_ACTION.SET_SPECIES_SORT, ( ) => {
    it( "updates speciesSort", ( ) => {
      const next = myObservationsReducer( initialMyObservationsState, {
        type: MY_OBSERVATIONS_ACTION.SET_SPECIES_SORT,
        speciesSort: SPECIES_SORT.COUNT_ASC,
      } );
      expect( next.speciesSort ).toBe( SPECIES_SORT.COUNT_ASC );
    } );

    it( "preserves observationsSort and searchedTaxon", ( ) => {
      const taxon = { id: 42, name: "Canis latrans" };
      const state = {
        observationsSort: OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST,
        speciesSort: SPECIES_SORT.COUNT_DESC,
        searchedTaxon: taxon,
      };
      const next = myObservationsReducer( state, {
        type: MY_OBSERVATIONS_ACTION.SET_SPECIES_SORT,
        speciesSort: SPECIES_SORT.COUNT_ASC,
      } );
      expect( next.observationsSort ).toBe( state.observationsSort );
      expect( next.searchedTaxon ).toEqual( taxon );
    } );
  } );

  describe( MY_OBSERVATIONS_ACTION.SET_TAXON_SEARCH, ( ) => {
    it( "sets the searched taxon", ( ) => {
      const taxon = { id: 42, name: "Canis latrans", preferred_common_name: "Coyote" };
      const next = myObservationsReducer( initialMyObservationsState, {
        type: MY_OBSERVATIONS_ACTION.SET_TAXON_SEARCH,
        searchTaxon: taxon,
      } );
      expect( next.searchedTaxon ).toEqual( taxon );
    } );

    it( "replaces a previously searched taxon", ( ) => {
      const state = {
        ...initialMyObservationsState,
        searchedTaxon: { id: 1, name: "Canis latrans" },
      };
      const taxon = { id: 2, name: "Otala lactea" };
      const next = myObservationsReducer( state, {
        type: MY_OBSERVATIONS_ACTION.SET_TAXON_SEARCH,
        searchTaxon: taxon,
      } );
      expect( next.searchedTaxon ).toEqual( taxon );
    } );

    it( "preserves observationsSort and speciesSort", ( ) => {
      const state = {
        observationsSort: OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST,
        speciesSort: SPECIES_SORT.COUNT_ASC,
        searchedTaxon: null,
      };
      const next = myObservationsReducer( state, {
        type: MY_OBSERVATIONS_ACTION.SET_TAXON_SEARCH,
        searchTaxon: { id: 99, name: "Canis latrans" },
      } );
      expect( next.observationsSort ).toBe( state.observationsSort );
      expect( next.speciesSort ).toBe( state.speciesSort );
    } );
  } );

  describe( MY_OBSERVATIONS_ACTION.CLEAR_TAXON_SEARCH, ( ) => {
    it( "clears the searched taxon", ( ) => {
      const state = {
        ...initialMyObservationsState,
        searchedTaxon: { id: 42, name: "Canis latrans" },
      };
      const next = myObservationsReducer( state, {
        type: MY_OBSERVATIONS_ACTION.CLEAR_TAXON_SEARCH,
      } );
      expect( next.searchedTaxon ).toBeNull( );
    } );

    it( "preserves observationsSort and speciesSort", ( ) => {
      const state = {
        observationsSort: OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST,
        speciesSort: SPECIES_SORT.COUNT_ASC,
        searchedTaxon: { id: 1, name: "Canis latrans" },
      };
      const next = myObservationsReducer( state, {
        type: MY_OBSERVATIONS_ACTION.CLEAR_TAXON_SEARCH,
      } );
      expect( next.observationsSort ).toBe( state.observationsSort );
      expect( next.speciesSort ).toBe( state.speciesSort );
    } );
  } );
} );
