// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import { MAX_PHOTOS_ALLOWED } from "components/Camera/StandardCamera/StandardCamera";
import {
  ActivityIndicator,
  Body3, Body4, Heading4, INatIcon
} from "components/SharedComponents";
import LocationPermissionGate from "components/SharedComponents/LocationPermissionGate";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import useTranslation from "sharedHooks/useTranslation";

import DatePicker from "./DatePicker";
import EvidenceList from "./EvidenceList";
import AddEvidenceSheet from "./Sheets/AddEvidenceSheet";

type Props = {
  currentObservation: Object,
  handleDragAndDrop: Function,
  isFetchingLocation: boolean,
  locationPermissionNeeded: boolean,
  locationTextClassNames: any,
  onLocationPermissionBlocked: Function,
  onLocationPermissionDenied: Function,
  onLocationPermissionGranted: Function,
  passesEvidenceTest: Function,
  photos: Array<Object>,
  setShowAddEvidenceSheet: Function,
  showAddEvidenceSheet: boolean,
  updateObservationKeys: Function,
}

const EvidenceSection = ( {
  currentObservation,
  handleDragAndDrop,
  isFetchingLocation,
  locationPermissionNeeded,
  locationTextClassNames,
  onLocationPermissionBlocked,
  onLocationPermissionDenied,
  onLocationPermissionGranted,
  passesEvidenceTest,
  photos,
  setShowAddEvidenceSheet,
  showAddEvidenceSheet,
  updateObservationKeys
}: Props ): Node => {
  const { t } = useTranslation( );
  const theme = useTheme( );
  const obsPhotos = currentObservation?.observationPhotos;
  const navigation = useNavigation( );

  const navToLocationPicker = ( ) => {
    navigation.navigate( "LocationPicker", { goBackOnSave: true } );
  };

  const latitude = currentObservation?.latitude;
  const longitude = currentObservation?.longitude;

  const displayPlaceName = ( ) => {
    let placeName = "";
    if ( currentObservation?.place_guess ) {
      placeName = currentObservation?.place_guess;
    } else if ( isFetchingLocation ) {
      placeName = t( "Fetching-location" );
    } else if ( !latitude || !longitude ) {
      return t( "Add-Location" );
    }
    return placeName;
  };

  const displayLocation = ( ) => {
    if ( isFetchingLocation && ( !latitude || !longitude ) ) {
      return t( "Stay-on-this-screen" );
    }
    if ( !latitude || !longitude ) {
      return t( "No-Location" );
    }
    return t( "Lat-Lon-Acc", {
      latitude,
      longitude,
      accuracy: currentObservation?.positional_accuracy?.toFixed( 0 ) || t( "none" )
    } );
  };

  return (
    <View className="mx-6">
      <AddEvidenceSheet
        disableAddingMoreEvidence={obsPhotos?.length >= MAX_PHOTOS_ALLOWED}
        hidden={!showAddEvidenceSheet}
        onClose={( ) => setShowAddEvidenceSheet( false )}
      />
      <View className="flex-row">
        <Heading4>{t( "EVIDENCE" )}</Heading4>
        <View className="ml-3">
          {passesEvidenceTest( ) && (
            <INatIcon name="checkmark-circle" size={19} color={theme.colors.secondary} />
          )}
          {passesEvidenceTest( ) === false && (
            <INatIcon name="triangle-exclamation" size={19} color={theme.colors.error} />
          )}
        </View>
      </View>
      <EvidenceList
        photos={photos}
        handleAddEvidence={( ) => setShowAddEvidenceSheet( true )}
        handleDragAndDrop={handleDragAndDrop}
      />
      <Pressable
        accessibilityRole="button"
        className="flex-row flex-nowrap pb-3"
        onPress={navToLocationPicker}
        accessibilityLabel={t( "Navigate-to-location-picker-screen" )}
      >
        <View className="w-[30px] items-center mr-1">
          {isFetchingLocation && (
            <ActivityIndicator
              testID="EvidenceSection.fetchingLocationIndicator"
              size={25}
            />
          )}
          <View className={isFetchingLocation && "bottom-5"}>
            <INatIcon size={14} name="map-marker-outline" />
          </View>
        </View>
        <View>
          {
            displayPlaceName( )
              ? (
                <>
                  <Body3 className={classnames( locationTextClassNames )}>
                    {displayPlaceName( )}
                  </Body3>
                  <Body4 className={classnames( locationTextClassNames )}>
                    {displayLocation( )}
                  </Body4>
                </>
              )
              : (
                <Body3 className={classnames( locationTextClassNames )}>
                  {displayLocation( )}
                </Body3>
              )
          }
        </View>
      </Pressable>
      <DatePicker
        currentObservation={currentObservation}
        updateObservationKeys={updateObservationKeys}
      />
      <LocationPermissionGate
        permissionNeeded={locationPermissionNeeded}
        onPermissionGranted={onLocationPermissionGranted}
        onPermissionDenied={onLocationPermissionDenied}
        onPermissionBlocked={onLocationPermissionBlocked}
        withoutNavigation
      />
    </View>
  );
};

export default EvidenceSection;
