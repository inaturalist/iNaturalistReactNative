// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import { MAX_PHOTOS_ALLOWED } from "components/Camera/StandardCamera/StandardCamera";
import {
  ActivityIndicator,
  Body3, Body4, Heading4, INatIcon
} from "components/SharedComponents";
import { MAX_SOUNDS_ALLOWED } from "components/SoundRecorder/SoundRecorder";
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
  isFetchingLocation: boolean,
  locationTextClassNames: Array<string>,
  passesEvidenceTest: Function,
  observationPhotos: Array<Object>,
  setShowAddEvidenceSheet: Function,
  showAddEvidenceSheet: boolean,
  observationSounds?: Array<{
    id?: number,
    sound: {
      file_url: string,
    },
    uuid: string
  }>,
  updateObservationKeys: Function,
  renderPermissionsGate: Function,
  requestPermissions: Function,
  hasPermissions: boolean
}

const EvidenceSection = ( {
  currentObservation,
  isFetchingLocation,
  locationTextClassNames,
  passesEvidenceTest,
  setShowAddEvidenceSheet,
  showAddEvidenceSheet,
  observationSounds,
  updateObservationKeys,
  renderPermissionsGate,
  requestPermissions,
  hasPermissions
}: Props ): Node => {
  const { t } = useTranslation( );
  const theme = useTheme( );
  // TODO fix this hack, and not with a workaround like
  // checkCamelAndSnakeCase. This component should only ever receive a local
  // Realm Observation or something that quacks like it, *not* a POJO from
  // the API
  const obsPhotos = currentObservation?.observationPhotos || currentObservation?.observation_photos;
  const obsSounds = currentObservation?.observationSounds || currentObservation?.observation_sounds;
  const navigation = useNavigation( );

  const navToLocationPicker = ( ) => {
    navigation.navigate( "LocationPicker", { goBackOnSave: true } );
  };

  const onLocationPress = ( ) => {
    // If we have location permissions, navigate to the location picker
    if ( hasPermissions ) {
      navToLocationPicker();
    } else {
      // If we don't have location permissions, request them
      requestPermissions( );
    }
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
      {showAddEvidenceSheet && (
        <AddEvidenceSheet
          disableAddingMoreEvidence={
            obsPhotos?.length >= MAX_PHOTOS_ALLOWED
            || obsSounds?.length >= MAX_SOUNDS_ALLOWED
          }
          onClose={( ) => setShowAddEvidenceSheet( false )}
        />
      )}
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
        handleAddEvidence={( ) => setShowAddEvidenceSheet( true )}
        observationSounds={observationSounds}
      />
      <Pressable
        accessibilityRole="link"
        className="flex-row flex-nowrap pb-3"
        onPress={onLocationPress}
        accessibilityLabel={t( "Edit-location" )}
      >
        <View className="w-[30px] items-center mr-1">
          {isFetchingLocation && (
            <ActivityIndicator
              testID="EvidenceSection.fetchingLocationIndicator"
              size={25}
            />
          )}
          <View
            className={classnames(
              // This line makes sure the icon is centered in the height
              // of the Body3 label next to it
              "h-[18px] items-center justify-center",
              isFetchingLocation && "bottom-5"
            )}
          >
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
      {renderPermissionsGate( {
        // If the user does not give location permissions in any form,
        // navigate to the location picker (if granted we just continue fetching the location)
        onRequestDenied: ( ) => {
          navToLocationPicker();
        },
        onRequestBlocked: ( ) => {
          navToLocationPicker();
        },
        onModalHide: ( ) => {
          if ( !hasPermissions ) navToLocationPicker();
        }
      } )}
      <DatePicker
        currentObservation={currentObservation}
        updateObservationKeys={updateObservationKeys}
      />
    </View>
  );
};

export default EvidenceSection;
