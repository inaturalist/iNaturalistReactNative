// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { KebabMenu } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback, useContext, useEffect, useState
} from "react";
import { ActivityIndicator, BackHandler } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Menu } from "react-native-paper";
import Photo from "realmModels/Photo";
import useLocalObservation from "sharedHooks/useLocalObservation";
import colors from "styles/tailwindColors";

import BottomButtons from "./BottomButtons";
import EvidenceSection from "./EvidenceSection";
import IdentificationSection from "./IdentificationSection";
import MultipleObservationsArrows from "./MultipleObservationsArrows";
import ObsEditHeaderTitle from "./ObsEditHeaderTitle";
import OtherDataSection from "./OtherDataSection";
import SaveDialog from "./SaveDialog";
import DeleteObservationSheet from "./Sheets/DeleteObservationSheet";

const ObsEdit = ( ): Node => {
  const [deleteSheetVisible, setDeleteSheetVisible] = useState( false );
  const {
    currentObservation,
    observations,
    setObservations,
    resetObsEditContext,
    loading,
    unsavedChanges
  } = useContext( ObsEditContext );
  const obsPhotos = currentObservation?.observationPhotos;
  const photoUris = obsPhotos ? Array.from( obsPhotos ).map(
    obsPhoto => Photo.displayLocalOrRemoteSquarePhoto( obsPhoto.photo )
  ) : [];
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const localObservation = useLocalObservation( params?.uuid );
  const [kebabMenuVisible, setKebabMenuVisible] = useState( false );
  const [showSaveDialog, setShowSaveDialog] = useState( false );

  useEffect( ( ) => {
    // when first opening an observation from ObsDetails, fetch local observation from realm
    // and set this in obsEditContext

    // If the obs requested in params is not the observation in context, clear
    // the context and set the obs requested in params as the current
    // observation
    const obsChanged = localObservation && localObservation?.uuid !== currentObservation?.uuid;
    if ( obsChanged ) {
      resetObsEditContext( );
      // need .toJSON( ) to be able to add evidence to an existing local observation
      // otherwise, get a realm error about modifying managed objects outside of a write transaction
      setObservations( [localObservation.toJSON( )] );
    }
  }, [localObservation, setObservations, resetObsEditContext, currentObservation] );

  const discardChanges = useCallback( ( ) => {
    setObservations( [] );
    navigation.goBack( );
  }, [navigation, setObservations] );

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
  ), [kebabMenuVisible, observations] );

  useEffect( ( ) => {
    const renderHeaderTitle = ( ) => <ObsEditHeaderTitle />;
    const headerOptions = {
      headerTitle: renderHeaderTitle,
      headerLeft: renderBackButton,
      headerRight: renderKebabMenu
    };

    navigation.setOptions( headerOptions );
  }, [observations, navigation, renderKebabMenu, localObservation, renderBackButton] );

  if ( !currentObservation ) { return null; }

  return (
    <>
      <View testID="obs-edit" className="bg-white flex-1">
        {deleteSheetVisible && (
          <DeleteObservationSheet
            handleClose={( ) => setDeleteSheetVisible( false )}
          />
        )}
        <SaveDialog
          showSaveDialog={showSaveDialog}
          discardChanges={discardChanges}
        />
        <KeyboardAwareScrollView className="bg-white">
          {observations.length > 1 && <MultipleObservationsArrows />}
          <EvidenceSection
            photoUris={photoUris}
          />
          <IdentificationSection />
          <OtherDataSection />
          {loading && <ActivityIndicator />}
        </KeyboardAwareScrollView>
      </View>
      <BottomButtons />
    </>
  );
};

export default ObsEdit;
