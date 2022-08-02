// @flow

import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { Avatar } from "react-native-paper";

import { ObsEditContext } from "../../providers/contexts";
import { textStyles, viewStyles } from "../../styles/sharedComponents/modal";
import TranslatedText from "../SharedComponents/TranslatedText";

type Props = {
  closeModal: ( ) => void
}

const CameraOptionsModal = ( { closeModal }: Props ): React.Node => {
  // Destructuring obsEdit means that we don't have to wrap every Jest test in ObsEditProvider
  const obsEdit = React.useContext( ObsEditContext );
  const currentObs = obsEdit && obsEdit.currentObs;
  const addObservationNoEvidence = obsEdit && obsEdit.addObservationNoEvidence;
  const navigation = useNavigation( );

  const hasSound = currentObs && currentObs.observationSounds && currentObs.observationSounds.uri;

  const navAndCloseModal = ( screen, params ) => {
    // access nested screen
    navigation.navigate( "observations", { screen, params } );
    closeModal( );
  };

  const navToPhotoGallery = ( ) => navAndCloseModal( "PhotoGallery" );

  const navToSoundRecorder = ( ) => navAndCloseModal( "SoundRecorder" );

  const navToStandardCamera = ( ) => navAndCloseModal( "StandardCamera" );

  const navToObsEdit = ( ) => {
    addObservationNoEvidence( );
    navAndCloseModal( "ObsEdit" );
  };

  return (
    <View>
      <TranslatedText style={textStyles.whiteText} text="CREATE-AN-OBSERVATION" />
      <View style={viewStyles.whiteModal}>
        <TranslatedText text="STEP-1-EVIDENCE" />
        <TranslatedText text="The-first-thing-you-need-is-evidence" />
        <TranslatedText text="Take-a-photo-with-your-camera" />
        <TranslatedText text="Upload-a-photo-from-your-gallery" />
        <TranslatedText text="Record-a-sound" />
        <TranslatedText text="Submit-without-evidence" />
      </View>
      <Pressable onPress={navToStandardCamera}>
        <Avatar.Icon size={40} icon="camera" />
      </Pressable>
      {!currentObs && (
        <Pressable onPress={navToPhotoGallery}>
          <Avatar.Icon size={40} icon="folder-multiple-image" />
        </Pressable>
      )}
      {!hasSound && (
        <Pressable onPress={navToSoundRecorder}>
          <Avatar.Icon size={40} icon="microphone" />
        </Pressable>
      )}
      {!currentObs && (
        <Pressable onPress={navToObsEdit}>
          <Avatar.Icon size={40} icon="square-edit-outline" />
        </Pressable>
      )}
    </View>
  );
};

export default CameraOptionsModal;
