import {
  Body3, BottomSheet, INatIcon, INatIconButton
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useMemo } from "react";
import { Platform, Pressable } from "react-native";
import Observation from "realmModels/Observation";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

interface Props {
  closeModal: ( ) => void;
  navAndCloseModal: ( screen: string, params?: {
    camera?: string
  } ) => void;
  hidden: boolean;
}

type ObsCreateItem = {
    text?: string,
    icon: string,
    onPress: ( ) => void,
    testID: string,
    accessibilityLabel: string,
    accessibilityHint: string
}

const majorVersionIOS = parseInt( String( Platform.Version ), 10 );
const AI_CAMERA_SUPPORTED = ( Platform.OS === "ios" && majorVersionIOS >= 11 )
  || ( Platform.OS === "android" && Platform.Version > 21 );

const GREEN_CIRCLE_CLASS = "bg-inatGreen rounded-full h-[36px] w-[36px] mb-2";
const ROW_CLASS = "flex-row justify-center space-x-4 w-full flex-1";

const AddObsBottomSheet = ( {
  closeModal, navAndCloseModal, hidden
}: Props ) => {
  const { t } = useTranslation( );

  const prepareObsEdit = useStore( state => state.prepareObsEdit );

  const obsCreateItems = useMemo( ( ) => ( {
    aiCamera: {
      text: t( "ID-with-AI-Camera" ),
      icon: "aicamera",
      onPress: ( ) => navAndCloseModal( "Camera", { camera: "AI" } ),
      testID: "aicamera-button",
      accessibilityLabel: t( "AI-Camera" ),
      accessibilityHint: t( "Navigates-to-AI-camera" )
    },
    standardCamera: {
      text: t( "Take-photos" ),
      icon: "camera",
      onPress: ( ) => navAndCloseModal( "Camera", { camera: "Standard" } ),
      testID: "camera-button",
      accessibilityLabel: t( "Camera" ),
      accessibilityHint: t( "Navigates-to-camera" )
    },
    photoLibrary: {
      text: t( "Upload-photos" ),
      icon: "photo-library",
      onPress: ( ) => navAndCloseModal( "PhotoLibrary" ),
      testID: "import-media-button",
      accessibilityLabel: t( "Photo-importer" ),
      accessibilityHint: t( "Navigates-to-photo-importer" )
    },
    soundRecorder: {
      text: t( "Record-a-sound" ),
      icon: "microphone",
      onPress: ( ) => navAndCloseModal( "SoundRecorder" ),
      testID: "record-sound-button",
      accessibilityLabel: t( "Sound-recorder" ),
      accessibilityHint: t( "Navigates-to-sound-recorder" )
    },
    noEvidence: {
      text: t( "Create-observation-with-no-evidence" ),
      icon: "noevidence",
      onPress: async ( ) => {
        const newObservation = await Observation.new( );
        prepareObsEdit( newObservation );
        navAndCloseModal( "ObsEdit" );
      },
      testID: "observe-without-evidence-button",
      accessibilityLabel: t( "Observation-with-no-evidence" ),
      accessibilityHint: t( "Navigates-to-observation-edit-screen" )
    }
  } ), [
    navAndCloseModal,
    prepareObsEdit,
    t
  ] );

  const renderAddObsIcon = ( {
    accessibilityHint,
    accessibilityLabel,
    icon,
    onPress,
    testID,
    text
  }: ObsCreateItem ) => (
    <Pressable
      className="bg-white w-1/2 flex-column items-center py-4 rounded-lg flex-1 shadow-sm
      shadow-black/25 active:opacity-50"
      onPress={onPress}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <INatIconButton
        className={GREEN_CIRCLE_CLASS}
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        color={String( colors?.white )}
        icon={icon}
        onPress={onPress}
        size={icon === "aicamera"
          ? 28
          : 20}
      />
      <Body3>{text}</Body3>
    </Pressable>
  );

  return (
    <BottomSheet
      onPressClose={closeModal}
      hidden={hidden}
      insideModal={false}
      hideCloseButton
      additionalClasses="bg-lightGray pt-4"
      scrollEnabled={false}
    >
      <View className="flex-column gap-y-4 pb-4 px-4">

        <View className={ROW_CLASS}>
          {renderAddObsIcon( obsCreateItems.standardCamera )}
          {renderAddObsIcon( obsCreateItems.photoLibrary )}
        </View>

        <View className={ROW_CLASS}>
          {renderAddObsIcon( obsCreateItems.soundRecorder )}
          {AI_CAMERA_SUPPORTED && renderAddObsIcon( obsCreateItems.aiCamera )}
        </View>

        <Pressable
          className="bg-mediumGray w-full flex-row items-center py-[10px] px-5 rounded-lg
          active:opacity-50"
          onPress={obsCreateItems.noEvidence.onPress}
          accessibilityHint={obsCreateItems.noEvidence.accessibilityHint}
          accessibilityLabel={obsCreateItems.noEvidence.accessibilityLabel}
          testID={obsCreateItems.noEvidence.testID}
        >
          <View className="mr-2">
            <INatIcon
              name={obsCreateItems.noEvidence.icon}
              color={String( colors?.darkGray )}
              size={24}
            />
          </View>
          <Body3>{obsCreateItems.noEvidence.text}</Body3>
        </Pressable>

      </View>
    </BottomSheet>
  );
};

export default AddObsBottomSheet;
