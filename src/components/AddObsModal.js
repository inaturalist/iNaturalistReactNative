// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import * as React from "react";
import { Platform } from "react-native";
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

  const majorVersionIOS = parseInt( Platform.Version, 10 );

  // TODO: update these version numbers based on what the new model can handle
  // in CoreML and TFLite
  const showARCamera = Platform.OS === "ios"
    ? majorVersionIOS >= 11
    : Platform.Version > 23;

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

  const navToARCamera = ( ) => navAndCloseModal( "ARCamera" );

  const navToStandardCamera = ( ) => navAndCloseModal( "StandardCamera" );

  const navToARCamera = ( ) => navAndCloseModal( "ARCamera" );

  const navToObsEdit = ( ) => navAndCloseModal( "ObsEdit" );

  const bulletedText = [
    t( "Take-a-photo-with-your-camera" ),
    t( "Upload-a-photo-from-your-gallery" ),
    t( "Record-a-sound" )
  ];

  return (
    <>
      <View className="flex-row justify-center">
        <View className="bg-white rounded-xl p-5 mb-12 max-w-sm">
          <Text testID="evidence-text" className="text-2xl">{t( "Evidence" )}</Text>
          <Text className="color-darkGray my-2">{t( "Add-evidence-of-an-organism" )}</Text>
          <Text className="color-darkGray my-2">{t( "You-can" )}</Text>
          {bulletedText.map( string => (
            <Text className="color-darkGray" key={string}>
              {`\u2022 ${string}`}
            </Text>
          ) )}
        </View>
      </View>
      <View className="flex-row justify-center">
        <IconButton
          testID="camera-button"
          size={30}
          icon="camera"
          containerColor={theme.colors.secondary}
          iconColor={theme.colors.onSecondary}
          className={showARCamera
            ? "mx-12 -bottom-3"
            : "mx-5"}
          onPress={navToStandardCamera}
          accessibilityLabel={t( "Navigates-to-camera" )}
        />
        {showARCamera && (
          <IconButton
            testID="arcamera-button"
            size={30}
            icon="arcamera"
            containerColor={theme.colors.secondary}
            iconColor={theme.colors.onSecondary}
            className="absolute bottom-4"
            onPress={navToARCamera}
            accessibilityLabel={t( "Navigates-to-AR-camera" )}
          />
        )}
        <IconButton
          testID="import-media-button"
          size={30}
          icon="gallery"
          containerColor={theme.colors.secondary}
          iconColor={theme.colors.onSecondary}
          className={showARCamera
            ? "mx-12 -bottom-3"
            : "mx-5"}
          onPress={navToPhotoGallery}
          accessibilityLabel={t( "Navigate-to-photo-importer" )}
        />
      </View>
      <View className={
        classnames(
          "flex-row justify-center",
          {
            "items-center": showARCamera
          }
        )
      }
      >
        <IconButton
          testID="observe-without-evidence-button"
          size={30}
          icon="noevidence"
          containerColor={theme.colors.secondary}
          iconColor={theme.colors.onSecondary}
          className={showARCamera
            ? "mx-5"
            : "mx-4"}
          onPress={navToObsEdit}
          accessibilityLabel={t( "Navigate-to-observation-edit-screen" )}
        />
        <IconButton
          testID="close-camera-options-button"
          icon="close"
          containerColor={theme.colors.secondary}
          iconColor={theme.colors.onSecondary}
          className="self-center h-24 w-24 rounded-[99px]"
          onPress={( ) => closeModal( )}
          accessibilityLabel={t( "Close-camera-options-modal" )}
        />
        <IconButton
          testID="record-sound-button"
          size={30}
          icon="microphone"
          containerColor={theme.colors.secondary}
          iconColor={theme.colors.onSecondary}
          className={showARCamera
            ? "mx-5"
            : "mx-4"}
          onPress={navToSoundRecorder}
          accessibilityLabel={t( "Navigate-to-sound-recorder" )}
        />
      </View>
    </>
  );
};

export default AddObsModal;
