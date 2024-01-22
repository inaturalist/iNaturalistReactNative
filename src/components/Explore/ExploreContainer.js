// @flow

import { useRoute } from "@react-navigation/native";
import { RealmContext } from "providers/contexts";
import {
  EXPLORE_ACTION,
  ExploreProvider,
  MEDIA,
  REVIEWED,
  SORT_BY,
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

const ALL = "all";

const initialState: {
  region: {
    latitude: number,
    longitude: number,
    latitudeDelta: number,
    longitudeDelta: number,
    place_guess: string,
  },
  exploreParams: {
    return_bounds: boolean,
    place_id?: number,
    lat?: number,
    lng?: number,
    radius?: number,
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
    return_bounds: true,
    place_id: undefined,
    lat: undefined,
    lng: undefined,
    radius: undefined
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
    case "SET_PLACE_NAME":
      return {
        ...state,
        region: {
          ...state.region,
          place_guess: action.placeName
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
    case "SET_WORLWIDE":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          lat: null,
          lng: null,
          radius: null,
          place_id: null,
          place_guess: ""
        }
      };
    default:
      throw new Error();
  }
};

const ExploreContainerWithContext = ( ): Node => {
  const { params } = useRoute( );
  const isOnline = useIsConnected( );

  const realm = useRealm();
  const currentUser = useCurrentUser();

  const [state, dispatch] = useReducer( reducer, initialState );
  const explore = useExplore();

  const { state: exploreState, dispatch: exploreDispatch } = explore;

  const {
    region,
    exploreParams,
    exploreView,
    showFiltersModal
  } = state;

  useEffect( ( ) => {
    if ( params?.viewSpecies ) {
      dispatch( {
        type: "CHANGE_EXPLORE_VIEW",
        exploreView: "species"
      } );
    }
    if ( params?.worldwide ) {
      dispatch( { type: "SET_WORLWIDE" } );
    }
    if ( params?.taxon ) {
      exploreDispatch( {
        type: EXPLORE_ACTION.CHANGE_TAXON,
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
    if ( params?.user && params?.user.id ) {
      exploreDispatch( {
        type: EXPLORE_ACTION.SET_USER,
        user: params.user,
        userId: params.user.id
      } );
    }
    if ( params?.project && params?.project.id ) {
      exploreDispatch( {
        type: EXPLORE_ACTION.SET_PROJECT,
        project: params.project,
        projectId: params.project.id
        // TODO: check web, do I need to set place_id as Amanda did before?
        // place_id: params.project.place_id || "any"
        // lat: null,
        // lng: null,
        // radius: null
      } );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params] );

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
    exploreDispatch( {
      type: EXPLORE_ACTION.CHANGE_TAXON,
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

  const updatePlaceName = newPlaceName => {
    dispatch( {
      type: "SET_PLACE_NAME",
      placeName: newPlaceName
    } );
  };

  const combinedParams = {
    ...exploreParams,
    ...exploreState.exploreParams
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

  delete filteredParams.user;
  delete filteredParams.project;

  // DATE_UPLOADED_NEWEST is the default sort order
  filteredParams.order_by = CREATED_AT;
  filteredParams.order = DESC;
  if ( exploreState.exploreParams.sortBy === SORT_BY.DATE_UPLOADED_OLDEST ) {
    filteredParams.order_by = CREATED_AT;
    filteredParams.order = ASC;
  }
  if ( exploreState.exploreParams.sortBy === SORT_BY.DATE_OBSERVED_NEWEST ) {
    filteredParams.order_by = OBSERVED_ON;
    filteredParams.order = DESC;
  }
  if ( exploreState.exploreParams.sortBy === SORT_BY.DATE_OBSERVED_OLDEST ) {
    filteredParams.order_by = OBSERVED_ON;
    filteredParams.order = ASC;
  }
  if ( exploreState.exploreParams.sortBy === SORT_BY.MOST_FAVED ) {
    filteredParams.order_by = "votes";
    filteredParams.order = DESC;
  }

  filteredParams.quality_grade = [];
  if ( exploreState.exploreParams.researchGrade ) {
    filteredParams.quality_grade.push( RESEARCH );
  }
  if ( exploreState.exploreParams.needsID ) {
    filteredParams.quality_grade.push( NEEDS_ID );
  }
  if ( exploreState.exploreParams.casual ) {
    filteredParams.quality_grade.push( CASUAL );
    delete filteredParams.verifiable;
  }

  if ( filteredParams.months ) {
    filteredParams.month = filteredParams.months;
    delete filteredParams.months;
  }

  filteredParams.photos = exploreState.exploreParams.media === MEDIA.PHOTOS
    || exploreState.exploreParams.media === MEDIA.ALL;
  filteredParams.sounds = exploreState.exploreParams.media === MEDIA.SOUNDS
    || exploreState.exploreParams.media === MEDIA.ALL;

  if ( exploreState.exploreParams.wildStatus === WILD_STATUS.WILD ) {
    filteredParams.captive = false;
  } else if ( exploreState.exploreParams.wildStatus === WILD_STATUS.CAPTIVE ) {
    filteredParams.captive = true;
  }

  if ( exploreState.exploreParams.reviewedFilter === REVIEWED.REVIEWED ) {
    filteredParams.reviewed = true;
    filteredParams.viewer_id = currentUser?.id;
  } else if ( exploreState.exploreParams.reviewedFilter === REVIEWED.UNREVIEWED ) {
    filteredParams.reviewed = false;
    filteredParams.viewer_id = currentUser?.id;
  }

  if ( exploreState.exploreParams.photoLicense !== ALL ) {
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
    filteredParams.photo_license = licenseParams[exploreState.exploreParams.photoLicense];
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
      isOnline={isOnline}
      showFiltersModal={showFiltersModal}
      openFiltersModal={() => {
        dispatch( { type: "SHOW_FILTERS_MODAL" } );
        explore.makeSnapshot( );
      }}
      closeFiltersModal={() => dispatch( { type: "CLOSE_FILTERS_MODAL" } )}
    />
  );
};

const ExploreContainer = (): Node => (
  <ExploreProvider>
    <ExploreContainerWithContext />
  </ExploreProvider>
);

export default ExploreContainer;
