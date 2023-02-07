// @flow

import { useNavigation } from "@react-navigation/native";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import * as React from "react";
import { IconButton, useTheme } from "react-native-paper";

type Props = {
  closeModal: ( ) => void
}

const AddObsModal = ( { closeModal }: Props ): React.Node => {
  const theme = useTheme( );
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

  const renderIconButton = ( icon, className, onPress, accessibilityLabel, testID ) => (
    <IconButton
      testID={testID}
      size={30}
      icon={icon}
      containerColor={theme.colors.secondary}
      iconColor={theme.colors.onSecondary}
      className={className}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
    />
  );

  return (
    <View className="flex-1 justify-end">
      <View className="flex-row justify-center">
        <View className="bg-white rounded-xl p-5 mb-12 max-w-sm">
          <Text testID="evidence-text" className="text-2xl">{t( "Evidence" )}</Text>
          <Text className="color-grayText my-2">{t( "Add-evidence-of-an-organism" )}</Text>
          <Text className="color-grayText my-2">{t( "You-can" )}</Text>
          {bulletedText.map( string => (
            <Text className="color-grayText" key={string}>
              {`\u2022 ${string}`}
            </Text>
          ) )}
        </View>
      </View>
      <View className="flex-row items-center justify-center">
        {renderIconButton(
          "camera",
          "mx-5",
          navToStandardCamera,
          t( "Navigates-to-camera" ),
          "camera-button"
        )}
        {renderIconButton(
          "icon-gallery",
          "mx-5",
          navToPhotoGallery,
          t( "Navigate-to-photo-importer" ),
          "import-media-button"
        )}
      </View>
      <View className="flex-row justify-center">
        {renderIconButton(
          "pen-and-paper",
          "mx-2",
          navToObsEdit,
          t( "Navigate-to-observation-edit-screen" ),
          "observe-without-evidence-button"
        )}
        {renderIconButton(
          "close-button-x",
          "self-center h-24 w-24 rounded-[99px]",
          ( ) => closeModal( ),
          t( "Close-camera-options-modal" ),
          "close-camera-options-button"
        )}
        {renderIconButton(
          "microphone",
          "mx-2",
          navToSoundRecorder,
          t( "Navigates-to-sound-recorder" ),
          "record-sound-button"
        )}
      </View>
    </View>
  );
};

export default AddObsModal;
