// @flow

import classnames from "classnames";
import {
  CloseButton,
  Heading4,
  KeyboardDismissableView,
  Map,
  ViewWrapper,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

import CrosshairCircle from "./CrosshairCircle";
import DisplayLatLng from "./DisplayLatLng";
import Footer from "./Footer";
import LoadingIndicator from "./LoadingIndicator";
import LocationSearch from "./LocationSearch";

type Props = {
  accuracy: number,
  handleSave: Function,
  hidePlaceResults: boolean,
  loading: boolean,
  locationName: string,
  initialRegion: Object,
  mapType: string,
  onCurrentLocationPress: Function,
  onMapReady: Function,
  onRegionChangeComplete: Function,
  region: Object,
  regionToAnimate: Object,
  selectPlaceResult: Function,
  updateLocationName: Function,
  onMapLayout: Function,
};

const LocationPicker = ({
  accuracy,
  handleSave,
  hidePlaceResults,
  loading,
  locationName,
  regionToAnimate,
  initialRegion,
  mapType,
  onCurrentLocationPress,
  onMapReady,
  onRegionChangeComplete,
  region,
  selectPlaceResult,
  updateLocationName,
  onMapLayout,
}: Props): Node => {
  const { t } = useTranslation();

  let regionToDisplay;
  if (region && region?.latitude !== 0 && region.longitude !== 0) {
    regionToDisplay = region;
  } else {
    regionToDisplay = initialRegion;
  }
  if (!regionToDisplay) {
    regionToDisplay = {
      latitude: 0,
      longitude: 0,
    };
  }

  return (
    <KeyboardDismissableView>
      <ViewWrapper testID="location-picker">
        <View className="justify-center">
          <Heading4 className="self-center my-4">{t("EDIT-LOCATION")}</Heading4>
          <View className="absolute right-2">
            <CloseButton darkGray size={19} />
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
              region={regionToDisplay}
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
              "h-full",
            )}
            pointerEvents="none"
          >
            {!loading && <CrosshairCircle accuracy={accuracy} />}
          </View>
          <View className="top-1/2 left-1/2 absolute z-10">
            {loading && <LoadingIndicator />}
          </View>
          <Map
            className="h-full"
            initialRegion={initialRegion}
            mapType={mapType}
            onCurrentLocationPress={onCurrentLocationPress}
            onMapReady={onMapReady}
            onRegionChangeComplete={onRegionChangeComplete}
            regionToAnimate={regionToAnimate}
            showCurrentLocationButton
            showSwitchMapTypeButton
            showsCompass={false}
            showsUserLocation
            testID="LocationPicker.Map"
            onMapLayout={onMapLayout}
          />
        </View>
        <Footer handleSave={handleSave} />
      </ViewWrapper>
    </KeyboardDismissableView>
  );
};

export default LocationPicker;
