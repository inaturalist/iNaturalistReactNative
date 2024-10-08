import classnames from "classnames";
import {
  Body3, Heading2, INatIcon, INatIconButton
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import { Platform, StatusBar } from "react-native";
import Observation from "realmModels/Observation";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

interface Props {
  closeModal: ( ) => void;
  navAndCloseModal: ( screen: string, params?: {
    camera?: string
  } ) => void;
}

const AddObsModal = ( { closeModal, navAndCloseModal }: Props ) => {
  const { t } = useTranslation( );

  const majorVersionIOS = parseInt( Platform.Version, 10 );

  const showAICamera = ( Platform.OS === "ios" && majorVersionIOS >= 11 )
    || ( Platform.OS === "android" && Platform.Version > 21 );

  const prepareObsEdit = useStore( state => state.prepareObsEdit );

  const greenCircleClass = "bg-inatGreen rounded-full h-[46px] w-[46px]";
  const rowClass = "flex-row justify-center";

  const getMargins = ( hasAICamera: boolean ) => ( {
    standardCamera: hasAICamera
      ? "mr-[37px] bottom-[1px]"
      : "mr-[9px]",
    photoLibrary: hasAICamera
      ? "ml-[37px] bottom-[1px]"
      : "ml-[9px]",
    noEvidence: hasAICamera
      ? "mr-[26px]"
      : "mr-[20px] bottom-[33px]",
    soundRecorder: hasAICamera
      ? "ml-[26px]"
      : "ml-[20px] bottom-[33px]"
  } );

  const margins = getMargins( showAICamera );

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
      className: classnames( greenCircleClass, margins.standardCamera )
    },
    photoLibrary: {
      text: t( "Upload-photos-from-your-gallery" ),
      icon: "gallery",
      onPress: ( ) => navAndCloseModal( "PhotoGallery" ),
      testID: "import-media-button",
      className: classnames( greenCircleClass, margins.photoLibrary ),
      accessibilityLabel: t( "Photo-importer" ),
      accessibilityHint: t( "Navigates-to-photo-importer" )
    },
    soundRecorder: {
      text: t( "Record-sounds" ),
      icon: "microphone",
      onPress: ( ) => navAndCloseModal( "SoundRecorder" ),
      testID: "record-sound-button",
      className: classnames( greenCircleClass, margins.soundRecorder ),
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
      className: classnames( greenCircleClass, margins.noEvidence ),
      accessibilityLabel: t( "Observation-with-no-evidence" ),
      accessibilityHint: t( "Navigates-to-observation-edit-screen" )
    },
    closeButton: {
      testID: "close-camera-options-button",
      icon: "close",
      className: classnames( greenCircleClass, "h-[69px] w-[69px]" ),
      onPress: closeModal,
      accessibilityLabel: t( "Close" ),
      accessibilityHint: t( "Closes-new-observation-options" )
    }
  };

  const renderAddObsIcon = ( {
    accessibilityHint,
    accessibilityLabel,
    className,
    icon,
    onPress,
    testID
  } ) => (
    <INatIconButton
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      className={className}
      color={colors.white}
      icon={icon}
      onPress={onPress}
      size={30}
      testID={testID}
    />
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <View className="bg-white rounded-3xl py-[23px] mb-20">
        <View className="flex-row items-center mb-2">
          <Heading2
            maxFontSizeMultiplier={1.5}
            testID="identify-text"
            className="pl-[25px]"
          >
            {t( "Identify-an-organism" )}
          </Heading2>
          <View className="ml-auto pr-[12px]">
            <INatIconButton
              icon="close"
              color={colors.darkGray}
              size={19}
              onPress={closeModal}
              accessibilityLabel={t( "Close" )}
              accessibilityHint={t( "Closes-new-observation-options" )}
            />
          </View>
        </View>
        <View className="px-[23px]">
          {Object.keys( obsCreateItems )
            .filter( k => k !== "closeButton" )
            .map( k => {
              const item = obsCreateItems[k];
              return (
                <Pressable
                  accessibilityRole="button"
                  className={classnames( "flex-row items-center p-2 my-1" )}
                  key={k}
                  onPress={item.onPress}
                >
                  <INatIcon
                    name={item.icon}
                    size={30}
                    color={
                      item.icon === "arcamera"
                        ? colors.inatGreen
                        : colors.darkGray
                    }
                  />
                  <Body3 maxFontSizeMultiplier={1.5} className="ml-[20px] shrink">
                    {item.text}
                  </Body3>
                </Pressable>
              );
            } )}
        </View>
      </View>
      <View className={classnames( rowClass, {
        "bottom-[20px]": !showAICamera
      } )}
      >
        {renderAddObsIcon( obsCreateItems.standardCamera )}
        {showAICamera && renderAddObsIcon( obsCreateItems.arCamera )}
        {renderAddObsIcon( obsCreateItems.photoLibrary )}
      </View>
      <View className={classnames( rowClass, "items-center" )}>
        {renderAddObsIcon( obsCreateItems.noEvidence )}
        {renderAddObsIcon( obsCreateItems.closeButton )}
        {renderAddObsIcon( obsCreateItems.soundRecorder )}
      </View>
    </>
  );
};

export default AddObsModal;
