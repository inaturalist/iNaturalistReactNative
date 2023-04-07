// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import {
  Button, KebabMenu, StickyToolbar
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext, RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback, useContext, useEffect, useState
} from "react";
import { ActivityIndicator, BackHandler } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Menu } from "react-native-paper";
import Photo from "realmModels/Photo";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useLocalObservation from "sharedHooks/useLocalObservation";
import colors from "styles/tailwindColors";

import DeleteObservationSheet from "./DeleteObservationSheet";
import EvidenceSection from "./EvidenceSection";
import IdentificationSection from "./IdentificationSection";
import MultipleObservationsArrows from "./MultipleObservationsArrows";
import ObsEditHeaderTitle from "./ObsEditHeaderTitle";
import OtherDataSection from "./OtherDataSection";
import SaveDialog from "./SaveDialog";

const { useRealm } = RealmContext;

const ObsEdit = ( ): Node => {
  const [deleteSheetVisible, setDeleteSheetVisible] = useState( false );
  const {
    currentObservation,
    observations,
    saveObservation,
    saveAndUploadObservation,
    setObservations,
    resetObsEditContext,
    setNextScreen,
    loading,
    setLoading,
    unsavedChanges
  } = useContext( ObsEditContext );
  const obsPhotos = currentObservation?.observationPhotos;
  const photoUris = obsPhotos ? Array.from( obsPhotos ).map(
    obsPhoto => Photo.displayLocalOrRemoteSquarePhoto( obsPhoto.photo )
  ) : [];
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const localObservation = useLocalObservation( params?.uuid );
  const currentUser = useCurrentUser( );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const [initialPhotoSelected, setInitialPhotoSelected] = useState( null );
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

  const showModal = ( ) => setMediaViewerVisible( true );
  const hideModal = ( ) => setMediaViewerVisible( false );

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

  const realm = useRealm( );

  const setPhotos = uris => {
    const updatedObservations = observations;
    const updatedObsPhotos = Array.from( currentObservation.observationPhotos )
      .filter( obsPhoto => {
        const { photo } = obsPhoto;
        if ( uris.includes( photo.url || photo.localFilePath ) ) {
          return obsPhoto;
        }
        return false;
      } );
    // when updatedObsPhotos is an empty array, Realm apparently writes to the
    // db immediately when you assign, so if you don't do this in write
    // callback it raises an exception
    realm?.write( ( ) => {
      currentObservation.observationPhotos = updatedObsPhotos;
    } );
    setObservations( [...updatedObservations] );
  };

  const handleSelection = photo => {
    setInitialPhotoSelected( photo );
    showModal( );
  };

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
        <MediaViewerModal
          mediaViewerVisible={mediaViewerVisible}
          hideModal={hideModal}
          initialPhotoSelected={initialPhotoSelected}
          photoUris={photoUris}
          setPhotoUris={setPhotos}
        />
        <KeyboardAwareScrollView className="bg-white">
          {observations.length > 1 && <MultipleObservationsArrows />}
          <EvidenceSection
            handleSelection={handleSelection}
            photoUris={photoUris}
          />
          <IdentificationSection />
          <OtherDataSection />
          {loading && <ActivityIndicator />}
        </KeyboardAwareScrollView>
      </View>
      <StickyToolbar containerClass="bottom-6">
        <View className="flex-row justify-evenly">
          <Button
            className="px-[25px]"
            onPress={async ( ) => {
              setLoading( true );
              await saveObservation( );
              setLoading( false );
              setNextScreen( );
            }}
            testID="ObsEdit.saveButton"
            text={t( "SAVE" )}
            level="neutral"

          />
          <Button
            className="ml-3 grow"
            level="focus"
            text={t( "UPLOAD-NOW" )}
            testID="ObsEdit.uploadButton"
            onPress={async ( ) => {
              setLoading( true );
              await saveAndUploadObservation( );
              setLoading( false );
              setNextScreen( );
            }}
            disabled={!currentUser}
          />
        </View>
      </StickyToolbar>
    </>
  );
};

export default ObsEdit;
