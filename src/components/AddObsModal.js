// @flow

import { useNavigation } from "@react-navigation/native";
// eslint-disable-next-line import/no-extraneous-dependencies
import { useStartProfiler } from "@shopify/react-native-performance";
import classnames from "classnames";
import { INatIconButton } from "components/SharedComponents";
import { Text, View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import * as React from "react";
import { Platform } from "react-native";
import { useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";

type Props = {
  closeModal: ( ) => void
}

const AddObsModal = ( { closeModal }: Props ): React.Node => {
  const startNavigationTTITimer = useStartProfiler( );
  const { t } = useTranslation( );
  const theme = useTheme( );

  const majorVersionIOS = parseInt( Platform.Version, 10 );

  // TODO: update these version numbers based on what the new model can handle
  // in CoreML and TFLite
  const showARCamera = ( Platform.OS === "ios" && majorVersionIOS >= 11 )
    || ( Platform.OS === "android" && Platform.Version > 23 );

  // Destructuring obsEdit means that we don't have to wrap every Jest test in ObsEditProvider
  const obsEditContext = React.useContext( ObsEditContext );
  const createObservationNoEvidence = obsEditContext?.createObservationNoEvidence;
  const navigation = useNavigation( );

  const navAndCloseModal = ( screen, params, uiEvent ) => {
    const resetObsEditContext = obsEditContext?.resetObsEditContext;
    // clear previous upload context before navigating
    if ( resetObsEditContext ) {
      resetObsEditContext( );
    }
    if ( screen === "ObsEdit" ) {
      createObservationNoEvidence( );
    }
    if ( screen === "Camera" || screen === "ObsEdit" ) {
      startNavigationTTITimer( {
        source: "AddObsModal",
        uiEvent
      } );
    }
    // access nested screen
    navigation.navigate( "CameraNavigator", {
      screen,
      params
    } );
    closeModal( );
  };

  const navToPhotoGallery = uiEvent => navAndCloseModal( "PhotoGallery", uiEvent );

  const navToSoundRecorder = uiEvent => navAndCloseModal( "SoundRecorder", uiEvent );

  const navToARCamera = uiEvent => navAndCloseModal( "Camera", { camera: "AR" }, uiEvent );

  const navToStandardCamera = uiEvent => navAndCloseModal(
    "Camera",
    { camera: "Standard" },
    uiEvent
  );

  const navToObsEdit = uiEvent => navAndCloseModal( "ObsEdit", uiEvent );

  const bulletedText = [
    t( "Take-a-photo-with-your-camera" ),
    t( "Upload-a-photo-from-your-gallery" ),
    t( "Record-a-sound" )
  ];

  const greenCircleClass = "bg-inatGreen rounded-full h-[46px] w-[46px]";

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
      <View className={classnames( "flex-row justify-center", {
        "bottom-[20px]": !showARCamera
      } )}
      >
        <INatIconButton
          testID="camera-button"
          size={30}
          icon="camera"
          color={theme.colors.onSecondary}
          className={classnames( greenCircleClass, {
            "mr-[37px] bottom-[1px]": showARCamera,
            "mr-[9px]": !showARCamera
          } )}
          onPress={navToStandardCamera}
          accessibilityLabel={t( "Camera" )}
          accessibilityHint={t( "Navigates-to-camera" )}
        />
        {showARCamera && (
          <INatIconButton
            testID="arcamera-button"
            size={30}
            icon="arcamera"
            color={theme.colors.onSecondary}
            className={classnames(
              greenCircleClass,
              "absolute bottom-[26px]"
            )}
            onPress={navToARCamera}
            accessibilityLabel={t( "AR-Camera" )}
            accessibilityHint={t( "Navigates-to-AR-camera" )}
          />
        )}
        <INatIconButton
          testID="import-media-button"
          size={30}
          icon="gallery"
          color={theme.colors.onSecondary}
          className={classnames( greenCircleClass, {
            "ml-[37px] bottom-[1px]": showARCamera,
            "ml-[9px]": !showARCamera
          } )}
          onPress={navToPhotoGallery}
          accessibilityLabel={t( "Photo-importer" )}
          accessibilityHint={t( "Navigate-to-photo-importer" )}
        />
      </View>
      <View className="flex-row justify-center items-center">
        <INatIconButton
          testID="observe-without-evidence-button"
          size={30}
          icon="noevidence"
          color={theme.colors.onSecondary}
          className={classnames( greenCircleClass, {
            "mr-[26px]": showARCamera,
            "mr-[20px] bottom-[33px]": !showARCamera
          } )}
          onPress={navToObsEdit}
          accessibilityLabel={t( "Observation-with-no-evidence" )}
          accessibilityHint={t( "Navigate-to-observation-edit-screen" )}
        />
        <INatIconButton
          testID="close-camera-options-button"
          icon="close"
          color={theme.colors.onSecondary}
          size={31}
          className="h-[69px] w-[69px] bg-inatGreen rounded-full"
          onPress={( ) => closeModal( )}
          accessibilityLabel={t( "Close" )}
          accessibilityHint={t( "Close-add-observation-modal" )}
        />
        <INatIconButton
          testID="record-sound-button"
          size={30}
          icon="microphone"
          color={theme.colors.onSecondary}
          className={classnames( greenCircleClass, {
            "ml-[26px]": showARCamera,
            "ml-[20px] bottom-[33px]": !showARCamera
          } )}
          onPress={navToSoundRecorder}
          accessibilityLabel={t( "Sound-recorder" )}
          accessibilityHint={t( "Navigates-to-sound-recorder" )}
        />
      </View>
    </>
  );
};

export default AddObsModal;
