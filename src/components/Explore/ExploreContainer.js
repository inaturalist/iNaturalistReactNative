// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useEffect, useReducer } from "react";
import { useIsConnected } from "sharedHooks";

import Explore from "./Explore";

const { useRealm } = RealmContext;

const DELTA = 0.2;

const RESEARCH = "research";
const NEEDS_ID = "needs_id";
const CASUAL = "casual";

const CREATED_AT = "created_at"; // = date uploaded at
const OBSERVED_ON = "observed_on";

const DESC = "desc";
const ASC = "asc";

const DATE_UPLOADED_NEWEST = "DATE_UPLOADED_NEWEST";

const ALL = "all";
const EXACT_DATE = "exactDate";
const MONTHS = "months";

const PHOTOS = "photos";
const SOUNDS = "sounds";

const today = new Date( ).toISOString( ).split( "T" )[0];
// Array with the numbers from 1 to 12
const months = new Array( 12 ).fill( 0 ).map( ( _, i ) => i + 1 );
const calculatedFilters = {
  user: undefined,
  project: undefined,
  researchGrade: true,
  needsID: true,
  casual: false,
  hrank: undefined,
  lrank: undefined,
  dateObserved: ALL,
  dateUploaded: ALL,
  media: ALL
};

// Sort by: is NOT a filter criteria, but should return to default state when reset is pressed
const defaultFilters = {
  ...calculatedFilters,
  sortBy: DATE_UPLOADED_NEWEST,
  user_id: undefined,
  project_id: undefined,
  observed_on: undefined,
  created_on: undefined,
  month: undefined
};

const initialState: {
  region: {
    latitude: number,
    longitude: number,
    latitudeDelta: number,
    longitudeDelta: number,
    place_guess: string,
  },
  exploreParams: {
    verifiable: boolean,
    return_bounds: boolean,
    taxon?: Object,
    taxon_id?: number,
    taxon_name?: string,
    place_id?: number,
    lat?: number,
    lng?: number,
    radius?: number,
    project: ?Object,
    project_id: ?number,
    sortBy: string,
    user: ?Object,
    user_id: ?number,
    researchGrade: boolean,
    needsID: boolean,
    casual: boolean,
    hrank: ?string,
    lrank: ?string,
    dateObserved: string,
    observed_on: ?string,
    month: ?number[],
    dateUploaded: string,
    created_on: ?string,
    media: string,
  },
  exploreView: string,
  showFiltersModal: boolean,
} = {
  region: {
    latitude: 0.0,
    longitude: 0.0,
    latitudeDelta: DELTA,
    longitudeDelta: DELTA,
    place_guess: ""
  },
  exploreParams: {
    verifiable: true,
    return_bounds: true,
    taxon: undefined,
    taxon_id: undefined,
    taxon_name: undefined,
    place_id: undefined,
    lat: undefined,
    lng: undefined,
    radius: undefined,
    project_id: undefined,
    ...defaultFilters
  },
  exploreView: "observations",
  showFiltersModal: false
};

const reducer = ( state, action ) => {
  switch ( action.type ) {
    case "SET_LOCATION":
      return {
        ...state,
        region: action.region,
        exploreParams: {
          ...state.exploreParams,
          lat: action.region.latitude,
          lng: action.region.longitude,
          radius: 50
        }
      };
    case "CHANGE_EXPLORE_VIEW":
      return {
        ...state,
        exploreView: action.exploreView
      };
    case "CHANGE_TAXON":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          taxon: action.taxon,
          taxon_id: action.taxonId,
          taxon_name: action.taxonName
        }
      };
    case "CHANGE_PLACE_ID":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          lat: null,
          lng: null,
          radius: null,
          place_id: action.placeId
        },
        region: {
          ...state.region,
          latitude: action.latitude,
          longitude: action.longitude,
          place_guess: action.place_guess
        }
      };
    case "CHANGE_SORT_BY":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          sortBy: action.sortBy
        }
      };
    case "SET_PLACE_NAME":
      return {
        ...state,
        region: {
          ...state.region,
          place_guess: action.placeName
        }
      };
    case "SET_TAXON_NAME":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          taxon_name: action.taxonName
        }
      };
    case "SET_USER":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          user: action.user,
          user_id: action.userId
        }
      };
    case "SET_PROJECT":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          project: action.project,
          project_id: action.projectId
        }
      };
    case "RESET_EXPLORE_FILTERS":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          ...defaultFilters
        }
      };
    case "SET_EXPLORE_FILTERS":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          ...action.exploreFilters
        }
      };
    case "SHOW_FILTERS_MODAL":
      return {
        ...state,
        showFiltersModal: true
      };
    case "CLOSE_FILTERS_MODAL":
      return {
        ...state,
        showFiltersModal: false
      };
    case "TOGGLE_RESEARCH_GRADE":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          researchGrade: !state.exploreParams.researchGrade
        }
      };
    case "TOGGLE_NEEDS_ID":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          needsID: !state.exploreParams.needsID
        }
      };
    case "TOGGLE_CASUAL":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          casual: !state.exploreParams.casual
        }
      };
    case "SET_HIGHEST_TAXONOMIC_RANK":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          hrank: action.hrank
        }
      };
    case "SET_LOWEST_TAXONOMIC_RANK":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          lrank: action.lrank
        }
      };
    case "SET_DATE_OBSERVED_ALL":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          dateObserved: ALL,
          observed_on: null,
          month: null
        }
      };
    case "SET_DATE_OBSERVED_EXACT":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          dateObserved: EXACT_DATE,
          observed_on: action.observed_on,
          month: null
        }
      };
    case "SET_DATE_OBSERVED_MONTHS":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          dateObserved: MONTHS,
          observed_on: null,
          month: action.month
        }
      };
    case "SET_DATE_UPLOADED_ALL":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          dateUploaded: ALL,
          created_on: null
        }
      };
    case "SET_DATE_UPLOADED_EXACT":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          dateUploaded: EXACT_DATE,
          created_on: action.created_on
        }
      };
    case "SET_MEDIA":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          media: action.media
        }
      };

    default:
      throw new Error();
  }
};

