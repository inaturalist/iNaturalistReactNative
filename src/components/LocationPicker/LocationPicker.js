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
import { ActivityIndicator, useTheme } from "react-native-paper";
import useTranslation from "sharedHooks/useTranslation";
import { getShadowStyle } from "styles/global";
import colors from "styles/tailwindColors";

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
  accuracy: number,
  accuracyTest: string,
  goBackOnSave: Function,
  fetchingLocation: boolean,
  hidePlaceResults: boolean,
  keysToUpdate: Object,
  loading: boolean,
  locationName: ?string,
  mapType: string,
  mapView: any,
  region: Object,
  returnToUserLocation: Function,
  selectPlaceResult: Function,
  setMapReady: Function,
  showMap: boolean,
  toggleMapLayer: Function,
  updateLocationName: Function,
  updateRegion: Function,
};

const LocationPicker = ( {
  accuracy,
  accuracyTest,
  goBackOnSave,
  fetchingLocation,
  hidePlaceResults,
  keysToUpdate,
  loading,
  locationName,
  mapType,
  mapView,
  region,
  returnToUserLocation,
  selectPlaceResult,
  setMapReady,
  showMap,
  toggleMapLayer,
  updateLocationName,
  updateRegion
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
      <View
        className="top-1/2 left-1/2 absolute z-10"
        pointerEvents="none"
      >
        {showMap && (
          <CrosshairCircle
            accuracyTest={accuracyTest}
            getShadow={getShadow}
          />
        )}
      </View>
      <View className="top-1/2 left-1/2 absolute z-10">
        {loading && <LoadingIndicator getShadow={getShadow} theme={theme} />}
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
          {
            fetchingLocation
              ? (
                <INatIconButton
                  disabled
                  height={46}
                  width={46}
                  size={24}
                >
                  <ActivityIndicator color={colors.darkGrayDisabled} />
                </INatIconButton>
              )
              : (
                <INatIconButton
                  icon="location-crosshairs"
                  onPress={returnToUserLocation}
                  height={46}
                  width={46}
                  size={24}
                />
              )
          }
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
