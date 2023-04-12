// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
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

const Header = ( ): Node => {
  const {
    observations,
    unsavedChanges,
    setObservations
  } = useContext( ObsEditContext );
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const [deleteSheetVisible, setDeleteSheetVisible] = useState( false );
  const [kebabMenuVisible, setKebabMenuVisible] = useState( false );
  const [discardChangesSheetVisible, setDiscardChangesSheetVisible] = useState( false );

  const multipleObservations = observations.length > 1;

  const discardChanges = useCallback( ( ) => {
    setObservations( [] );
    navigation.goBack( );
  }, [navigation, setObservations] );

  const renderHeaderTitle = useCallback( ( ) => (
    <Heading2
      testID="new-observation-text"
      accessible
      accessibilityRole="header"
    >
      {observations.length === 1
        ? t( "New-Observation" )
        : t( "X-Observations", { count: observations.length } )}
    </Heading2>
  ), [observations, t] );

  const handleBackButtonPress = useCallback( ( ) => {
    if ( unsavedChanges || multipleObservations ) {
      setDiscardChangesSheetVisible( true );
    } else {
      discardChanges( );
    }
  }, [unsavedChanges, discardChanges, multipleObservations] );

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
            observations.length > 0
              ? t( "Delete-observations" )
              : t( "Delete-observation" )
          }
        />
      </KebabMenu>
    </View>
  ), [kebabMenuVisible, observations, t, setDeleteSheetVisible] );

  useEffect( ( ) => {
    const headerOptions = {
      headerTitle: renderHeaderTitle,
      headerLeft: renderBackButton,
      headerRight: renderKebabMenu
    };

    navigation.setOptions( headerOptions );
  }, [
    observations,
    navigation,
    renderKebabMenu,
    renderBackButton,
    renderHeaderTitle
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
      {discardChangesSheetVisible && (
        <DiscardChangesSheet handleClose={( ) => discardChanges( )} />
      )}
    </>
  );
};

export default Header;
