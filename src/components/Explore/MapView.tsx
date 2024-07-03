import { searchObservations } from "api/observations";
import classnames from "classnames";
import {
  Body1,
  Button,
  Map
} from "components/SharedComponents";
import { getMapRegion } from "components/SharedComponents/Map/helpers/mapHelpers.ts";
import { View } from "components/styledComponents";
import React, { useState } from "react";
import { Platform } from "react-native";
import { useDebugMode, useTranslation } from "sharedHooks";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import { getShadowForColor } from "styles/global";
import colors from "styles/tailwindColors";

import useMapLocation from "./hooks/useMapLocation";

const DROP_SHADOW = getShadowForColor( colors.darkGray, {
  offsetHeight: 4,
  elevation: 6
} );

type Props = {
  observations: Array<Object>,
  queryParams: Object
}

const MapView = ( {
  observations,
  queryParams
}: Props ) => {
  const { t } = useTranslation( );
  const { isDebug } = useDebugMode( );
  const [zoom, setZoom] = useState( -1 );

  const {
    onPanDrag,
    onPermissionBlocked,
    onPermissionDenied,
    onPermissionGranted,
    permissionRequested,
    onZoomToNearby,
    redoSearchInMapArea,
    region,
    showMapBoundaryButton,
    startAtNearby,
    updateMapBoundaries
  } = useMapLocation( );

  const [storedBoundingBoxes, setStoredBoundingBoxes] = useState( {} );
  const obsParams = {
    ...queryParams, return_bounds: true, per_page: 0
  };
  const {
    data
  } = useAuthenticatedQuery(
    ["fetchTaxonBoundingBox"],
    ( optsWithAuth: Object ) => searchObservations( obsParams, optsWithAuth ),
    {
      enabled: obsParams.taxon_id && !storedBoundingBoxes[obsParams.taxon_id]
    }
  );
  // Only update the map once per taxon_id, so that it only zooms to the
  // bounding box on initial load
  if ( obsParams.taxon_id && !storedBoundingBoxes[obsParams.taxon_id] ) {
    if ( data && data.total_bounds && data.total_bounds.nelat !== undefined ) {
      const boundsRegion = getMapRegion( data.total_bounds );
      updateMapBoundaries( boundsRegion );
      setStoredBoundingBoxes( {
        ...storedBoundingBoxes,
        [obsParams.taxon_id]: boundsRegion
      } );
    }
  }

  const tileMapParams = {
    ...queryParams
  };
  // Tile queries never need these params
  delete tileMapParams.return_bounds;
  delete tileMapParams.order;
  delete tileMapParams.orderBy;

  return (
    <View className="flex-1 overflow-hidden h-full">
      <View className="z-10">
        {showMapBoundaryButton && (
          <View
            className="mx-auto"
            style={DROP_SHADOW}
          >
            <Button
              text={t( "REDO-SEARCH-IN-MAP-AREA" )}
              level="focus"
              className="top-[60px] absolute self-center"
              onPress={redoSearchInMapArea}
            />
          </View>
        )}
      </View>
      { isDebug && (
        <View
          className={classnames(
            "absolute",
            "left-5",
            "bottom-[140px]",
            "bg-deeppink",
            "p-1",
            "z-10"
          )}
        >
          <Body1 className="text-white">
            {`Zoom: ${zoom}`}
          </Body1>
        </View>
      ) }
      <Map
        currentLocationButtonClassName="left-5 bottom-20"
        observations={observations}
        onPanDrag={onPanDrag}
        onRegionChangeComplete={async ( newRegion, boundaries ) => {
          // Seems to be a bug in react-native-maps where
          // onRegionChangeComplete fires once on initial load before the
          // region actually changes, so we're just ignoring that update
          // here
          if ( Platform.OS === "android" && Math.round( newRegion.latitude ) === 0 ) {
            return;
          }
          await updateMapBoundaries( newRegion, boundaries );
          if ( startAtNearby ) {
            onZoomToNearby( newRegion, boundaries );
          }
        }}
        onZoomToNearby={onZoomToNearby}
        onZoomChange={newZoom => setZoom( newZoom )}
        region={region}
        showCurrentLocationButton
        showExplore
        showSwitchMapTypeButton
        showsCompass={false}
        startAtNearby={startAtNearby}
        switchMapTypeButtonClassName="left-20 bottom-20"
        tileMapParams={tileMapParams}
        withPressableObsTiles={tileMapParams !== null}
        onPermissionBlocked={onPermissionBlocked}
        onPermissionDenied={onPermissionDenied}
        onPermissionGranted={onPermissionGranted}
        permissionRequested={permissionRequested}
        currentLocationZoomLevel={15}
      />
    </View>
  );
};

export default MapView;
