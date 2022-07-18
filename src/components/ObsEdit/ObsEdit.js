// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { Node } from "react";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import {
  Headline, Menu, Modal, Portal
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";

import Photo from "../../models/Photo";
import { ObsEditContext } from "../../providers/contexts";
import useLoggedIn from "../../sharedHooks/useLoggedIn";
import { textStyles, viewStyles } from "../../styles/obsEdit/obsEdit";
import MediaViewer from "../MediaViewer/MediaViewer";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import SecondaryButton from "../SharedComponents/Buttons/SecondaryButton";
import KebabMenu from "../SharedComponents/KebabMenu";
import ScrollNoFooter from "../SharedComponents/ScrollNoFooter";
import DeleteObservationDialog from "./DeleteObservationDialog";
import EvidenceSection from "./EvidenceSection";
import IdentificationSection from "./IdentificationSection";
import OtherDataSection from "./OtherDataSection";

const ObsEdit = ( ): Node => {
  const {
    currentObsIndex,
    setCurrentObsIndex,
    observations,
    saveObservation,
    saveAndUploadObservation,
    setObservations
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { t } = useTranslation( );

  const lastScreen = params?.lastScreen;

  const isLoggedIn = useLoggedIn( );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const [initialPhotoSelected, setInitialPhotoSelected] = useState( null );
  const [photoUris, setPhotoUris] = useState( [] );
  const [deleteDialogVisible, setDeleteDialogVisible] = useState( false );

  const showModal = ( ) => setMediaViewerVisible( true );
  const hideModal = ( ) => setMediaViewerVisible( false );

  const showNextObservation = ( ) => setCurrentObsIndex( currentObsIndex + 1 );
  const showPrevObservation = ( ) => setCurrentObsIndex( currentObsIndex - 1 );

  const showDialog = ( ) => setDeleteDialogVisible( true );
  const hideDialog = ( ) => setDeleteDialogVisible( false );

  const handleBackButtonPress = ( ) => {
    if ( lastScreen === "StandardCamera" ) {
      navigation.navigate( "camera", {
        screen: "StandardCamera",
        params: { photos: photoUris }
      } );
    } else {
      // show modal to dissuade user from going back
      navigation.goBack( );
    }
  };

  const renderKebabMenu = ( ) => (
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
  );

  const renderHeader = ( ) => (
    <View style={viewStyles.headerRow}>
      <HeaderBackButton onPress={handleBackButtonPress} />
      {observations.length === 1
        ? <Headline style={textStyles.verticalCenter}>{t( "New-Observation" )}</Headline>
        : (
          <View style={viewStyles.multipleObsRow}>
            <Pressable onPress={showPrevObservation} style={viewStyles.caret}>
              {currentObsIndex !== 0 && <Icon name="keyboard-arrow-left" size={30} />}
            </Pressable>
            <Text>{`${currentObsIndex + 1} of ${observations.length}`}</Text>
            <Pressable onPress={showNextObservation} style={viewStyles.caret}>
              {( currentObsIndex !== observations.length - 1 )
                && <Icon name="keyboard-arrow-right" size={30} />}
            </Pressable>
          </View>
        )}
      {renderKebabMenu( )}
    </View>
  );

  const currentObs = observations[currentObsIndex];

  const setPhotos = uris => {
    const updatedObservations = observations;
    const updatedObsPhotos = currentObs.observationPhotos.filter( obsPhoto => {
      const { photo } = obsPhoto;
      if ( uris.includes( photo.url || photo.localFilePath ) ) {
        return obsPhoto;
      }
      return false;
    } );
    currentObs.observationPhotos = updatedObsPhotos;
    setObservations( [...updatedObservations] );
  };

  const handleSelection = photo => {
    setInitialPhotoSelected( photo );
    showModal( );
  };

  useEffect( ( ) => {
    if ( !currentObs || !currentObs.observationPhotos ) { return; }
    const uris = currentObs.observationPhotos.map(
      obsPhoto => Photo.displayLocalOrRemoteSquarePhoto( obsPhoto.photo )
    );
    setPhotoUris( uris );
  }, [currentObs] );

  if ( !currentObs ) { return null; }

  return (
    <>
      <Portal>
        <Modal
          visible={mediaViewerVisible}
          onDismiss={hideModal}
          contentContainerStyle={viewStyles.container}
        >
          <MediaViewer
            initialPhotoSelected={initialPhotoSelected}
            photoUris={photoUris}
            setPhotoUris={setPhotos}
            hideModal={hideModal}
          />
        </Modal>
      </Portal>
      <ScrollNoFooter style={mediaViewerVisible && viewStyles.mediaViewerSafeAreaView}>
        {renderHeader( )}
        <Headline style={textStyles.headerText}>{t( "Evidence" )}</Headline>
        <EvidenceSection handleSelection={handleSelection} photoUris={photoUris} />
        <Headline style={textStyles.headerText}>{t( "Identification" )}</Headline>
        <IdentificationSection />
        <Headline style={textStyles.headerText}>{t( "Other-Data" )}</Headline>
        <OtherDataSection />
        <View style={viewStyles.buttonRow}>
          <SecondaryButton
            onPress={saveObservation}
            testID="ObsEdit.saveButton"
          >
            <Text>{t( "SAVE" )}</Text>
          </SecondaryButton>
          <RoundGreenButton
            buttonText="UPLOAD-OBSERVATION"
            testID="ObsEdit.uploadButton"
            handlePress={saveAndUploadObservation}
            disabled={!isLoggedIn}
          />
        </View>
      </ScrollNoFooter>
    </>
  );
};

export default ObsEdit;
