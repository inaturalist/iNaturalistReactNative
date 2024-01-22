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
import React, { useEffect, useState } from "react";
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

const mapParamsToAPI = ( params, currentUser ) => {
  const filteredParams = Object.entries( params ).reduce(
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
  if ( params.sortBy === SORT_BY.DATE_UPLOADED_OLDEST ) {
    filteredParams.order_by = CREATED_AT;
    filteredParams.order = ASC;
  }
  if ( params.sortBy === SORT_BY.DATE_OBSERVED_NEWEST ) {
    filteredParams.order_by = OBSERVED_ON;
    filteredParams.order = DESC;
  }
  if ( params.sortBy === SORT_BY.DATE_OBSERVED_OLDEST ) {
    filteredParams.order_by = OBSERVED_ON;
    filteredParams.order = ASC;
  }
  if ( params.sortBy === SORT_BY.MOST_FAVED ) {
    filteredParams.order_by = "votes";
    filteredParams.order = DESC;
  }

  filteredParams.quality_grade = [];
  if ( params.researchGrade ) {
    filteredParams.quality_grade.push( RESEARCH );
  }
  if ( params.needsID ) {
    filteredParams.quality_grade.push( NEEDS_ID );
  }
  if ( params.casual ) {
    filteredParams.quality_grade.push( CASUAL );
    delete filteredParams.verifiable;
  }

  if ( filteredParams.months ) {
    filteredParams.month = filteredParams.months;
    delete filteredParams.months;
  }

  filteredParams.photos
      = params.media === MEDIA.PHOTOS || params.media === MEDIA.ALL;
  filteredParams.sounds
      = params.media === MEDIA.SOUNDS || params.media === MEDIA.ALL;

  if ( params.wildStatus === WILD_STATUS.WILD ) {
    filteredParams.captive = false;
  } else if ( params.wildStatus === WILD_STATUS.CAPTIVE ) {
    filteredParams.captive = true;
  }

  if ( params.reviewedFilter === REVIEWED.REVIEWED ) {
    filteredParams.reviewed = true;
    filteredParams.viewer_id = currentUser?.id;
  } else if ( params.reviewedFilter === REVIEWED.UNREVIEWED ) {
    filteredParams.reviewed = false;
    filteredParams.viewer_id = currentUser?.id;
  }

  if ( params.photoLicense !== ALL ) {
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
    filteredParams.photo_license = licenseParams[params.photoLicense];
  }

  return filteredParams;
};

const ExploreContainerWithContext = ( ): Node => {
  const { params } = useRoute( );
  const isOnline = useIsConnected( );

  const realm = useRealm();
  const currentUser = useCurrentUser();

  const explore = useExplore();

  const [region, setRegion] = useState( {
    latitude: 0.0,
    longitude: 0.0,
    latitudeDelta: DELTA,
    longitudeDelta: DELTA
  } );
  const [showFiltersModal, setShowFiltersModal] = useState( false );
  const [exploreView, setExploreView] = useState( "observations" );

  const { state, dispatch } = explore;

  useEffect( ( ) => {
    if ( params?.viewSpecies ) {
      setExploreView( "species" );
    }
    if ( params?.worldwide ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        placeId: null,
        placeName: ""
      } );
    }
    if ( params?.taxon ) {
      dispatch( {
        type: EXPLORE_ACTION.CHANGE_TAXON,
        taxon: params?.taxon,
        taxonId: params?.taxon.id,
        taxonName: params?.taxon.preferred_common_name || params?.taxon.name
      } );
    }
    if ( params?.place ) {
      const { coordinates } = params.place.point_geojson;
      setRegion( {
        ...region,
        latitude: coordinates[1],
        longitude: coordinates[0]
      } );
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        placeId: params.place?.id,
        placeName: params.place?.display_name
      } );
    }
    if ( params?.user && params?.user.id ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_USER,
        user: params.user,
        userId: params.user.id
      } );
    }
    if ( params?.project && params?.project.id ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_PROJECT,
        project: params.project,
        projectId: params.project.id
      } );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params] );

  const changeExploreView = newView => {
    setExploreView( newView );
  };

  const updateTaxon = ( taxonName: string ) => {
    const selectedTaxon = realm
      ?.objects( "Taxon" )
      .filtered( "name CONTAINS[c] $0", taxonName );
    const taxon = selectedTaxon.length > 0
      ? selectedTaxon[0]
      : null;
    dispatch( {
      type: EXPLORE_ACTION.CHANGE_TAXON,
      taxon,
      taxonId: taxon?.id,
      taxonName: taxon?.preferred_common_name || taxon?.name
    } );
  };

  const updatePlace = place => {
    const { coordinates } = place.point_geojson;
    setRegion( {
      ...region,
      latitude: coordinates[1],
      longitude: coordinates[0]
    } );
    dispatch( {
      type: EXPLORE_ACTION.SET_PLACE,
      placeId: place?.id,
      placeName: place?.display_name
    } );
  };

  const filteredParams = mapParamsToAPI(
    state.exploreParams,
    currentUser
  );

  return (
    <Explore
      exploreAPIParams={filteredParams}
      region={region}
      exploreView={exploreView}
      changeExploreView={changeExploreView}
      updateTaxon={updateTaxon}
      updatePlace={updatePlace}
      isOnline={isOnline}
      showFiltersModal={showFiltersModal}
      openFiltersModal={() => {
        setShowFiltersModal( true );
        explore.makeSnapshot( );
      }}
      closeFiltersModal={() => setShowFiltersModal( false )}
    />
  );
};

const ExploreContainer = (): Node => (
  <ExploreProvider>
    <ExploreContainerWithContext />
  </ExploreProvider>
);

export default ExploreContainer;
