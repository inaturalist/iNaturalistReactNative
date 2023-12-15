// @flow

import classnames from "classnames";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import { INatIcon } from "components/SharedComponents";
import { Image, Pressable, View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useCallback, useState } from "react";
import { ActivityIndicator } from "react-native";
// eslint-disable-next-line import/no-extraneous-dependencies
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import ObservationPhoto from "realmModels/ObservationPhoto";
import Photo from "realmModels/Photo";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

const { useRealm } = RealmContext;

type Props = {
  photos?: Array<{
    id?: number,
    url: string,
    localFilePath?: string,
    attribution?: string,
    licenseCode?: string
  }>,
  handleAddEvidence?: Function,
  handleDragAndDrop: Function
}

const EvidenceList = ( {
  photos = [],
  handleAddEvidence,
  handleDragAndDrop
}: Props ): Node => {
  const currentObservation = useStore( state => state.currentObservation );
  const deletePhotoFromObservation = useStore( state => state.deletePhotoFromObservation );
  const savingPhoto = useStore( state => state.savingPhoto );
  const realm = useRealm( );
  const [tappedMediaIndex, setTappedMediaIndex] = useState( -1 );
  const imageClass = "h-16 w-16 justify-center mx-1.5 rounded-lg";
  const photoUris = photos.map( photo => photo.url || photo.localFilePath );

  const renderPhoto = useCallback( ( { item: photo, getIndex, drag } ) => (
    <ScaleDecorator>
      <Pressable
        onLongPress={drag}
        accessibilityRole="button"
        onPress={( ) => {
          setTappedMediaIndex( getIndex( ) );
        }}
        className={classnames( imageClass )}
        testID={`EvidenceList.${photo.url || photo.localFilePath}`}
      >
        <View className="rounded-lg overflow-hidden">
          <Image
            source={{ uri: Photo.displayLocalOrRemoteSquarePhoto( photo ) }}
            testID="ObsEdit.photo"
            className="w-fit h-full flex items-center justify-center"
            accessibilityIgnoresInvertColors
          />
        </View>
      </Pressable>
    </ScaleDecorator>
  ), [setTappedMediaIndex] );

  const renderFooter = useCallback( ( ) => {
    if ( savingPhoto ) {
      return (
        <View className={classnames( imageClass )} testID="EvidenceList.saving">
          <View className="rounded-lg overflow-hidden">
            <View className="bg-lightGray w-fit h-full justify-center">
              <ActivityIndicator />
            </View>
          </View>
        </View>
      );
    }
    return null;
  }, [savingPhoto] );

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
    <View className="mt-5">
      <DraggableFlatList
        testID="EvidenceList.DraggableFlatList"
        horizontal
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={photo => photo.url || photo.localFilePath}
        onDragEnd={handleDragAndDrop}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
      />
      <MediaViewerModal
        editable
        showModal={tappedMediaIndex >= 0}
        onClose={( ) => setTappedMediaIndex( -1 )}
        onDelete={async uriToDelete => {
          await ObservationPhoto.deletePhoto( realm, uriToDelete, currentObservation );
          deletePhotoFromObservation( uriToDelete );
          setTappedMediaIndex( tappedMediaIndex - 1 );
        }}
        uri={photoUris[tappedMediaIndex]}
        photos={photos}
      />
    </View>
  );
};

export default EvidenceList;
