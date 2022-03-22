// @flow

import * as React from "react";
import { Text, View, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { textStyles } from "../../styles/sharedComponents/modal";
import { ObsEditContext } from "../../providers/contexts";

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
