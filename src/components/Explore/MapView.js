// @flow

import { Button, LocationPermissionGate, Map } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";
import { getShadowStyle } from "styles/global";

import useMapLocation from "./hooks/useMapLocation";

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 4,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 6
} );

type Props = {
  observations: Array<Object>,
  queryParams: Object
}

const MapView = ( {
  observations,
  queryParams: tileMapParams
}: Props ): Node => {
  const theme = useTheme( );
  const { t } = useTranslation( );

  const {
    onPanDrag,
    onPermissionGranted,
    permissionRequested,
    redoSearchInMapArea,
    region,
    showMapBoundaryButton,
    startAtUserLocation,
    updateMapBoundaries
  } = useMapLocation( );

  return (
    <>
      <View className="z-10">
        {showMapBoundaryButton && (
          <View
            className="mx-auto"
            style={getShadow( theme.colors.primary )}
          >
            <Button
              text={t( "REDO-SEARCH-IN-MAP-AREA" )}
              level="focus"
              className="top-6 absolute self-center"
              onPress={redoSearchInMapArea}
            />
          </View>
        )}
      </View>
      {startAtUserLocation !== null && (
        <Map
          currentLocationButtonClassName="left-5 bottom-20"
          getMapBoundaries={updateMapBoundaries}
          mapViewClassName="-mt-4"
          minZoomLevel={startAtUserLocation && 10}
          observations={observations}
          onPanDrag={onPanDrag}
          region={region}
          showCurrentLocationButton
          showExplore
          showSwitchMapTypeButton
          showsCompass={false}
          startAtUserLocation={startAtUserLocation}
          switchMapTypeButtonClassName="left-20 bottom-20"
          tileMapParams={tileMapParams}
          withPressableObsTiles={tileMapParams !== null}
        />
      )}
      <LocationPermissionGate
        permissionNeeded={permissionRequested}
        onPermissionGranted={onPermissionGranted}
        withoutNavigation
      />
    </>
  );
};

export default MapView;
