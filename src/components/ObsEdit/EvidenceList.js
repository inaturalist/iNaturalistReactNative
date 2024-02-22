// @flow

import classnames from "classnames";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import { ActivityIndicator, INatIcon, INatIconButton } from "components/SharedComponents";
import { Image, Pressable, View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useCallback, useState } from "react";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import ObservationPhoto from "realmModels/ObservationPhoto";
import ObservationSound from "realmModels/ObservationSound";
import Photo from "realmModels/Photo";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

const { useRealm } = RealmContext;

type Props = {
  handleAddEvidence?: Function,
  handleDragAndDrop: Function,
  photos?: Array<Object>,
  sounds?: Array<{
    id?: number,
    file_url: string,
    uuid: string
  }>
}

const EvidenceList = ( {
  handleAddEvidence,
  handleDragAndDrop,
  photos = [],
  sounds = []
}: Props ): Node => {
  const currentObservation = useStore( state => state.currentObservation );
  const deletePhotoFromObservation = useStore( state => state.deletePhotoFromObservation );
  const deleteSoundFromObservation = useStore( state => state.deleteSoundFromObservation );
  const savingPhoto = useStore( state => state.savingPhoto );
  const realm = useRealm( );
  const [tappedMediaUri, setTappedMediaUri]: [string | null, Function] = useState( null );
  const imageClass = "h-16 w-16 justify-center mx-1.5 rounded-lg";
  const photoUris = photos.map( obsPhoto => obsPhoto.photo?.url || obsPhoto.photo?.localFilePath );
  const innerPhotos = photos.map( obsPhoto => obsPhoto.photo );
  const mediaUris = [
    ...photoUris,
    ...sounds.map( sound => sound.file_url )
  ];

  const renderPhoto = useCallback( ( { item: obsPhoto, _getIndex, drag } ) => {
    const uri = Photo.displayLocalOrRemoteSquarePhoto( obsPhoto.photo );
    return (
      <ScaleDecorator>
        <Pressable
          onLongPress={drag}
          accessibilityRole="button"
          onPress={( ) => {
            setTappedMediaUri( uri );
          }}
          className={classnames( imageClass )}
          testID={`EvidenceList.${obsPhoto.photo?.url || obsPhoto.photo?.localFilePath}`}
        >
          <View className="rounded-lg overflow-hidden">
            <Image
              source={{ uri }}
              testID="ObsEdit.photo"
              className="w-fit h-full flex items-center justify-center"
              accessibilityIgnoresInvertColors
            />
          </View>
        </Pressable>
      </ScaleDecorator>
    );
  }, [setTappedMediaUri] );

  const renderFooter = useCallback( ( ) => (
    <View className="flex-1 flex-row">
      <View className="flex-row">
        { sounds.map( sound => (
          <View
            key={`sound-${sound.uuid}`}
            className={classnames( imageClass, "border-2" )}
          >
            <INatIconButton
              icon="sound-outline"
              onPress={( ) => setTappedMediaUri( sound.file_url )}
              accessibilityLabel="Sound"
              width={60}
              height={60}
              size={26}
            />
          </View>
        ) ) }
      </View>
      { savingPhoto && (
        <View className={classnames( imageClass )} testID="EvidenceList.saving">
          <View className="border-2 rounded-lg overflow-hidden w-fit h-full justify-center">
            <ActivityIndicator size={26} />
          </View>
        </View>
      ) }
    </View>
  ), [savingPhoto, setTappedMediaUri, sounds] );

  const renderHeader = useCallback( ( ) => (
    <Pressable
      accessibilityRole="button"
      onPress={handleAddEvidence}
      className={
        `${imageClass} border border-[2px] border-darkGray items-center justify-center`
      }
      testID="EvidenceList.add"
    >
      <INatIcon name="plus-bold" size={27} color={colors.darkGray} />
    </Pressable>
  ), [handleAddEvidence] );

  return (
    <>
      <DraggableFlatList
        testID="EvidenceList.DraggableFlatList"
        horizontal
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={obsPhoto => obsPhoto.photo?.url || obsPhoto.photo?.localFilePath}
        onDragEnd={handleDragAndDrop}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        className="py-5"
      />
      <MediaViewerModal
        editable
        showModal={!!tappedMediaUri}
        onClose={( ) => setTappedMediaUri( null )}
        onDeletePhoto={async uriToDelete => {
          await ObservationPhoto.deletePhoto( realm, uriToDelete, currentObservation );
          deletePhotoFromObservation( uriToDelete );
          setTappedMediaUri( mediaUris[mediaUris.length - 1] );
        }}
        onDeleteSound={async uriToDelete => {
          deleteSoundFromObservation( uriToDelete );
          await ObservationSound.deleteSound( realm, uriToDelete, currentObservation );
          if ( mediaUris.length === 1 ) {
            setTappedMediaUri( null );
          } else {
            setTappedMediaUri( mediaUris[mediaUris.length - 1] );
          }
        }}
        uri={tappedMediaUri}
        photos={innerPhotos}
        sounds={sounds}
      />
    </>
  );
};

export default EvidenceList;
