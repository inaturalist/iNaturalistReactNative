// @flow

import * as React from "react";
import { Text, View, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { textStyles } from "../../styles/sharedComponents/modal";

type Props = {
  closeModal: ( ) => void
}

const CameraOptionsModal = ( { closeModal }: Props ): React.Node => {
  const navigation = useNavigation( );

  const navAndCloseModal = ( screen, params ) => {
    // access nested screen
    navigation.navigate( "camera", { screen, params } );
    closeModal( );
  };

  const navToPhotoGallery = ( ) => navAndCloseModal( "PhotoGallery" );

  const navToSoundRecorder = ( ) => navAndCloseModal( "SoundRecorder" );

  const navToNormalCamera = ( ) => navAndCloseModal( "NormalCamera" );

  const navToObsEdit = ( ) => navAndCloseModal( "ObsEdit", { obsToEdit: [{
    observationPhotos: []
  }] } );

  return (
    <View>
       <Pressable
        onPress={navToNormalCamera}
      >
        <Text style={textStyles.whiteText}>take photo with camera</Text>
      </Pressable>
      <Pressable
        onPress={navToPhotoGallery}
      >
        <Text style={textStyles.whiteText}>upload photo from gallery</Text>
      </Pressable>
      <Pressable
        onPress={navToSoundRecorder}
      >
        <Text style={textStyles.whiteText}>record a sound</Text>
      </Pressable>
      <Pressable
        onPress={navToObsEdit}
      >
        <Text style={textStyles.whiteText}>submit without evidence</Text>
      </Pressable>
    </View>
  );
};

export default CameraOptionsModal;
