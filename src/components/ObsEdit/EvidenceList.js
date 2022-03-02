// @flow

import React from "react";
import { FlatList, Image, View } from "react-native";
import type { Node } from "react";

import { imageStyles, viewStyles } from "../../styles/obsEdit/obsEdit";
import CameraOptionsButton from "../SharedComponents/Buttons/CameraOptionsButton";

type Props = {
  currentObs: Object,
  showCameraOptions?: boolean
}

const EvidenceList = ( { currentObs, showCameraOptions }: Props ): Node => {
  const renderCameraOptionsButton =  ( ) => showCameraOptions ? <CameraOptionsButton /> : <View />;

  const renderEvidence = ( { item } ) => {
    const isSound = item.uri.includes( "m4a" );
    const imageUri = { uri: item.uri };
    return (
      <Image
        source={imageUri}
        style={[imageStyles.obsPhoto, isSound && viewStyles.soundButton]}
        testID="ObsEdit.photo"
      />
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
