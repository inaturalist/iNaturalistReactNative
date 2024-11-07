// @flow

import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import navigateToObsDetails from "components/ObsDetails/helpers/navigateToObsDetails";
import { BackButton, Heading2, KebabMenu } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback, useState
} from "react";
import { BackHandler } from "react-native";
import { Menu } from "react-native-paper";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

import DeleteObservationSheet from "./Sheets/DeleteObservationSheet";
import DiscardChangesSheet from "./Sheets/DiscardChangesSheet";
import DiscardObservationSheet from "./Sheets/DiscardObservationSheet";

type Props = {
  observations: Array<Object>,
  currentObservation: Object
}

const ObsEditHeader = ( {
  observations,
  currentObservation
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

  const navToObsList = useCallback( ( ) => {
    navigation.navigate( "TabNavigator", {
      screen: "TabStackNavigator",
      params: {
        screen: "ObsList"
      }
    } );
  }, [navigation] );

  const discardChanges = useCallback( ( ) => {
    setDiscardChangesSheetVisible( false );
    navigateToObsDetails( navigation, currentObservation?.uuid );
  }, [currentObservation?.uuid, navigation] );

  const discardObservation = useCallback( ( ) => {
    setDiscardObservationSheetVisible( false );
    navToObsList( );
  }, [navToObsList] );

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
        maxFontSizeMultiplier={1.5}
        testID="new-observation-text"
        accessible
        accessibilityRole="header"
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
    } else if ( shouldNavigateBack ) {
      navigation.goBack( );
    } else if ( !savedLocally || savedOrUploadedMultiObsFlow === true ) {
      setDiscardObservationSheetVisible( true );
    } else if ( unsavedChanges ) {
      setDiscardChangesSheetVisible( true );
    } else {
      navigateToObsDetails( navigation, currentObservation?.uuid );
    }
  }, [
    currentObservation?.uuid,
    navigation,
    params?.lastScreen,
    savedLocally,
    savedOrUploadedMultiObsFlow,
    shouldNavigateBack,
    unsavedChanges
  ] );

  const renderBackButton = useCallback( ( ) => {
    const extraStart = {
      marginStart: 15
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

      BackHandler.addEventListener( "hardwareBackPress", onBackPress );

      return ( ) => BackHandler.removeEventListener( "hardwareBackPress", onBackPress );
    }, [handleBackButtonPress] )
  );

  const renderKebabMenu = useCallback( ( ) => (
    <KebabMenu
      visible={kebabMenuVisible}
      setVisible={setKebabMenuVisible}
      large
    >
      <Menu.Item
        testID="Header.delete-observation"
        onPress={( ) => {
          setDeleteSheetVisible( true );
          setKebabMenuVisible( false );
        }}
        title={t( "Delete-observation" )}
      />
      { observations.length > 1 && (
        <Menu.Item
          testID="Header.delete-all-observation"
          onPress={( ) => {
            setDiscardObservationSheetVisible( true );
            setKebabMenuVisible( false );
          }}
          title={t( "Delete-all-observations" )}
        />
      ) }
    </KebabMenu>
  ), [
    kebabMenuVisible,
    observations,
    setDeleteSheetVisible,
    t
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
          navToObsList={navToObsList}
          observations={observations}
          currentObservation={currentObservation}
          updateObservations={updateObservations}
        />
      )}
      {discardObservationSheetVisible && (
        <DiscardObservationSheet
          discardObservation={discardObservation}
          onPressClose={( ) => setDiscardObservationSheetVisible( false )}
          navToObsList={navToObsList}
          observations={observations}
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
