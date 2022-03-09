// @flow

import React from "react";
import { FlatList, Image, View, Pressable } from "react-native";
import type { Node } from "react";

import { imageStyles, viewStyles } from "../../styles/obsEdit/obsEdit";
import CameraOptionsButton from "../SharedComponents/Buttons/CameraOptionsButton";

type Props = {
  currentObs: Object,
  showCameraOptions?: boolean,
  setSelectedPhoto?: Function,
  selectedPhoto: number
}

const EvidenceList = ( { currentObs, showCameraOptions, setSelectedPhoto, selectedPhoto }: Props ): Node => {
  const renderCameraOptionsButton =  ( ) => showCameraOptions ? <CameraOptionsButton /> : <View />;

  const renderEvidence = ( { item, index } ) => {
    const isSound = item.uri.includes( "m4a" );
    const imageUri = { uri: item.uri };

    const handlePress = ( ) => {
      if ( setSelectedPhoto ) {
        setSelectedPhoto( index );
      }
      return;
    };

    return (
      <Pressable
        disabled={!setSelectedPhoto}
        onPress={handlePress}
      >
        <Image
          source={imageUri}
          style={[
            imageStyles.obsPhoto,
            isSound && viewStyles.soundButton,
            selectedPhoto === index && viewStyles.greenSelectionBorder
          ]}
          testID="ObsEdit.photo"
        />
      </Pressable>
    );
  };

  const displayEvidence = ( ) => {
    let evidence = [];

    if ( currentObs.observationPhotos ) {
      evidence = evidence.concat( currentObs.observationPhotos );
    }
    if ( currentObs.observationSounds ) {
      evidence = evidence.concat( [currentObs.observationSounds] );
    }
    return evidence;
  };

  return (
    <FlatList
      data={displayEvidence( )}
      horizontal
      renderItem={renderEvidence}
      ListFooterComponent={renderCameraOptionsButton}
      contentContainerStyle={viewStyles.evidenceList}
    />
  );
};

export default EvidenceList;
