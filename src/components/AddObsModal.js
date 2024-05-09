// @flow

import classnames from "classnames";
import {
  Body3, Heading2, INatIcon, INatIconButton
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";
import { Platform, StatusBar } from "react-native";
import { useTheme } from "react-native-paper";
import Observation from "realmModels/Observation";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

import useClearComputerVisionDirectory from "./hooks/useClearComputerVisionDirectory";

type Props = {
  closeModal: ( ) => void,
  navAndCloseModal: Function
}

const AddObsModal = ( { closeModal, navAndCloseModal }: Props ): React.Node => {
  const { t } = useTranslation( );
  const theme = useTheme( );

  // clearing the cache of resized images for the score_image API
  // placing this here means we can keep the app size small
  // while users move through the ObsEdit flow multiple times
  // and we don't interfere with the Suggestions -> ObsEdit -> Suggestions flow
  useClearComputerVisionDirectory( );

  const majorVersionIOS = parseInt( Platform.Version, 10 );

  const showARCamera = ( Platform.OS === "ios" && majorVersionIOS >= 11 )
    || ( Platform.OS === "android" && Platform.Version > 21 );

  const resetObservationFlowSlice = useStore( state => state.resetObservationFlowSlice );
  const setObservations = useStore( state => state.setObservations );

  const navToObsEdit = async ( ) => {
    resetObservationFlowSlice( );
    const newObservation = await Observation.new( );
    setObservations( [newObservation] );
    navAndCloseModal( "ObsEdit" );
  };

  const bulletedText = [
    { text: t( "Use-iNaturalists-AI-Camera" ), icon: "arcamera" },
    { text: t( "Take-photos-with-the-camera" ), icon: "camera" },
    { text: t( "Upload-photos-from-your-gallery" ), icon: "gallery" },
    { text: t( "Record-sounds" ), icon: "microphone" },
    { text: t( "Create-an-observation-evidence" ), icon: "noevidence" }
  ];

  const greenCircleClass = "bg-inatGreen rounded-full h-[46px] w-[46px]";

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <View className="flex-row justify-center">
        <View className="bg-white rounded-xl p-[25px] mb-12 mx-7 max-w-sm">
          <Heading2 testID="identify-text">
            {t( "Identify-an-organism" )}
          </Heading2>
          {bulletedText.map( ( { text, icon } ) => (
            <View key={text} className="flex-row items-center mt-4">
              <INatIcon
                name={icon}
                size={30}
                color={
                  icon === "arcamera"
                    ? theme.colors.secondary
                    : theme.colors.primary
                }
              />
              <Body3 className="ml-[20px] shrink">{text}</Body3>
            </View>
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
          onPress={( ) => navAndCloseModal( "Camera", { camera: "Standard" } )}
          accessibilityLabel={t( "Camera" )}
          accessibilityHint={t( "Navigates-to-camera" )}
        />
        {showARCamera && (
          <INatIconButton
            testID="arcamera-button"
            size={30}
            icon="arcamera"
            color={theme.colors.onSecondary}
            className={classnames( greenCircleClass, "absolute bottom-[26px]" )}
            onPress={( ) => navAndCloseModal( "Camera", { camera: "AI" } )}
            accessibilityLabel={t( "AI-Camera" )}
            accessibilityHint={t( "Navigates-to-AI-camera" )}
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
          onPress={( ) => navAndCloseModal( "PhotoGallery" )}
          accessibilityLabel={t( "Photo-importer" )}
          accessibilityHint={t( "Navigates-to-photo-importer" )}
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
          accessibilityHint={t( "Navigates-to-observation-edit-screen" )}
        />
        <INatIconButton
          testID="close-camera-options-button"
          icon="close"
          color={theme.colors.onSecondary}
          size={31}
          className="h-[69px] w-[69px] bg-inatGreen rounded-full"
          onPress={( ) => closeModal( )}
          accessibilityLabel={t( "Close" )}
          accessibilityHint={t( "Closes-new-observation-options" )}
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
          onPress={( ) => navAndCloseModal( "SoundRecorder" )}
          accessibilityLabel={t( "Sound-recorder" )}
          accessibilityHint={t( "Navigates-to-sound-recorder" )}
        />
      </View>
    </>
  );
};

export default AddObsModal;
