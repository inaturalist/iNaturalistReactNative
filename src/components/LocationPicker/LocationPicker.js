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
import useTranslation from "sharedHooks/useTranslation";

import CrosshairCircle from "./CrosshairCircle";
import DisplayLatLng from "./DisplayLatLng";
import Footer from "./Footer";
import LoadingIndicator from "./LoadingIndicator";
import LocationSearch from "./LocationSearch";

export const DESIRED_LOCATION_ACCURACY = 100;
export const REQUIRED_LOCATION_ACCURACY = 500000;

type Props = {
  accuracy: number,
  accuracyTest: string,
  goBackOnSave: Function,
  hidePlaceResults: boolean,
  keysToUpdate: Object,
  loading: boolean,
  locationName: string,
  mapType: string,
  // $FlowIgnore
  mapViewRef: unknown,
  region: Object,
  selectPlaceResult: Function,
  setMapReady: Function,
  showCrosshairs: boolean,
  updateLocationName: Function,
  updateRegion: Function,
  updateObservationKeys: Function
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
  setMapReady = ( ) => undefined,
  showCrosshairs,
  updateLocationName,
  updateRegion,
  updateObservationKeys
}: Props ): Node => {
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
            selectPlaceResult={selectPlaceResult}
            hidePlaceResults={hidePlaceResults}
          />
        </View>
        <View className="z-10">
          <DisplayLatLng
            region={region}
            accuracy={accuracy}
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
            />
          )}
        </View>
        <View className="top-1/2 left-1/2 absolute z-10">
          {loading && <LoadingIndicator />}
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
