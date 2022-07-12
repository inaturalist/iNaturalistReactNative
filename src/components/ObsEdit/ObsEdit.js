// @flow

import React, { useContext, useEffect, useState } from "react";
import { Text, Pressable, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { Node } from "react";
import { useTranslation } from "react-i18next";
import { HeaderBackButton } from "@react-navigation/elements";
import { Headline, Portal, Modal, Menu } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";

import ScrollNoFooter from "../SharedComponents/ScrollNoFooter";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import SecondaryButton from "../SharedComponents/Buttons/SecondaryButton";
import { textStyles, viewStyles } from "../../styles/obsEdit/obsEdit";
import { ObsEditContext } from "../../providers/contexts";
import { useLoggedIn } from "../../sharedHooks/useLoggedIn";
import IdentificationSection from "./IdentificationSection";
import OtherDataSection from "./OtherDataSection";
import EvidenceSection from "./EvidenceSection";
import MediaViewer from "../MediaViewer/MediaViewer";
import Photo from "../../models/Photo";
import KebabMenu from "../SharedComponents/KebabMenu";

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

  const renderArrowNavigation = ( ) => {
    if ( observations.length === 0 ) { return; }

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
      <>
        <View style={viewStyles.kebab}>
          {observations.length > 1 && (
            <KebabMenu>
              <Menu.Item
                onPress={( ) => console.log( "handle press in kebab" ) }
                title={t( "Delete" )}
              />
            </KebabMenu>
          )}
        </View>
        <HeaderBackButton onPress={handleBackButtonPress} style={viewStyles.headerBackButton} />
        <View style={viewStyles.alignCenter}>
          {observations.length === 1
            ? <Headline>{t( "New-Observation" )}</Headline>
            : (
              <View style={viewStyles.multipleObsRow}>
                <Pressable onPress={showPrevObservation} style={viewStyles.caret}>
                  {currentObsIndex !== 0 && <Icon name="keyboard-arrow-left" size={35} />}
                </Pressable>
                <Text>{`${currentObsIndex + 1} of ${observations.length}`}</Text>
                <Pressable onPress={showNextObservation} style={viewStyles.caret}>
                  {( currentObsIndex !== observations.length - 1 ) && <Icon name="keyboard-arrow-right" size={35} />}
                </Pressable>
              </View>
          )}
        </View>
      </>
    );
  };

  const setPhotos = ( uris ) => {
    const updatedObservations = observations;
    const updatedObsPhotos = currentObs.observationPhotos.filter( obsPhoto => {
      const { photo } = obsPhoto;
      if ( uris.includes( photo.url || photo.localFilePath ) ) {
        return obsPhoto;
      }
    } );
    currentObs.observationPhotos = updatedObsPhotos;
    setObservations( [...updatedObservations] );
  };

  const handleSelection = ( photo ) => {
    setInitialPhotoSelected( photo );
    showModal( );
  };

  const currentObs = observations[currentObsIndex];

  useEffect( ( ) => {
    if ( !currentObs || !currentObs.observationPhotos ) { return; }
    const uris = currentObs.observationPhotos.map( ( obsPhoto => {
      return Photo.displayLocalOrRemoteSquarePhoto( obsPhoto.photo );
    } ) );
    setPhotoUris( uris );
  }, [currentObs ] );

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
