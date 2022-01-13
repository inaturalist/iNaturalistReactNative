// @flow

import * as React from "react";
import { Text, View, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { textStyles } from "../../styles/sharedComponents/modal";

const CameraOptionsModal = ( ): React.Node => {
  const navigation = useNavigation( );

  // access nested screen
  const navToPhotoGallery = ( ) => navigation.navigate( "camera", {
    screen: "PhotoGallery"
  } );

  return (
    <View>
      <Text style={textStyles.whiteText}>take photo with camera</Text>
      <Pressable
        onPress={navToPhotoGallery}
      >
        <Text style={textStyles.whiteText}>upload photo from gallery</Text>
      </Pressable>
      <Text style={textStyles.whiteText}>record a sound</Text>
      <Text style={textStyles.whiteText}>submit without evidence</Text>
    </View>
  );
};

export default CameraOptionsModal;
