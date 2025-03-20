import classnames from "classnames";
import {
  INatIconButton
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useMemo } from "react";
import { Platform, StatusBar } from "react-native";
import Observation from "realmModels/Observation";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

import AddObsModalHelp, { ObsCreateItem } from "./AddObsModalHelp";

interface Props {
  closeModal: ( ) => void;
  navAndCloseModal: ( screen: string, params?: {
    camera?: string
  } ) => void;
}

const majorVersionIOS = parseInt( String( Platform.Version ), 10 );
const AI_CAMERA_SUPPORTED = ( Platform.OS === "ios" && majorVersionIOS >= 11 )
  || ( Platform.OS === "android" && Platform.Version > 21 );

const GREEN_CIRCLE_CLASS = "bg-inatGreen rounded-full h-[46px] w-[46px]";
const ROW_CLASS = "flex-row justify-center";
const MARGINS = AI_CAMERA_SUPPORTED
  ? {
    standardCamera: "mr-[37px] bottom-[1px]",
    photoLibrary: "ml-[37px] bottom-[1px]",
    noEvidence: "mr-[26px]",
    soundRecorder: "ml-[26px]"
  }
  : {
    standardCamera: "mr-[9px]",
    photoLibrary: "ml-[9px]",
    noEvidence: "mr-[20px] bottom-[33px]",
    soundRecorder: "ml-[20px] bottom-[33px]"
  };

const AddObsModal = ( { closeModal, navAndCloseModal }: Props ) => {
  const { t } = useTranslation( );

  const prepareObsEdit = useStore( state => state.prepareObsEdit );

  const obsCreateItems = useMemo( ( ) => ( {
    aiCamera: {
      text: t( "Use-iNaturalists-AI-Camera" ),
      icon: "green-camera-sparkle",
      onPress: ( ) => navAndCloseModal( "Camera", { camera: "AI" } ),
      testID: "aicamera-button",
      className: classnames( GREEN_CIRCLE_CLASS, "absolute bottom-[26px]" ),
      accessibilityLabel: t( "AI-Camera" ),
      accessibilityHint: t( "Navigates-to-AI-camera" )
    },
    standardCamera: {
      text: t( "Take-multiple-photos-of-a-single-organism" ),
      icon: "camera",
      onPress: ( ) => navAndCloseModal( "Camera", { camera: "Standard" } ),
      testID: "camera-button",
      accessibilityLabel: t( "Camera" ),
      accessibilityHint: t( "Navigates-to-camera" ),
      className: classnames( GREEN_CIRCLE_CLASS, MARGINS.standardCamera )
    },
    photoLibrary: {
      text: t( "Upload-photos-from-your-photo-library" ),
      icon: "photo-library",
      onPress: ( ) => navAndCloseModal( "PhotoLibrary" ),
      testID: "import-media-button",
      className: classnames( GREEN_CIRCLE_CLASS, MARGINS.photoLibrary ),
      accessibilityLabel: t( "Photo-importer" ),
      accessibilityHint: t( "Navigates-to-photo-importer" )
    },
    soundRecorder: {
      text: t( "Record-a-sound" ),
      icon: "microphone",
      onPress: ( ) => navAndCloseModal( "SoundRecorder" ),
      testID: "record-sound-button",
      className: classnames( GREEN_CIRCLE_CLASS, MARGINS.soundRecorder ),
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
      className: classnames( GREEN_CIRCLE_CLASS, MARGINS.noEvidence ),
      accessibilityLabel: t( "Observation-with-no-evidence" ),
      accessibilityHint: t( "Navigates-to-observation-edit-screen" )
    },
    closeButton: {
      testID: "close-camera-options-button",
      icon: "close",
      className: classnames( GREEN_CIRCLE_CLASS, "h-[69px] w-[69px]" ),
      onPress: closeModal,
      accessibilityLabel: t( "Close" ),
      accessibilityHint: t( "Closes-new-observation-options" )
    }
  } ), [
    closeModal,
    navAndCloseModal,
    prepareObsEdit,
    t
  ] );

  const renderAddObsIcon = ( {
    accessibilityHint,
    accessibilityLabel,
    className,
    icon,
    onPress,
    testID
  }: ObsCreateItem ) => (
    <INatIconButton
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      className={className}
      color={icon === "camera-sparkle-green-circle"
        ? String( colors?.inatGreen )
        : String( colors?.white )}
      backgroundColor={icon === "camera-sparkle-green-circle" && String( colors?.white )}
      icon={icon}
      onPress={onPress}
      size={icon === "camera-sparkle-green-circle"
        ? 45
        : 30}
      testID={testID}
    />
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <AddObsModalHelp obsCreateItems={obsCreateItems} />
      <View className={classnames( ROW_CLASS, {
        "bottom-[20px]": !AI_CAMERA_SUPPORTED
      } )}
      >
        {renderAddObsIcon( obsCreateItems.standardCamera )}
        {AI_CAMERA_SUPPORTED && renderAddObsIcon( {
          ...obsCreateItems.aiCamera,
          icon: "camera-sparkle-green-circle"
        } )}
        {renderAddObsIcon( obsCreateItems.photoLibrary )}
      </View>
      <View className={classnames( ROW_CLASS, "items-center" )}>
        {renderAddObsIcon( obsCreateItems.noEvidence )}
        {renderAddObsIcon( obsCreateItems.closeButton )}
        {renderAddObsIcon( obsCreateItems.soundRecorder )}
      </View>
    </>
  );
};

export default AddObsModal;
