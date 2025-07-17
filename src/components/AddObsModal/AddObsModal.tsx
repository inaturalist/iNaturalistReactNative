import classnames from "classnames";
import {
  Body2,
  INatIconButton
} from "components/SharedComponents";
import GradientButton from "components/SharedComponents/Buttons/GradientButton.tsx";
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
  tooltipIsVisible: boolean;
  dismissTooltip: () => void;
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

const AddObsModal = ( {
  closeModal, navAndCloseModal, tooltipIsVisible, dismissTooltip
}: Props ) => {
  const { t } = useTranslation( );

  const prepareObsEdit = useStore( state => state.prepareObsEdit );

  const obsCreateItems = useMemo( ( ) => ( {
    aiCamera: {
      text: t( "Use-iNaturalists-AI-Camera" ),
      icon: "aicamera",
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
      color={String( colors?.white )}
      icon={icon}
      onPress={onPress}
      size={icon === "aicamera"
        ? 38
        : 30}
      testID={testID}
    />
  );

  const renderContent = ( ) => {
    if ( tooltipIsVisible ) {
      return (
        <View className="justify-center items-center">
          <View className="bg-white rounded-2xl px-5 py-4">
            <Body2>{t( "Press-and-hold-to-view-more-options" )}</Body2>
          </View>
          <View
            className={classnames(
              // I could not figure out how to use "border-x-transparent",
              "border-l-[10px] border-r-[10px] border-x-[#00000000]",
              "border-t-[16px] border-t-white mb-2"
            )}
          />
          <GradientButton
            sizeClassName="w-[69px] h-[69px]"
            onPress={() => {}}
            onLongPress={() => dismissTooltip( )}
            accessibilityLabel={t( "Add-observations" )}
            accessibilityHint={t( "Shows-observation-creation-options" )}
          />
        </View>
      );
    }
    return (
      <>
        <AddObsModalHelp obsCreateItems={obsCreateItems} />
        <View className={classnames( ROW_CLASS, {
          "bottom-[20px]": !AI_CAMERA_SUPPORTED
        } )}
        >
          {renderAddObsIcon( obsCreateItems.standardCamera )}
          {AI_CAMERA_SUPPORTED && renderAddObsIcon( obsCreateItems.aiCamera )}
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

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      { renderContent( ) }
    </>
  );
};

export default AddObsModal;
