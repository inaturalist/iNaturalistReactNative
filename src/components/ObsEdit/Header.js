// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { Heading2, KebabMenu } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback, useContext, useEffect, useState
} from "react";
import { BackHandler } from "react-native";
import { Menu } from "react-native-paper";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

import DeleteObservationSheet from "./Sheets/DeleteObservationSheet";
import DiscardChangesSheet from "./Sheets/DiscardChangesSheet";
import DiscardObservationSheet from "./Sheets/DiscardObservationSheet";

const Header = ( ): Node => {
  const {
    observations,
    setObservations,
    currentObservation,
    unsavedChanges
  } = useContext( ObsEditContext );
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const [deleteSheetVisible, setDeleteSheetVisible] = useState( false );
  const [kebabMenuVisible, setKebabMenuVisible] = useState( false );
  const [discardObservationSheetVisible, setDiscardObservationSheetVisible] = useState( false );
  const [discardChangesSheetVisible, setDiscardChangesSheetVisible] = useState( false );

  const navToObsDetails = useCallback( ( ) => {
    navigation.navigate( "TabNavigator", {
      screen: "ObservationNavigator",
      params: {
        screen: "ObsDetails",
        params: {
          uuid: currentObservation?.uuid
        }
      }
    } );
  }, [navigation, currentObservation] );

  const discardChanges = useCallback( ( ) => {
    setDiscardChangesSheetVisible( false );
    setObservations( [] );
    navToObsDetails( );
  }, [setObservations, navToObsDetails] );

  const discardObservation = useCallback( ( ) => {
    setDiscardObservationSheetVisible( false );
    setObservations( [] );
    navToObsDetails( );
  }, [setObservations, navToObsDetails] );

  const renderHeaderTitle = useCallback( ( ) => (
    <Heading2
      testID="new-observation-text"
      accessible
      accessibilityRole="header"
    >
      {observations.length <= 1
        ? t( "New-Observation" )
        : t( "X-Observations", { count: observations.length } )}
    </Heading2>
  ), [observations, t] );

  const handleBackButtonPress = useCallback( ( ) => {
    const unsyncedObservation = !currentObservation?._synced_at && currentObservation?._created_at;
    console.log( params?.lastScreen, unsyncedObservation, !unsavedChanges, "last screen group" );
    if ( params?.lastScreen === "GroupPhotos"
      || ( unsyncedObservation && !unsavedChanges )
    ) {
      navigation.goBack( );
    } else if ( !currentObservation?._created_at ) {
      setDiscardObservationSheetVisible( true );
    } else if ( unsavedChanges ) {
      setDiscardChangesSheetVisible( true );
    } else {
      navToObsDetails( );
    }
  }, [currentObservation, navigation, unsavedChanges, params, navToObsDetails] );

  const renderBackButton = useCallback( ( ) => (
    <View className="ml-4">
      <HeaderBackButton
        tintColor={colors.black}
        onPress={handleBackButtonPress}
      />
    </View>
  ), [handleBackButtonPress] );

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
    <View className="mr-4">
      <KebabMenu
        visible={kebabMenuVisible}
        setVisible={setKebabMenuVisible}
        large
      >
        <Menu.Item
          onPress={( ) => {
            setDeleteSheetVisible( true );
            setKebabMenuVisible( false );
          }}
          title={
            observations.length > 1
              ? t( "Delete-observations" )
              : t( "Delete-observation" )
          }
        />
      </KebabMenu>
    </View>
  ), [kebabMenuVisible, observations, t, setDeleteSheetVisible] );

  useEffect( ( ) => {
    const headerOptions = {
      headerTitle: currentObservation && renderHeaderTitle,
      headerLeft: renderBackButton,
      headerRight: renderKebabMenu
    };

    navigation.setOptions( headerOptions );
  }, [
    observations,
    navigation,
    renderKebabMenu,
    renderBackButton,
    renderHeaderTitle,
    currentObservation
  ] );

  // prevent header from flickering if observations haven't loaded yet
  if ( observations.length === 0 ) {
    return null;
  }

  return (
    <>
      {deleteSheetVisible && (
        <DeleteObservationSheet
          handleClose={( ) => setDeleteSheetVisible( false )}
        />
      )}
      {discardObservationSheetVisible && (
        <DiscardObservationSheet
          discardObservation={discardObservation}
          handleClose={( ) => setDiscardObservationSheetVisible( false )}
        />
      )}
      {discardChangesSheetVisible && (
        <DiscardChangesSheet
          discardChanges={discardChanges}
          handleClose={( ) => setDiscardChangesSheetVisible( false )}
        />
      )}
    </>
  );
};

export default Header;
