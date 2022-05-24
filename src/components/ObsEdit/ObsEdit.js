// @flow

import React, { useContext, useState } from "react";
import { Text, Pressable, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import { useTranslation } from "react-i18next";
import { HeaderBackButton } from "@react-navigation/elements";
import { Headline, Portal, Modal } from "react-native-paper";

import ScrollNoFooter from "../SharedComponents/ScrollNoFooter";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import { textStyles, viewStyles } from "../../styles/obsEdit/obsEdit";
import { ObsEditContext } from "../../providers/contexts";
import { useLoggedIn } from "../../sharedHooks/useLoggedIn";
import IdentificationSection from "./IdentificationSection";
import OtherDataSection from "./OtherDataSection";
import EvidenceSection from "./EvidenceSection";
// import BottomModal from "./BottomModal";
// import uploadObservation from "./helpers/uploadObservation";
import MediaViewer from "../MediaViewer/MediaViewer";
import { colors } from "../../styles/global";

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
  const { t } = useTranslation( );
  // const [showBottomModal, setBottomModal] = useState( false );
  const isLoggedIn = useLoggedIn( );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const [mainPhoto, setMainPhoto] = useState( null );

  const showModal = ( ) => setMediaViewerVisible( true );
  const hideModal = ( ) => setMediaViewerVisible( false );

  // const openBottomModal = useCallback( ( ) => setBottomModal( true ), [] );
  // const closeBottomModal = useCallback( ( ) => setBottomModal( false ), [] );

  const showNextObservation = ( ) => setCurrentObsIndex( currentObsIndex + 1 );
  const showPrevObservation = ( ) => setCurrentObsIndex( currentObsIndex - 1 );

  const renderArrowNavigation = ( ) => {
    if ( observations.length === 0 ) { return; }

    const handleBackButtonPress = ( ) => {
      // openBottomModal( );
      // show modal to dissuade user from going back
      navigation.goBack( );
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
                  <Text>previous obs</Text>
                </Pressable>
              )}
              <Text>{`${currentObsIndex + 1} of ${observations.length}`}</Text>
              {( currentObsIndex !== observations.length - 1 ) && (
                <Pressable
                  onPress={showNextObservation}
                >
                  <Text>next obs</Text>
                </Pressable>
              )}
            </View>
          )}
        <View />
      </View>
    );
  };


  const setPhotos = ( photos ) => {
    const updatedObservations = observations;
    currentObs.observationPhotos = photos;
    setObservations( [...updatedObservations] );
  };

  const handleSelection = ( photo ) => {
    setMainPhoto( photo );
    showModal( );
  };

  const currentObs = observations[currentObsIndex];

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
            mainPhoto={mainPhoto}
            photos={currentObs.observationPhotos}
            setPhotos={setPhotos}
            hideModal={hideModal}
          />
        </Modal>
      </Portal>
      <ScrollNoFooter style={mediaViewerVisible && viewStyles.mediaViewerSafeAreaView}>
        {/* <CustomModal
          showModal={showBottomModal}
          closeModal={closeBottomModal}
          modal={(
            <BottomModal />
          )}
          style={viewStyles.noMargin}
        /> */}
        {renderArrowNavigation( )}
        <Headline style={textStyles.headerText}>{t( "Evidence" )}</Headline>
        <EvidenceSection handleSelection={handleSelection} />
        <Headline style={textStyles.headerText}>{t( "Identification" )}</Headline>
        <IdentificationSection />
        <Headline style={textStyles.headerText}>{t( "Other-Data" )}</Headline>
        <OtherDataSection />
        {!isLoggedIn && <Text style={textStyles.text}>you must be logged in to upload observations</Text>}
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
