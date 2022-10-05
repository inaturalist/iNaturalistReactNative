// @flow

import { useNavigation } from "@react-navigation/native";
import { t } from "i18next";
import * as React from "react";
import { Avatar } from "react-native-paper";

import { ObsEditContext } from "../../providers/contexts";
import { Pressable, Text, View } from "../styledComponents";

type Props = {
  closeModal: ( ) => void
}

const CameraOptionsModal = ( { closeModal }: Props ): React.Node => {
  // Destructuring obsEdit means that we don't have to wrap every Jest test in ObsEditProvider
  const obsEdit = React.useContext( ObsEditContext );
  const currentObs = obsEdit && obsEdit.currentObs;
  const addObservationNoEvidence = obsEdit && obsEdit.addObservationNoEvidence;
  const navigation = useNavigation( );

  const hasSound = currentObs && currentObs.observationSounds && currentObs.observationSounds.uri;

  const navAndCloseModal = ( screen, params ) => {
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
      <View className="absolute bottom-0 left-1/3 px-2">
        <Avatar.Icon size={100} icon="plus" />
      </View>
      {!currentObs && (
      <Pressable onPress={navToObsEdit} className="absolute bottom-6 left-10">
        <Avatar.Icon size={50} icon="square-edit-outline" />
      </Pressable>
      )}
      <Pressable onPress={navToStandardCamera} className="absolute bottom-24 left-20">
        <Avatar.Icon size={50} icon="camera" />
      </Pressable>
      {!currentObs && (
      <Pressable onPress={navToPhotoGallery} className="absolute bottom-24 right-20">
        <Avatar.Icon size={50} icon="folder-multiple-image" />
      </Pressable>
      )}
      {!hasSound && (
      <Pressable onPress={navToSoundRecorder} className="absolute bottom-6 right-10">
        <Avatar.Icon size={50} icon="microphone" />
      </Pressable>
      )}

    </>
  );
};

export default CameraOptionsModal;
