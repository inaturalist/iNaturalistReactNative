// @flow

import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import navigateToObsDetails from "components/ObsDetails/helpers/navigateToObsDetails";
import { BackButton, Heading2, KebabMenu } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback, useState,
} from "react";
import { BackHandler } from "react-native";
import Observation from "realmModels/Observation";
import { useExitObservationFlow, useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

import DeleteObservationSheet from "./Sheets/DeleteObservationSheet";
import DiscardChangesSheet from "./Sheets/DiscardChangesSheet";
import DiscardObservationSheet from "./Sheets/DiscardObservationSheet";

const { useRealm } = RealmContext;

type Props = {
  observations: Object[],
  currentObservation: Object,
  hasBeenUpdated: boolean,
}

const ObsEditHeader = ( {
  observations,
  currentObservation,
  hasBeenUpdated,
}: Props ): Node => {
  const unsavedChanges = useStore( state => state.unsavedChanges );
  const updateObservations = useStore( state => state.updateObservations );
  const savedOrUploadedMultiObsFlow = useStore( state => state.savedOrUploadedMultiObsFlow );
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const [deleteSheetVisible, setDeleteSheetVisible] = useState( false );
  const [kebabMenuVisible, setKebabMenuVisible] = useState( false );
  const [discardObservationSheetVisible, setDiscardObservationSheetVisible] = useState( false );
  const [discardChangesSheetVisible, setDiscardChangesSheetVisible] = useState( false );
  const unsynced = !currentObservation?._synced_at;
  const savedLocally = currentObservation?._created_at;
  const exitObservationFlow = useExitObservationFlow( );
  const realm = useRealm( );

  const discardChanges = useCallback( ( ) => {
    setDiscardChangesSheetVisible( false );
    exitObservationFlow( {
      navigate: ( ) => navigateToObsDetails( navigation, currentObservation?.uuid ),
    } );
  }, [currentObservation?.uuid, exitObservationFlow, navigation] );

  const discardObservation = useCallback( ( ) => {
    setDiscardObservationSheetVisible( false );
    exitObservationFlow( );
  }, [exitObservationFlow] );

  const renderHeaderTitle = useCallback( ( ) => {
    let headingText = "";
    if ( savedLocally ) {
      headingText = t( "Edit-Observation" );
    } else if ( observations.length > 1 ) {
      headingText = t( "X-Observations", { count: observations.length } );
    } else {
      headingText = t( "New-Observation" );
    }
    return (
      <Heading2
        maxFontSizeMultiplier={1}
        testID="new-observation-text"
        accessible
        accessibilityRole="header"
        ellipsizeMode="tail"
      >
        {headingText}
      </Heading2>
    );
  }, [observations, t, savedLocally] );

  const shouldNavigateBack = !savedOrUploadedMultiObsFlow
    && ( params?.lastScreen === "GroupPhotos"
    || ( unsynced && savedLocally )
    || ( unsynced && !unsavedChanges ) );

  const handleBackButtonPress = useCallback( ( ) => {
    if ( params?.lastScreen === "Suggestions" ) {
      navigation.navigate( "Suggestions", { lastScreen: "ObsEdit" } );
    } else if ( params?.lastScreen === "Match" && unsavedChanges ) {
      // When coming from the match screen, we don't have a version of the match to roll back to
      // so if there are changes, they need to restart
      // In the future, we'll support a rollback https://linear.app/inaturalist/issue/MOB-1091/match-screen-edit-flow-should-roll-back-changes-on-back-navigation
      if ( hasBeenUpdated ) {
        setDiscardObservationSheetVisible( true );
      } else {
        navigation.goBack( );
      }
    } else if ( shouldNavigateBack ) {
      navigation.goBack( );
    } else if ( !savedLocally || savedOrUploadedMultiObsFlow === true ) {
      setDiscardObservationSheetVisible( true );
    } else if ( unsavedChanges ) {
      setDiscardChangesSheetVisible( true );
    } else {
      exitObservationFlow( {
        navigate: ( ) => navigateToObsDetails( navigation, currentObservation?.uuid ),
      } );
    }
  }, [
    currentObservation?.uuid,
    exitObservationFlow,
    navigation,
    params?.lastScreen,
    savedLocally,
    savedOrUploadedMultiObsFlow,
    shouldNavigateBack,
    unsavedChanges,
    hasBeenUpdated,
  ] );

  const renderBackButton = useCallback( ( ) => {
    const extraStart = {
      marginStart: 15,
    };
    return (
      <BackButton
        onPress={handleBackButtonPress}
        customStyles={extraStart}
        testID="ObsEdit.BackButton"
      />
    );
  }, [handleBackButtonPress] );

  useFocusEffect(
    useCallback( ( ) => {
      // make sure an Android user cannot back out to MyObservations with the back arrow
      // and see a stale observation context state
      const onBackPress = ( ) => {
        handleBackButtonPress( );
        return true;
      };

      const backHandler = BackHandler.addEventListener( "hardwareBackPress", onBackPress );

      return ( ) => backHandler.remove( );
    }, [handleBackButtonPress] ),
  );

  const renderKebabMenu = useCallback( ( ) => (
    <KebabMenu
      visible={kebabMenuVisible}
      setVisible={setKebabMenuVisible}
      large
    >
      <KebabMenu.Item
        isFirst
        testID="Header.delete-observation"
        onPress={( ) => {
          setDeleteSheetVisible( true );
          setKebabMenuVisible( false );
        }}
        title={
          observations.length > 1
            ? t( "Delete-current-observation" )
            : t( "Delete-observation" )
        }
      />
      { observations.length > 1 && (
        <>
          <KebabMenu.Item
            testID="Header.save-all-observation"
            onPress={async ( ) => {
              await Promise.all(
                observations.map( o => Observation.saveLocalObservationForUpload( o, realm ) ),
              );
              exitObservationFlow( );
              setKebabMenuVisible( false );
            }}
            title={t( "Save-all-observations" )}
          />
          <KebabMenu.Item
            testID="Header.delete-all-observation"
            onPress={( ) => {
              setDiscardObservationSheetVisible( true );
              setKebabMenuVisible( false );
            }}
            title={t( "Delete-all-observations" )}
          />
        </>
      ) }
    </KebabMenu>
  ), [
    exitObservationFlow,
    kebabMenuVisible,
    observations,
    realm,
    setDeleteSheetVisible,
    t,
  ] );

  return (
    <View className="flex-row justify-between items-center bg-white">
      {renderBackButton( )}
      {observations.length > 0 && renderHeaderTitle( )}
      <View className="mr-4">
        {observations.length > 0 && renderKebabMenu( )}
      </View>
      {deleteSheetVisible && (
        <DeleteObservationSheet
          onPressClose={( ) => setDeleteSheetVisible( false )}
          observations={observations}
          onDelete={( ) => exitObservationFlow( )}
          currentObservation={currentObservation}
          updateObservations={updateObservations}
        />
      )}
      {discardObservationSheetVisible && (
        <DiscardObservationSheet
          discardObservation={discardObservation}
          onPressClose={( ) => setDiscardObservationSheetVisible( false )}
          observations={observations}
          onSave={( ) => exitObservationFlow( )}
        />
      )}
      {discardChangesSheetVisible && (
        <DiscardChangesSheet
          discardChanges={discardChanges}
          onPressClose={( ) => setDiscardChangesSheetVisible( false )}
        />
      )}
    </View>
  );
};

export default ObsEditHeader;
