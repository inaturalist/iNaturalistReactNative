// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import { MAX_PHOTOS_ALLOWED } from "components/Camera/StandardCamera/StandardCamera";
import {
  Body3, Body4, Heading4, INatIcon
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { ActivityIndicator, useTheme } from "react-native-paper";
import Photo from "realmModels/Photo";
import useTranslation from "sharedHooks/useTranslation";

import DatePicker from "./DatePicker";
import EvidenceList from "./EvidenceList";
import AddEvidenceSheet from "./Sheets/AddEvidenceSheet";

type Props = {
  passesEvidenceTest: Function,
  handleDragAndDrop: Function,
  showMediaViewer: Function,
  isFetchingLocation: boolean,
  locationTextClassNames: any,
  evidenceList: Array<string>,
  setShowAddEvidenceSheet: Function,
  showAddEvidenceSheet: boolean,
  setTakePhoto: Function,
  setImportPhoto: Function,
  setRecordSound: Function,
  savingPhoto: boolean
}

const EvidenceSection = ( {
  locationTextClassNames,
  handleDragAndDrop,
  showMediaViewer,
  passesEvidenceTest,
  isFetchingLocation,
  evidenceList,
  setShowAddEvidenceSheet,
  showAddEvidenceSheet,
  setTakePhoto,
  setImportPhoto,
  setRecordSound,
  savingPhoto
}: Props ): Node => {
  const { t } = useTranslation( );
  const theme = useTheme( );
  const {
    currentObservation
  } = useContext( ObsEditContext );
  const obsPhotos = currentObservation?.observationPhotos;
  const photoUris = obsPhotos
    ? Array.from( obsPhotos ).map(
      obsPhoto => Photo.displayLocalOrRemoteSquarePhoto( obsPhoto.photo )
    )
    : [];
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
    <View className="mx-6 mt-6">
      <AddEvidenceSheet
        setShowAddEvidenceSheet={setShowAddEvidenceSheet}
        disableAddingMoreEvidence={photoUris.length >= MAX_PHOTOS_ALLOWED}
        hidden={!showAddEvidenceSheet}
        onTakePhoto={( ) => setTakePhoto( true )}
        onImportPhoto={( ) => setImportPhoto( true )}
        onRecordSound={( ) => setRecordSound( true )}
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
        evidenceList={evidenceList}
        handleAddEvidence={( ) => setShowAddEvidenceSheet( true )}
        handleDragAndDrop={handleDragAndDrop}
        showMediaViewer={showMediaViewer}
        savingPhoto={savingPhoto}
      />
      <Pressable
        accessibilityRole="button"
        className="flex-row flex-nowrap my-3"
        onPress={navToLocationPicker}
      >
        <View className="w-[30px] items-center mr-1">
          {isFetchingLocation && <ActivityIndicator />}
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
      <DatePicker currentObservation={currentObservation} />
    </View>
  );
};

export default EvidenceSection;
