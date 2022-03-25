// @flow

import * as React from "react";
import { Text, View, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { textStyles, viewStyles } from "../../styles/sharedComponents/modal";
import { ObsEditContext } from "../../providers/contexts";
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
    navigation.navigate( "camera", { screen, params } );
    closeModal( );
  };

  const navToPhotoGallery = ( ) => navAndCloseModal( "PhotoGallery" );

  const navToSoundRecorder = ( ) => navAndCloseModal( "SoundRecorder" );

  const navToNormalCamera = ( ) => navAndCloseModal( "NormalCamera" );

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
       <Pressable
        onPress={navToNormalCamera}
      >
        <Text style={textStyles.whiteText}>take photo with camera</Text>
      </Pressable>
      {!currentObs && (
        <Pressable
          onPress={navToPhotoGallery}
        >
          <Text style={textStyles.whiteText}>upload photo from gallery</Text>
        </Pressable>
      )}
      {!hasSound && (
        <Pressable
          onPress={navToSoundRecorder}
        >
          <Text style={textStyles.whiteText}>record a sound</Text>
        </Pressable>
      )}
      {!currentObs && (
        <Pressable
          onPress={navToObsEdit}
        >
          <Text style={textStyles.whiteText}>submit without evidence</Text>
        </Pressable>
      )}
    </View>
  );
};

export default CameraOptionsModal;
