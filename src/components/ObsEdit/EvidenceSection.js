// @flow

import classnames from "classnames";
import { MAX_PHOTOS_ALLOWED } from "components/Camera/StandardCamera/StandardCamera";
import {
  ActivityIndicator,
  Body2, Body3, Body4, Heading4, INatIcon
} from "components/SharedComponents";
import { MAX_SOUNDS_ALLOWED } from "components/SoundRecorder/SoundRecorder";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

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
  onLocationPress: ( ) => void,
  updateObservationKeys: Function
}

const EvidenceSection = ( {
  currentObservation,
  isFetchingLocation,
  locationTextClassNames,
  passesEvidenceTest,
  setShowAddEvidenceSheet,
  showAddEvidenceSheet,
  observationSounds,
  onLocationPress,
  updateObservationKeys
}: Props ): Node => {
  const { t } = useTranslation( );
  // TODO fix this hack, and not with a workaround like
  // checkCamelAndSnakeCase. This component should only ever receive a local
  // Realm Observation or something that quacks like it, *not* a POJO from
  // the API
  const obsPhotos = currentObservation?.observationPhotos || currentObservation?.observation_photos;
  const obsSounds = currentObservation?.observationSounds || currentObservation?.observation_sounds;

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
      accuracy: currentObservation?.positional_accuracy?.toFixed( 0 ) || t( "none--accuracy" )
    } );
  };

  return (
    <View className="mt-4">
      {showAddEvidenceSheet && (
        <AddEvidenceSheet
          disableAddingMoreEvidence={
            obsPhotos?.length >= MAX_PHOTOS_ALLOWED
            || obsSounds?.length >= MAX_SOUNDS_ALLOWED
          }
          onClose={( ) => setShowAddEvidenceSheet( false )}
        />
      )}
      <View className="ml-6 flex-row">
        <Heading4>{t( "EVIDENCE" )}</Heading4>
        <View className="ml-3">
          {passesEvidenceTest( ) && (
            <INatIcon name="checkmark-circle" size={19} color={colors.inatGreen} />
          )}
          {passesEvidenceTest( ) === false && (
            <INatIcon name="triangle-exclamation" size={19} color={colors.warningRed} />
          )}
        </View>
      </View>
      <EvidenceList
        handleAddEvidence={( ) => setShowAddEvidenceSheet( true )}
        observationSounds={observationSounds}
      />
      <Pressable
        accessibilityRole="link"
        className="ml-6 flex-row flex-nowrap pt-1"
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
              // of the Body2 label next to it
              "h-[19px] items-center justify-center",
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
                  <Body2 className={classnames( locationTextClassNames )}>
                    {displayPlaceName( )}
                  </Body2>
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
      <View className="ml-6">
        <DatePicker
          currentObservation={currentObservation}
          updateObservationKeys={updateObservationKeys}
        />
      </View>
    </View>
  );
};

export default EvidenceSection;
