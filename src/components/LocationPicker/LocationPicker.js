// @flow

import {
  Body3,
  CloseButton, Heading4,
  INatIconButton,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import MapView from "react-native-maps";
import { useTheme } from "react-native-paper";
import useTranslation from "sharedHooks/useTranslation";
import { getShadowStyle } from "styles/global";

import CrosshairCircle from "./CrosshairCircle";
import DisplayLatLng from "./DisplayLatLng";
import Footer from "./Footer";
import LoadingIndicator from "./LoadingIndicator";
import LocationSearch from "./LocationSearch";

export const DESIRED_LOCATION_ACCURACY = 100;
export const REQUIRED_LOCATION_ACCURACY = 500000;

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 2,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 5
} );

type Props = {
  showMap: boolean,
  loading: boolean,
  accuracyTest: string,
  region: Object,
  mapView: any,
  updateRegion: Function,
  locationName: ?string,
  updateLocationName: Function,
  accuracy: number,
  returnToUserLocation: Function,
  keysToUpdate: Object,
  goBackOnSave: Function,
  toggleMapLayer: Function,
  mapType: string,
  setMapReady: Function,
  selectPlaceResult: Function,
  hidePlaceResults: boolean
};

const LocationPicker = ( {
  showMap,
  loading,
  accuracyTest,
  region,
  mapView,
  updateRegion,
  locationName,
  updateLocationName,
  accuracy,
  returnToUserLocation,
  keysToUpdate,
  goBackOnSave,
  toggleMapLayer,
  mapType,
  setMapReady,
  selectPlaceResult,
  hidePlaceResults
}: Props ): Node => {
  const theme = useTheme( );
  const { t } = useTranslation( );

  return (
    <ViewWrapper testID="location-picker" className="flex-1">
      <View className="justify-center">
        <Heading4 className="self-center my-4">{t( "EDIT-LOCATION" )}</Heading4>
        <View className="absolute right-2">
          <CloseButton black size={19} />
        </View>
      </View>
      <View className="z-20">
        <LocationSearch
          locationName={locationName}
          updateLocationName={updateLocationName}
          getShadow={getShadow}
          selectPlaceResult={selectPlaceResult}
          hidePlaceResults={hidePlaceResults}
        />
      </View>
      <View className="z-10">
        <DisplayLatLng
          region={region}
          accuracy={accuracy}
          getShadow={getShadow}
        />
      </View>
      <View className="top-1/2 left-1/2 absolute z-10">
        {showMap && (
          <CrosshairCircle
            accuracyTest={accuracyTest}
            getShadow={getShadow}
          />
        )}
      </View>
      <View className="top-1/2 left-1/2 absolute z-10">
        {loading && <LoadingIndicator />}
      </View>
      <View className="flex-shrink">
        {showMap
          ? (
            <MapView
              className="h-full"
              showsCompass={false}
              region={region}
              ref={mapView}
              mapType={mapType}
              // TODO: figure out the right zoom level here
              // don't think it's necessary to let a user zoom out far beyond cities
              minZoomLevel={5}
              onRegionChangeComplete={async newRegion => {
                updateRegion( newRegion );
              }}
              onMapReady={setMapReady}
            />
          )
          : (
            <View className="h-full bg-lightGray items-center justify-center">
              <Body3>{t( "Try-searching-for-a-location-name" )}</Body3>
            </View>
          )}
        <View
          style={getShadow( theme.colors.primary )}
          className="absolute bottom-3 bg-white left-3 rounded-full"
        >
          <INatIconButton
            icon="layers"
            onPress={toggleMapLayer}
            height={46}
            width={46}
            size={24}
          />
        </View>
        <View
          style={getShadow( theme.colors.primary )}
          className="absolute bottom-3 bg-white right-3 rounded-full"
        >
          <INatIconButton
            icon="location-crosshairs"
            onPress={returnToUserLocation}
            height={46}
            width={46}
            size={24}
          />
        </View>
      </View>
      <Footer
        keysToUpdate={keysToUpdate}
        goBackOnSave={goBackOnSave}
      />
    </ViewWrapper>
  );
};

export default LocationPicker;
