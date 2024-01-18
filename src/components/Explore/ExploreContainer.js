// @flow

import { useRoute } from "@react-navigation/native";
import { RealmContext } from "providers/contexts";
import {
  ExploreProvider,
  MEDIA,
  REVIEWED,
  useExplore,
  WILD_STATUS
} from "providers/ExploreContext.tsx";
import type { Node } from "react";
import React, { useEffect, useReducer } from "react";
import { useCurrentUser, useIsConnected } from "sharedHooks";

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

const calculatedFilters = {
  user: undefined,
  project: undefined

  // introduced: true
  // native: true,
  // endemic: true,
  // noStatus: true
};

// Sort by: is NOT a filter criteria, but should return to default state when reset is pressed
const defaultFilters = {
  ...calculatedFilters,
  sortBy: DATE_UPLOADED_NEWEST,
  user_id: undefined,
  project_id: undefined
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
    // introduced: boolean,
    // native: boolean,
    // endemic: boolean,
    // noStatus: boolean
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
    case "TOGGLE_NATIVE":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          native: !state.exploreParams.native
        }
      };
    case "TOGGLE_ENDEMIC":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          endemic: !state.exploreParams.endemic
        }
      };
    case "TOGGLE_INTRODUCED":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          introduced: !state.exploreParams.introduced
        }
      };
    case "TOGGLE_NO_STATUS":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          noStatus: !state.exploreParams.noStatus
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
  const currentUser = useCurrentUser();

  const [state, dispatch] = useReducer( reducer, initialState );
  const explore = useExplore();
  console.log( "explore :>> ", explore );

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

  const updateNative = () => {
    dispatch( {
      type: "TOGGLE_NATIVE"
    } );
  };

  const updateEndemic = () => {
    dispatch( {
      type: "TOGGLE_ENDEMIC"
    } );
  };

  const updateIntroduced = () => {
    dispatch( {
      type: "TOGGLE_INTRODUCED"
    } );
  };

  const updateNoStatus = () => {
    dispatch( {
      type: "TOGGLE_NO_STATUS"
    } );
  };

  const combinedParams = {
    ...exploreParams,
    ...explore.state.exploreParams
  };

  const filteredParams = Object.entries( combinedParams ).reduce(
    ( newParams, [key, value] ) => {
      if ( value ) {
        newParams[key] = value;
      }
      return newParams;
    },
    {}
  );
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
  if ( exploreParams.sortBy === "MOST_FAVED" ) {
    filteredParams.order_by = "votes";
    filteredParams.order = DESC;
  }

  filteredParams.quality_grade = [];
  if ( explore.state.exploreParams.researchGrade ) {
    filteredParams.quality_grade.push( RESEARCH );
  }
  if ( explore.state.exploreParams.needsID ) {
    filteredParams.quality_grade.push( NEEDS_ID );
  }
  if ( explore.state.exploreParams.casual ) {
    filteredParams.quality_grade.push( CASUAL );
    delete filteredParams.verifiable;
  }

  if ( filteredParams.months ) {
    filteredParams.month = filteredParams.months;
    delete filteredParams.months;
  }

  filteredParams.photos = explore.state.exploreParams.media === MEDIA.PHOTOS
    || explore.state.exploreParams.media === MEDIA.ALL;
  filteredParams.sounds = explore.state.exploreParams.media === MEDIA.SOUNDS
    || explore.state.exploreParams.media === MEDIA.ALL;

  // TODO: How to handle those values (native, endemic, introduced, noStatus)
  // TODO: true = filter should be used, e.g. the query should be native=true
  // TODO: ask Abhas what should happen when = false:
  // not include the query param or send to the API native=false?
  // TODO: how does no Status work alongside the other values?

  // filteredParams.native = exploreParams.native;
  // filteredParams.endemic = exploreParams.endemic;
  // filteredParams.introduced = exploreParams.introduced;
  // filteredParams.noStatus = exploreParams.noStatus;

  if ( explore.state.exploreParams.wildStatus === WILD_STATUS.WILD ) {
    filteredParams.captive = false;
  } else if ( explore.state.exploreParams.wildStatus === WILD_STATUS.CAPTIVE ) {
    filteredParams.captive = true;
  }

  if ( explore.state.exploreParams.reviewedFilter === REVIEWED.REVIEWED ) {
    filteredParams.reviewed = true;
    filteredParams.viewer_id = currentUser?.id;
  } else if ( explore.state.exploreParams.reviewedFilter === REVIEWED.UNREVIEWED ) {
    filteredParams.reviewed = false;
    filteredParams.viewer_id = currentUser?.id;
  }

  if ( explore.state.exploreParams.photoLicense !== ALL ) {
    const licenseParams = {
      all: "all",
      cc0: "cc0",
      ccby: "cc-by",
      ccbync: "cc-by-nc",
      ccbysa: "cc-by-sa",
      ccbynd: "cc-by-nd",
      ccbyncsa: "cc-by-nc-sa",
      ccbyncnd: "cc-by-nc-nd"
    };
    filteredParams.photo_license = licenseParams[explore.state.exploreParams.photoLicense];
  }

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
      closeFiltersModal={() => dispatch( { type: "CLOSE_FILTERS_MODAL" } )}
      numberOfFilters={numberOfFilters}
      updateNative={updateNative}
      updateEndemic={updateEndemic}
      updateIntroduced={updateIntroduced}
      updateNoStatus={updateNoStatus}
    />
  );
};

const ExploreContainerConnected = (): Node => (
  <ExploreProvider>
    <ExploreContainer />
  </ExploreProvider>
);

export default ExploreContainerConnected;
