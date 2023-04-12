// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Heading2, KebabMenu } from "components/SharedComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback, useContext, useEffect, useState
} from "react";
import { BackHandler } from "react-native";
import { Menu } from "react-native-paper";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

import SaveDialog from "./SaveDialog";

type Props = {
  setDeleteSheetVisible: Function
}

const Header = ( { setDeleteSheetVisible }: Props ): Node => {
  const {
    observations,
    unsavedChanges,
    setObservations
  } = useContext( ObsEditContext );
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const [kebabMenuVisible, setKebabMenuVisible] = useState( false );
  const [showSaveDialog, setShowSaveDialog] = useState( false );

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
    if ( unsavedChanges ) {
      setShowSaveDialog( true );
    } else {
      discardChanges( );
    }
  }, [unsavedChanges, discardChanges] );

  const renderBackButton = useCallback( ( ) => (
    <HeaderBackButton
      tintColor={colors.black}
      onPress={handleBackButtonPress}
    />
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
    <KebabMenu
      visible={kebabMenuVisible}
      setVisible={setKebabMenuVisible}
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
    <SaveDialog
      showSaveDialog={showSaveDialog}
      discardChanges={discardChanges}
    />
  );
};

export default Header;
