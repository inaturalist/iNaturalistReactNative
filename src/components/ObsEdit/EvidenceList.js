// @flow

import React from "react";
import { FlatList, Image, Pressable } from "react-native";
import type { Node } from "react";

import { imageStyles, viewStyles } from "../../styles/obsEdit/obsEdit";
// import CameraOptionsButton from "../SharedComponents/Buttons/CameraOptionsButton";

type Props = {
  currentObs: Object,
  showCameraOptions?: boolean,
  setSelectedPhoto?: Function,
  selectedPhoto?: number
}

const EvidenceList = ( { currentObs, showCameraOptions, setSelectedPhoto, selectedPhoto }: Props ): Node => {
  // const renderCameraOptionsButton =  ( ) => showCameraOptions ? <CameraOptionsButton /> : <View />;

  const renderEvidence = ( { item, index } ) => {
    const isSound = item?.file_url;
    let photoUrl = item.photo?.url || item?.photo?.localFilePath;
    // TODO this needs to deal with sounds
    if ( !photoUrl ) {
      throw "Tried to render photo that has no url or path!";
    }
    console.log( photoUrl, item.photo, "photo url in render evidence" );
    const imageUri = { uri: photoUrl };

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
      evidence = currentObs.observationPhotos;
    }
    if ( currentObs.observationSounds ) {
      evidence = evidence.concat( currentObs.observationSounds );
    }
    return evidence;
  };

  return (
    <FlatList
      data={displayEvidence( )}
      horizontal
      renderItem={renderEvidence}
      // ListFooterComponent={renderCameraOptionsButton}
      contentContainerStyle={viewStyles.evidenceList}
    />
  );
};

export default EvidenceList;
