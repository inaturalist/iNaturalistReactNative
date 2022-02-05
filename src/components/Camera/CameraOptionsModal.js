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

  const navAndCloseModal = ( screen ) => {
    // access nested screen
    navigation.navigate( "camera", { screen } );
    closeModal( );
  };

  const navToPhotoGallery = ( ) => navAndCloseModal( "PhotoGallery" );

  const navToSoundRecorder = ( ) => navAndCloseModal( "SoundRecorder" );

  return (
    <View>
      <Text style={textStyles.whiteText}>take photo with camera</Text>
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
      <Text style={textStyles.whiteText}>submit without evidence</Text>
    </View>
  );
};

export default CameraOptionsModal;
