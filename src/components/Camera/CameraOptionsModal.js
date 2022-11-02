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
  const obsEdit = React.useContext( ObsEditContext );
  const currentObs = obsEdit?.currentObs;
  const addObservationNoEvidence = obsEdit?.addObservationNoEvidence;
  const navigation = useNavigation( );

  const hasSound = currentObs?.observationSounds?.uri;

  const navAndCloseModal = ( screen, params ) => {
    const setObservations = obsEdit?.setObservations;
    // clear any previous observations before navigating
    if ( setObservations ) {
      setObservations( [] );
    }
    // access nested screen
    navigation.navigate( screen, params );
    closeModal( );
  };

  const navToPhotoGallery = ( ) => navAndCloseModal( "PhotoGallery" );

  const navToSoundRecorder = ( ) => navAndCloseModal( "SoundRecorder" );

  const navToStandardCamera = ( ) => navAndCloseModal( "StandardCamera" );

  const navToObsEdit = ( ) => {
    addObservationNoEvidence( );
    navAndCloseModal( "ObsEdit" );
  };

  const bulletedText = [
    t( "Take-a-photo-with-your-camera" ),
    t( "Upload-a-photo-from-your-gallery" ),
    t( "Record-a-sound" )
  ];

  const renderIconButton = ( icon, className, onPress, size = 30 ) => (
    <IconButton
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
        <Text className="text-2xl">{t( "Evidence" )}</Text>
        <Text className="color-grayText my-2">{t( "Add-evidence-of-an-organism" )}</Text>
        <Text className="color-grayText my-2">{t( "You-can" )}</Text>
        {bulletedText.map( string => (
          <Text className="color-grayText" key={string}>
            {`\u2022 ${string}`}
          </Text>
        ) )}
      </View>
      {renderIconButton( "plus", "bottom-0 left-1/3 px-2", ( ) => { }, 80 )}
      {!currentObs && renderIconButton( "square-edit-outline", "bottom-6 left-10", navToObsEdit )}
      {renderIconButton( "camera", "bottom-24 left-20", navToStandardCamera )}
      {!currentObs
        && renderIconButton( "folder-multiple-image", "bottom-24 right-20", navToPhotoGallery )}
      {!hasSound && renderIconButton( "microphone", "bottom-6 right-10", navToSoundRecorder )}
    </>
  );
};

export default CameraOptionsModal;