const ExploreContainer = ( ): Node => {
  const { params } = useRoute( );
  const isOnline = useIsConnected( );

  const realm = useRealm();
  const navigation = useNavigation();
  console.log( "navigation :>> ", navigation );

  const [state, dispatch] = useReducer( reducer, initialState );

  const {
    region,
    exploreParams,
    exploreView,
    showFiltersModal
  } = state;

  useEffect( ( ) => {
    if ( params?.taxon ) {
      dispatch( {
        type: "CHANGE_TAXON",
        taxon: params?.taxon,
        taxonId: params?.taxon.id,
        taxonName: params?.taxon.preferred_common_name || params?.taxon.name
      } );
    }
    if ( params?.place ) {
      const { coordinates } = params.place.point_geojson;
      dispatch( {
        type: "CHANGE_PLACE_ID",
        placeId: params.place?.id,
        latitude: coordinates[1],
        longitude: coordinates[0],
        place_guess: params.place?.display_name
      } );
    }
    if ( params?.user ) {
      dispatch( {
        type: "SET_USER",
        user: params.user,
        userId: params.user.id
      } );
    }
    if ( params?.project ) {
      dispatch( {
        type: "SET_PROJECT",
        project: params?.project,
        projectId: params?.project.id
      } );
    }
    if ( params?.projectId ) {
      dispatch( {
        type: "SET_EXPLORE_FILTERS",
        exploreFilters: {
          project_id: params?.projectId,
          place_id: params?.placeId || "any",
          lat: null,
          lng: null,
          radius: null
        }
      } );
    }
  }, [params] );

  const filtersNotDefault = () => Object.keys( defaultFilters ).some(
    key => defaultFilters[key] !== exploreParams[key]
  );

  const numberOfFilters = Object.keys( calculatedFilters ).reduce(
    ( count, key ) => {
      if ( exploreParams[key] && exploreParams[key] !== calculatedFilters[key] ) {
        return count + 1;
      }
      return count;
    },
    0
  );

  const changeExploreView = newView => {
    dispatch( {
      type: "CHANGE_EXPLORE_VIEW",
      exploreView: newView
    } );
  };

  const updateTaxon = ( taxonName: string ) => {
    const selectedTaxon = realm
      ?.objects( "Taxon" )
      .filtered( "name CONTAINS[c] $0", taxonName );
    const taxon = selectedTaxon.length > 0
      ? selectedTaxon[0]
      : null;
    dispatch( {
      type: "CHANGE_TAXON",
      taxon,
      taxonId: taxon?.id,
      taxonName: taxon?.preferred_common_name || taxon?.name
    } );
  };

  const updatePlace = place => {
    const { coordinates } = place.point_geojson;
    dispatch( {
      type: "CHANGE_PLACE_ID",
      placeId: place?.id,
      latitude: coordinates[1],
      longitude: coordinates[0],
      place_guess: place?.display_name
    } );
  };

  const updateSortBy = sortBy => {
    dispatch( {
      type: "CHANGE_SORT_BY",
      sortBy
    } );
  };

  const updatePlaceName = newPlaceName => {
    dispatch( {
      type: "SET_PLACE_NAME",
      placeName: newPlaceName
    } );
  };

  const updateTaxonName = newTaxonName => {
    dispatch( {
      type: "SET_TAXON_NAME",
      taxonName: newTaxonName
    } );
  };

  const updateHighestTaxonomicRank = newRank => {
    dispatch( {
      type: "SET_HIGHEST_TAXONOMIC_RANK",
      hrank: newRank
    } );
  };

  const updateLowestTaxonomicRank = newRank => {
    dispatch( {
      type: "SET_LOWEST_TAXONOMIC_RANK",
      lrank: newRank
    } );
  };

  const updateDateObserved = ( newDateObserved, d1, newMonths ) => {
    if ( newDateObserved === ALL ) {
      dispatch( {
        type: "SET_DATE_OBSERVED_ALL"
      } );
    } else if ( newDateObserved === EXACT_DATE ) {
      dispatch( {
        type: "SET_DATE_OBSERVED_EXACT",
        observed_on: d1 || today
      } );
    } else if ( newDateObserved === MONTHS ) {
      dispatch( {
        type: "SET_DATE_OBSERVED_MONTHS",
        month: newMonths || months
      } );
    }
  };

  const updateDateUploaded = ( newDateObserved, d1 ) => {
    if ( newDateObserved === ALL ) {
      dispatch( {
        type: "SET_DATE_UPLOADED_ALL"
      } );
    } else if ( newDateObserved === EXACT_DATE ) {
      dispatch( {
        type: "SET_DATE_UPLOADED_EXACT",
        created_on: d1 || today
      } );
    }
  };

  const updateMedia = newMedia => {
    dispatch( {
      type: "SET_MEDIA",
      media: newMedia
    } );
  };

  const filteredParams = Object.entries( exploreParams ).reduce(
    ( newParams, [key, value] ) => {
      if ( value ) {
        newParams[key] = value;
      }
      return newParams;
    },
    {}
  );
  filteredParams.quality_grade = [];
  if ( exploreParams.researchGrade ) {
    filteredParams.quality_grade.push( RESEARCH );
  }
  if ( exploreParams.needsID ) {
    filteredParams.quality_grade.push( NEEDS_ID );
  }
  if ( exploreParams.casual ) {
    filteredParams.quality_grade.push( CASUAL );
  }
  // DATE_UPLOADED_NEWEST is the default sort order
  filteredParams.order_by = CREATED_AT;
  filteredParams.order = DESC;
  if ( exploreParams.sortBy === "DATE_UPLOADED_OLDEST" ) {
    filteredParams.order_by = CREATED_AT;
    filteredParams.order = ASC;
  }
  if ( exploreParams.sortBy === "DATE_OBSERVED_NEWEST" ) {
    filteredParams.order_by = OBSERVED_ON;
    filteredParams.order = DESC;
  }
  if ( exploreParams.sortBy === "DATE_OBSERVED_OLDEST" ) {
    filteredParams.order_by = OBSERVED_ON;
    filteredParams.order = ASC;
  }
  // TODO: is this possible on the API at all?
  // if ( exploreParams.sortBy === "MOST_FAVED" ) {
  //   filteredParams.order_by = "faves";
  //   filteredParams.order = DESC;
  // }
  filteredParams.photos = exploreParams.media === PHOTOS || exploreParams.media === ALL;
  filteredParams.sounds = exploreParams.media === SOUNDS || exploreParams.media === ALL;

  return (
    <Explore
      exploreParams={filteredParams}
      region={region}
      exploreView={exploreView}
      changeExploreView={changeExploreView}
      updateTaxon={updateTaxon}
      updatePlace={updatePlace}
      updatePlaceName={updatePlaceName}
      updateTaxonName={updateTaxonName}
      filtersNotDefault={filtersNotDefault()}
      resetFilters={() => dispatch( { type: "RESET_EXPLORE_FILTERS" } )}
      updateSortBy={updateSortBy}
      isOnline={isOnline}
      showFiltersModal={showFiltersModal}
      openFiltersModal={() => dispatch( { type: "SHOW_FILTERS_MODAL" } )}
      // openFiltersModal={() => navigation.navigate( "ExploreFilterScreen" )}
      closeFiltersModal={() => dispatch( { type: "CLOSE_FILTERS_MODAL" } )}
      numberOfFilters={numberOfFilters}
      updateResearchGrade={() => dispatch( { type: "TOGGLE_RESEARCH_GRADE" } )}
      updateNeedsID={() => dispatch( { type: "TOGGLE_NEEDS_ID" } )}
      updateCasual={() => dispatch( { type: "TOGGLE_CASUAL" } )}
      updateHighestTaxonomicRank={updateHighestTaxonomicRank}
      updateLowestTaxonomicRank={updateLowestTaxonomicRank}
      updateDateObserved={updateDateObserved}
      updateDateUploaded={updateDateUploaded}
      updateMedia={updateMedia}
    />
  );
};

export default ExploreContainer;
