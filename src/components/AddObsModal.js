// @flow

import classnames from "classnames";
import {
  Body3, Heading2, INatIcon, INatIconButton
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import _ from "lodash";
import * as React from "react";
import { Platform, StatusBar } from "react-native";
import { useTheme } from "react-native-paper";
import Observation from "realmModels/Observation";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

type Props = {
  closeModal: ( ) => void,
  navAndCloseModal: Function
}

const AddObsModal = ( { closeModal, navAndCloseModal }: Props ): React.Node => {
  const { t } = useTranslation( );
  const theme = useTheme( );

  const majorVersionIOS = parseInt( Platform.Version, 10 );

  const showAICamera = ( Platform.OS === "ios" && majorVersionIOS >= 11 )
    || ( Platform.OS === "android" && Platform.Version > 21 );

  const prepareObsEdit = useStore( state => state.prepareObsEdit );

  const greenCircleClass = "bg-inatGreen rounded-full h-[46px] w-[46px]";
  const standardCameraMargins = {
    "mr-[37px] bottom-[1px]": showAICamera,
    "mr-[9px]": !showAICamera
  };
  const photoLibraryMargins = {
    "ml-[37px] bottom-[1px]": showAICamera,
    "ml-[9px]": !showAICamera
  };
  const noEvidenceMargins = {
    "mr-[26px]": showAICamera,
    "mr-[20px] bottom-[33px]": !showAICamera
  };
  const soundRecorderMargins = {
    "ml-[26px]": showAICamera,
    "ml-[20px] bottom-[33px]": !showAICamera
  };

  const obsCreateItems = {
    arCamera: {
      text: t( "Use-iNaturalists-AI-Camera" ),
      icon: "arcamera",
      onPress: ( ) => navAndCloseModal( "Camera", { camera: "AI" } ),
      testID: "arcamera-button",
      className: classnames( greenCircleClass, "absolute bottom-[26px]" ),
      accessibilityLabel: t( "AI-Camera" ),
      accessibilityHint: t( "Navigates-to-AI-camera" )
    },
    standardCamera: {
      text: t( "Take-photos-with-the-camera" ),
      icon: "camera",
      onPress: ( ) => navAndCloseModal( "Camera", { camera: "Standard" } ),
      testID: "camera-button",
      accessibilityLabel: t( "Camera" ),
      accessibilityHint: t( "Navigates-to-camera" ),
      className: classnames( greenCircleClass, standardCameraMargins )
    },
    photoLibrary: {
      text: t( "Upload-photos-from-your-gallery" ),
      icon: "gallery",
      onPress: ( ) => navAndCloseModal( "PhotoGallery" ),
      testID: "import-media-button",
      className: classnames( greenCircleClass, photoLibraryMargins ),
      accessibilityLabel: t( "Photo-importer" ),
      accessibilityHint: t( "Navigates-to-photo-importer" )
    },
    soundRecorder: {
      text: t( "Record-sounds" ),
      icon: "microphone",
      onPress: ( ) => navAndCloseModal( "SoundRecorder" ),
      testID: "record-sound-button",
      className: classnames( greenCircleClass, soundRecorderMargins ),
      accessibilityLabel: t( "Sound-recorder" ),
      accessibilityHint: t( "Navigates-to-sound-recorder" )
    },
    noEvidence: {
      text: t( "Create-an-observation-evidence" ),
      icon: "noevidence",
      onPress: async ( ) => {
        const newObservation = await Observation.new( );
        prepareObsEdit( newObservation );
        navAndCloseModal( "ObsEdit" );
      },
      testID: "observe-without-evidence-button",
      className: classnames( greenCircleClass, noEvidenceMargins ),
      accessibilityLabel: t( "Observation-with-no-evidence" ),
      accessibilityHint: t( "Navigates-to-observation-edit-screen" )
    }
  };

  const renderAddObsIcon = iconKey => (
    <INatIconButton
      testID={obsCreateItems[iconKey].testID}
      size={30}
      icon={obsCreateItems[iconKey].icon}
      color={theme.colors.onSecondary}
      className={obsCreateItems[iconKey].className}
      onPress={obsCreateItems[iconKey].onPress}
      accessibilityLabel={obsCreateItems[iconKey].accessibilityLabel}
      accessibilityHint={obsCreateItems[iconKey].accessibilityHint}
    />
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <View className="flex-row justify-center">
        <View className="bg-white rounded-xl p-[25px] mb-12 mx-7 max-w-sm">
          <Heading2 testID="identify-text" className="mb-4">
            {t( "Identify-an-organism" )}
          </Heading2>
          {_.keys( obsCreateItems ).map( item => (
            <Pressable
              accessibilityRole="button"
              key={item}
              className="flex-row items-center py-1.5 my-1"
              onPress={obsCreateItems[item].onPress}
            >
              <INatIcon
                name={obsCreateItems[item].icon}
                size={30}
                color={
                  obsCreateItems[item].icon === "arcamera"
                    ? theme.colors.secondary
                    : theme.colors.primary
                }
              />
              <Body3 className="ml-[20px] shrink">{obsCreateItems[item].text}</Body3>
            </Pressable>
          ) )}
        </View>
      </View>
      <View className={classnames( "flex-row justify-center", {
        "bottom-[20px]": !showAICamera
      } )}
      >
        {renderAddObsIcon( "standardCamera" )}
        {renderAddObsIcon( "arCamera" )}
        {renderAddObsIcon( "photoLibrary" )}
      </View>
      <View className="flex-row justify-center items-center">
        {renderAddObsIcon( "noEvidence" )}
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
        {renderAddObsIcon( "soundRecorder" )}
      </View>
    </>
  );
};

export default AddObsModal;
