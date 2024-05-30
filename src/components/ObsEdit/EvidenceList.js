// @flow

import deleteRemoteObservationSound from "api/observationSounds";
import classnames from "classnames";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import { ActivityIndicator, INatIcon, INatIconButton } from "components/SharedComponents";
import { Image, Pressable, View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import ObservationPhoto from "realmModels/ObservationPhoto";
import ObservationSound from "realmModels/ObservationSound";
import Photo from "realmModels/Photo";
import { log } from "sharedHelpers/logger";
import { useAuthenticatedMutation } from "sharedHooks";
import useTranslation from "sharedHooks/useTranslation";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

const { useRealm } = RealmContext;
const logger = log.extend( "EvidenceList" );

type Props = {
  handleAddEvidence?: Function,
  handleDragAndDrop: Function,
  observationPhotos?: Array<Object>,
  observationSounds?: Array<{
    id?: number,
    sound: {
      file_url: string,
    },
    uuid: string
  }>
}

const EvidenceList = ( {
  handleAddEvidence,
  handleDragAndDrop,
  observationPhotos = [],
  observationSounds = []
}: Props ): Node => {
  const currentObservation = useStore( state => state.currentObservation );
  const deletePhotoFromObservation = useStore( state => state.deletePhotoFromObservation );
  const deleteSoundFromObservation = useStore( state => state.deleteSoundFromObservation );
  const savingPhoto = useStore( state => state.savingPhoto );
  const realm = useRealm( );
  const { t } = useTranslation( );
  const [selectedMediaUri, setSelectedMediaUri]: [string | null, Function] = useState( null );
  const imageClass = "h-16 w-16 justify-center mx-1.5 rounded-lg";
  const photoUris = observationPhotos.map(
    obsPhoto => Photo.displayLocalOrRemoteSquarePhoto( obsPhoto.photo )
  );
  const mediaUris = useMemo( ( ) => ( [
    ...photoUris,
    ...observationSounds.map( obsSound => obsSound.sound.file_url )
  ] ), [photoUris, observationSounds] );

  const renderPhoto = useCallback(
    ( { item: obsPhoto, _getIndex, drag } ) => (
      <ScaleDecorator>
        <Pressable
          onLongPress={drag}
          accessibilityRole="button"
          accessibilityLabel={t( "Select-or-drag-media" )}
          onPress={( ) => {
            setSelectedMediaUri( obsPhoto );
          }}
          className={classnames( imageClass )}
          testID={`EvidenceList.${obsPhoto}`}
        >
          <View className="rounded-lg overflow-hidden">
            <Image
              source={{ uri: obsPhoto }}
              testID="ObsEdit.photo"
              className="w-fit h-full flex items-center justify-center"
              accessibilityIgnoresInvertColors
            />
          </View>
        </Pressable>
      </ScaleDecorator>
    ),
    [setSelectedMediaUri, t]
  );

  const renderFooter = useCallback( ( ) => (
    <View className="flex-1 flex-row">
      <View className="flex-row">
        { observationSounds.map( obsSound => (
          <View
            key={`sound-${obsSound.uuid}`}
            className={classnames( imageClass, "border-2" )}
          >
            <INatIconButton
              icon="sound-outline"
              onPress={( ) => setSelectedMediaUri( obsSound.sound.file_url )}
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
  ), [
    observationSounds,
    savingPhoto,
    setSelectedMediaUri
  ] );

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

  const afterMediaDeleted = useCallback( ( ) => {
    // If there was was only one item and it was deleted, close the modal by
    // nullifying the selected media URI. Otherwise, choose the last
    // remaining item.
    if ( mediaUris.length === 1 ) {
      setSelectedMediaUri( null );
    } else {
      setSelectedMediaUri( mediaUris[mediaUris.length - 1] );
    }
  }, [mediaUris, setSelectedMediaUri] );

  const deleteObservationSoundMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => deleteRemoteObservationSound( params, optsWithAuth )
  );

  const onDeleteSound = useCallback( async uriToDelete => {
    const obsSound = observationSounds.find( os => os.sound.file_url === uriToDelete );
    async function removeLocalSound( ) {
      deleteSoundFromObservation( uriToDelete );
      await ObservationSound.deleteLocalObservationSound(
        realm,
        uriToDelete,
        currentObservation.uuid
      );
      afterMediaDeleted( );
    }
    // If sound was synced, delete the remote copy immediately and then remove
    // the local
    if ( obsSound?.id ) {
      deleteObservationSoundMutation.mutate( { uuid: obsSound.uuid }, {
        onSuccess: removeLocalSound,
        onError: deleteRemoteObservationSoundError => {
          logger.error(
            "[EvidenceList.js] failed to delete remote observation sound: ",
            deleteRemoteObservationSoundError
          );
          Alert.alert(
            t( "Failed-to-delete-sound" ),
            t( "Please-try-again-when-you-are-connected-to-the-internet" )
          );
        }
      } );
    } else {
      // If sound was not synced, just remove it locally
      await removeLocalSound( );
    }
  }, [
    afterMediaDeleted,
    currentObservation.uuid,
    deleteObservationSoundMutation,
    deleteSoundFromObservation,
    realm,
    observationSounds,
    t
  ] );

  const onDeletePhoto = async uriToDelete => {
    deletePhotoFromObservation( uriToDelete );
    await ObservationPhoto.deletePhoto( realm, uriToDelete, currentObservation );
    afterMediaDeleted( );
  };

  const evidenceList = useMemo( ( ) => (
    <DraggableFlatList
      testID="EvidenceList.DraggableFlatList"
      horizontal
      data={photoUris}
      renderItem={renderPhoto}
      keyExtractor={obsPhoto => obsPhoto}
      onDragEnd={handleDragAndDrop}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      className="py-5"
    />
  ), [
    handleDragAndDrop,
    photoUris,
    renderFooter,
    renderHeader,
    renderPhoto
  ] );

  return (
    <>
      {evidenceList}
      <MediaViewerModal
        editable
        onClose={( ) => setSelectedMediaUri( null )}
        onDeletePhoto={onDeletePhoto}
        onDeleteSound={onDeleteSound}
        photos={observationPhotos.map( obsPhoto => obsPhoto.photo )}
        showModal={!!selectedMediaUri}
        sounds={observationSounds.map( obsSound => obsSound.sound )}
        uri={selectedMediaUri}
      />
    </>
  );
};

export default EvidenceList;
