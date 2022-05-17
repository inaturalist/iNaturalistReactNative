// @flow

import React, { useState } from "react";
import { FlatList, Image, Pressable, Text } from "react-native";
import type { Node } from "react";
import RNFS from "react-native-fs";
import { Button, Paragraph, Dialog, Portal, Avatar } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";

import { viewStyles, imageStyles, textStyles } from "../../styles/camera/standardCamera";
import Photo from "../../models/Photo";

type Props = {
  photos: Array<Object>,
  setPhotos: Function
}

const PhotoPreview = ( { photos, setPhotos }: Props ): Node => {
  const { t } = useTranslation( );
  const [visible, setVisible] = useState( false );
  const [photoToDelete, setPhotoToDelete] = useState( null );
  const navigation = useNavigation( );

  const handleSelection = ( mainPhoto ) => {
    navigation.navigate( "MediaViewer", { photos, mainPhoto } );
  };

  const showDialog = ( ) => setVisible( true );
  const hideDialog = ( ) => {
    setPhotoToDelete( null );
    setVisible( false );
  };

  const deletePhoto = ( ) => {
    if ( !photoToDelete ) { return; }
    const updatedPhotos = photos;
    const photoIndex = photos.findIndex( p => p === photoToDelete );
    updatedPhotos.splice( photoIndex, 1 );

    // spreading the array forces PhotoPreview to rerender on each photo deletion
    setPhotos( [...updatedPhotos] );

    // delete photo thumbnail from temp directory
    const tempDirectory = `${RNFS.TemporaryDirectoryPath}/ReactNative`;
    const fileName = photoToDelete.path.split( "ReactNative/" )[1];
    RNFS.unlink( `${tempDirectory}/${fileName}` );

    hideDialog( );
  };

  const renderSmallPhoto = ( { item, index } ) => {
    const uri = Photo.setPlatformSpecificFilePath( item.path );

    return (
      <Pressable onPress={( ) => handleSelection( index )}>
        <Portal>
          <Dialog visible={visible} onDismiss={hideDialog}>
            <Dialog.Content>
              <Paragraph>{t( "Are-you-sure" )}</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog} style={viewStyles.cancelButton}>
                {t( "Cancel" )}
              </Button>
              <Button onPress={deletePhoto} style={viewStyles.confirmButton}>
                {t( "Yes-delete-photo" )}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <Image source={{ uri }} style={imageStyles.smallPhoto} />
        <Pressable
          onPress={( ) => {
            setPhotoToDelete( item );
            showDialog( );
          }}
          style={viewStyles.deleteButton}
        >
          <Avatar.Icon icon="delete-forever" size={30} />
        </Pressable>
      </Pressable>
    );
  };

  const emptyDescription = ( ) => (
    <Text style={textStyles.topPhotoText}>
      {t( "Photos-you-take-will-appear-here" )}
    </Text>
  );

  return (
    <FlatList
      data={photos}
      contentContainerStyle={viewStyles.photoContainer}
      renderItem={renderSmallPhoto}
      horizontal
      ListEmptyComponent={emptyDescription}
    />
  );
};

export default PhotoPreview;
