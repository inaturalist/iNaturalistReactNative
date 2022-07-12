// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { Node } from "react";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import { Headline, Modal, Portal } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import Photo from "../../models/Photo";
import { ObsEditContext } from "../../providers/contexts";
import useLoggedIn from "../../sharedHooks/useLoggedIn";
import { textStyles, viewStyles } from "../../styles/obsEdit/obsEdit";
import MediaViewer from "../MediaViewer/MediaViewer";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import ScrollNoFooter from "../SharedComponents/ScrollNoFooter";
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

  const showModal = ( ) => setMediaViewerVisible( true );
  const hideModal = ( ) => setMediaViewerVisible( false );

  const showNextObservation = ( ) => setCurrentObsIndex( currentObsIndex + 1 );
  const showPrevObservation = ( ) => setCurrentObsIndex( currentObsIndex - 1 );

  const renderArrowNavigation = ( ): Node | null => {
    if ( observations.length === 0 ) { return null; }

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

    return (
      <View style={viewStyles.row}>
        <HeaderBackButton onPress={handleBackButtonPress} />
        {observations.length === 1
          ? <Headline>{t( "New-Observation" )}</Headline> : (
            <View style={viewStyles.row}>
              {currentObsIndex !== 0 && (
                <Pressable
                  onPress={showPrevObservation}
                >
                  <Icon name="arrow-left" size={35} />
                </Pressable>
              )}
              <Text>{`${currentObsIndex + 1} of ${observations.length}`}</Text>
              {( currentObsIndex !== observations.length - 1 ) && (
                <Pressable
                  onPress={showNextObservation}
                >
                  <Icon name="arrow-right" size={35} />
                </Pressable>
              )}
            </View>
          )}
        <View />
      </View>
    );
  };

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
        {renderArrowNavigation( )}
        <Headline style={textStyles.headerText}>{t( "Evidence" )}</Headline>
        <EvidenceSection handleSelection={handleSelection} photoUris={photoUris} />
        <Headline style={textStyles.headerText}>{t( "Identification" )}</Headline>
        <IdentificationSection />
        <Headline style={textStyles.headerText}>{t( "Other-Data" )}</Headline>
        <OtherDataSection />
        <View style={viewStyles.row}>
          <View style={viewStyles.saveButton}>
            <RoundGreenButton
              buttonText="save"
              testID="ObsEdit.saveButton"
              handlePress={saveObservation}
            />
          </View>
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
