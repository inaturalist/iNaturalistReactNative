// @flow

import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import MediaViewer from "components/MediaViewer/MediaViewer";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import Button from "components/SharedComponents/Buttons/Button";
import KebabMenu from "components/SharedComponents/KebabMenu";
import ScrollNoFooter from "components/SharedComponents/ScrollNoFooter";
import { Text, View } from "components/styledComponents";
import { ObsEditContext, RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback,
  useContext, useEffect, useState
} from "react";
import { useTranslation } from "react-i18next";
import { BackHandler } from "react-native";
import { Menu } from "react-native-paper";
import Photo from "realmModels/Photo";
import useLocalObservation from "sharedHooks/useLocalObservation";
import useLoggedIn from "sharedHooks/useLoggedIn";

import AddEvidenceModal from "./AddEvidenceModal";
import DeleteObservationDialog from "./DeleteObservationDialog";
import EvidenceSection from "./EvidenceSection";
import IdentificationSection from "./IdentificationSection";
import ObsEditHeaderTitle from "./ObsEditHeaderTitle";
import OtherDataSection from "./OtherDataSection";

const { useRealm } = RealmContext;

const ObsEdit = ( ): Node => {
  const [deleteDialogVisible, setDeleteDialogVisible] = useState( false );
  const {
    currentObservation,
    observations,
    saveObservation,
    saveAndUploadObservation,
    setObservations,
    resetObsEditContext
  } = useContext( ObsEditContext );
  const obsPhotos = currentObservation?.observationPhotos;
  const photoUris = obsPhotos ? Array.from( obsPhotos ).map(
    obsPhoto => Photo.displayLocalOrRemoteSquarePhoto( obsPhoto.photo )
  ) : [];
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { t } = useTranslation( );
  const localObservation = useLocalObservation( params?.uuid );
  const isLoggedIn = useLoggedIn( );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const [initialPhotoSelected, setInitialPhotoSelected] = useState( null );
  const [showAddEvidenceModal, setShowAddEvidenceModal] = useState( false );

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

  const handleBackButtonPress = useCallback( async ( ) => {
    setObservations( [] );
    navigation.goBack( );
  }, [navigation, setObservations] );

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

  const showDialog = ( ) => setDeleteDialogVisible( true );
  const hideDialog = ( ) => setDeleteDialogVisible( false );
  const renderKebabMenu = useCallback( ( ) => (
    <>
      <DeleteObservationDialog
        deleteDialogVisible={deleteDialogVisible}
        hideDialog={hideDialog}
      />
      <KebabMenu>
        <Menu.Item
          onPress={showDialog}
          title={t( "Delete" )}
        />
      </KebabMenu>
    </>
  ), [deleteDialogVisible, t] );

  useEffect( ( ) => {
    const renderHeaderTitle = ( ) => <ObsEditHeaderTitle />;

    navigation.setOptions( {
      headerTitle: renderHeaderTitle,
      headerRight: renderKebabMenu
    } );
  }, [observations, navigation, renderKebabMenu] );

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

  const addEvidence = ( ) => setShowAddEvidenceModal( true );

  if ( !currentObservation ) { return null; }

  return (
    <>
      <MediaViewerModal
        mediaViewerVisible={mediaViewerVisible}
        hideModal={hideModal}
      >
        <MediaViewer
          initialPhotoSelected={initialPhotoSelected}
          photoUris={photoUris}
          setPhotoUris={setPhotos}
          hideModal={hideModal}
        />
      </MediaViewerModal>
      <ScrollNoFooter>
        <Text className="text-2xl ml-4">{t( "Evidence" )}</Text>
        <EvidenceSection
          handleSelection={handleSelection}
          photoUris={photoUris}
          handleAddEvidence={addEvidence}
        />
        <Text className="text-2xl ml-4 mt-4">{t( "Identification" )}</Text>
        <IdentificationSection />
        <Text className="text-2xl ml-4">{t( "Other-Data" )}</Text>
        <OtherDataSection />
        <View className="flex-row justify-evenly">
          <Button
            onPress={saveObservation}
            testID="ObsEdit.saveButton"
            text={t( "SAVE" )}
            level="neutral"

          />
          <Button
            level="primary"
            text="UPLOAD-OBSERVATION"
            testID="ObsEdit.uploadButton"
            onPress={saveAndUploadObservation}
            disabled={!isLoggedIn}
          />
        </View>
        <AddEvidenceModal
          showAddEvidenceModal={showAddEvidenceModal}
          setShowAddEvidenceModal={setShowAddEvidenceModal}
          photoUris={photoUris}
        />
      </ScrollNoFooter>
    </>
  );
};

export default ObsEdit;
