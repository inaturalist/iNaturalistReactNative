// @flow

import { useNavigation } from "@react-navigation/native";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import * as React from "react";
import { IconButton } from "react-native-paper";
import colors from "styles/tailwindColors";

type Props = {
  closeModal: ( ) => void
}

const CameraOptionsModal = ( { closeModal }: Props ): React.Node => {
  // Destructuring obsEdit means that we don't have to wrap every Jest test in ObsEditProvider
  const obsEditContext = React.useContext( ObsEditContext );
  const createObservationNoEvidence = obsEditContext?.createObservationNoEvidence;
  const navigation = useNavigation( );

  const navAndCloseModal = ( screen, params ) => {
    const resetObsEditContext = obsEditContext?.resetObsEditContext;
    // clear previous upload context before navigating
    if ( resetObsEditContext ) {
      resetObsEditContext( );
    }
    if ( screen === "ObsEdit" ) {
      createObservationNoEvidence( );
    }
    // access nested screen
    navigation.navigate( screen, params );
    closeModal( );
  };

  const navToPhotoGallery = ( ) => navAndCloseModal( "PhotoGallery" );

  const navToSoundRecorder = ( ) => navAndCloseModal( "SoundRecorder" );

  const navToStandardCamera = ( ) => navAndCloseModal( "StandardCamera" );

  const navToObsEdit = ( ) => navAndCloseModal( "ObsEdit" );

  const bulletedText = [
    t( "Take-a-photo-with-your-camera" ),
    t( "Upload-a-photo-from-your-gallery" ),
    t( "Record-a-sound" )
  ];

  const renderIconButton = ( icon, className, onPress, size = 30 ) => (
    <IconButton
      testID={`camera-options-button-${icon}`}
      size={size}
      mode="contained"
      icon={icon}
      containerColor={colors.inatGreen}
      iconColor={colors.white}
      className={`absolute ${className}`}
      onPress={onPress}
    />
  );

  return (
    <>
      <View className="bg-white rounded-xl p-5">
        <Text testID="evidence-text" className="text-2xl">{t( "Evidence" )}</Text>
        <Text className="color-grayText my-2">{t( "Add-evidence-of-an-organism" )}</Text>
        <Text className="color-grayText my-2">{t( "You-can" )}</Text>
        {bulletedText.map( string => (
          <Text className="color-grayText" key={string}>
            {`\u2022 ${string}`}
          </Text>
        ) )}
      </View>
      {renderIconButton( "plus", "bottom-0 left-1/3 px-2", ( ) => { }, 80 )}
      {renderIconButton( "square-edit-outline", "bottom-6 left-10", navToObsEdit )}
      {renderIconButton( "camera", "bottom-24 left-20", navToStandardCamera )}
      {renderIconButton( "folder-multiple-image", "bottom-24 right-20", navToPhotoGallery )}
      {renderIconButton( "microphone", "bottom-6 right-10", navToSoundRecorder )}
    </>
  );
};

export default CameraOptionsModal;
