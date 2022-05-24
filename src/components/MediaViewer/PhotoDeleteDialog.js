// @flow

import React, { useState } from "react";
import type { Node } from "react";
import { Button, Paragraph, Dialog, Portal } from "react-native-paper";
import { useTranslation } from "react-i18next";
import Realm from "realm";

import { viewStyles } from "../../styles/mediaViewer/mediaViewer";
import ObservationPhoto from "../../models/ObservationPhoto";
import realmConfig from "../../models/index";

type Props = {
  photo: Object,
  photos: Array<Object>,
  setPhotos: Function
}

const PhotoDeleteDialog = ( { photo, photos, setPhotos }: Props ): Node => {
  const { t } = useTranslation( );
  const [visible, setVisible] = useState( false );

  const showDialog = ( ) => setVisible( true );
  const hideDialog = ( ) => setVisible( false );

  const deletePhoto = async ( ) => {
    if ( !photo ) { return; }

    const realm = await Realm.open( realmConfig );
    await ObservationPhoto.deleteObservationPhoto( realm, photo );

    const updatedPhotos = photos;
    const photoIndex = photos.findIndex( p => p === photo );
    updatedPhotos.splice( photoIndex, 1 );

    // spreading the array forces rerender on each photo deletion
    setPhotos( [...updatedPhotos] );

    hideDialog( );
  };

    return (
      <>
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
        <Button
          style={viewStyles.alignRight}
          onPress={showDialog}
        >
          {t( "Remove-Photo" )}
        </Button>
      </>
    );
};

export default PhotoDeleteDialog;
