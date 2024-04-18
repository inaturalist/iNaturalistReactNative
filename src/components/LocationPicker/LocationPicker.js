// @flow

import classnames from "classnames";
import {
  CloseButton,
  Heading4,
  Map,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
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
  accuracy: number,
  accuracyTest: string,
  goBackOnSave: ( ) => void,
  hidePlaceResults: boolean,
  keysToUpdate: object,
  loading: boolean,
  locationName: ?string,
  mapType: string,
  mapViewRef: any,
  region: object,
  selectPlaceResult: ( ) => void,
  setMapReady: ( ) => void,
  showCrosshairs: boolean,
  updateLocationName: ( ) => void,
  updateRegion: ( ) => void,
  updateObservationKeys: ( ) => void
};

const LocationPicker = ( {
  accuracy,
  accuracyTest,
  goBackOnSave,
  hidePlaceResults,
  keysToUpdate,
  loading,
  locationName,
  mapViewRef,
  mapType,
  region,
  selectPlaceResult,
  setMapReady = ( ) => { },
  showCrosshairs,
  updateLocationName,
  updateRegion,
  updateObservationKeys
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
      <View className="flex-grow">
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
          className={classnames(
            "absolute",
            "z-10",
            "flex-1",
            "items-center",
            "justify-center",
            "w-full",
            "h-full"
          )}
          pointerEvents="none"
        >
          {showCrosshairs && (
            <CrosshairCircle
              accuracyTest={accuracyTest}
              getShadow={getShadow}
            />
          )}
        </View>
        <View className="top-1/2 left-1/2 absolute z-10">
          {loading && <LoadingIndicator getShadow={getShadow} theme={theme} />}
        </View>
        <Map
          className="h-full"
          showsCompass={false}
          region={region}
          mapViewRef={mapViewRef}
          mapType={mapType}
          onRegionChangeComplete={async newRegion => {
            updateRegion( newRegion );
          }}
          onMapReady={setMapReady}
          showCurrentLocationButton
          showSwitchMapTypeButton
          obsLatitude={region.latitude}
          obsLongitude={region.longitude}
          testID="LocationPicker.Map"
        />
      </View>
      <Footer
        keysToUpdate={keysToUpdate}
        goBackOnSave={goBackOnSave}
        updateObservationKeys={updateObservationKeys}
      />
    </ViewWrapper>
  );
};

export default LocationPicker;
