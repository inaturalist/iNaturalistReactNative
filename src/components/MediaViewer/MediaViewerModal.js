// @flow

import { Modal, SafeAreaView, Text } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, IconButton } from "react-native-paper";
import colors from "styles/tailwindColors";

import HorizontalScroll from "./HorizontalScroll";

type Props = {
  photoUris: Array<string>,
  setPhotoUris: Function,
  initialPhotoSelected: Object,
  mediaViewerVisible: boolean,
  hideModal: Function
}

const MediaViewerModal = ( {
  photoUris,
  setPhotoUris,
  initialPhotoSelected,
  mediaViewerVisible,
  hideModal
}: Props ): Node => {
  const { t } = useTranslation( );
  const [deleteDialogVisible, setDeleteDialogVisible] = useState( false );

  const numOfPhotos = photoUris.length;

  const showDialog = ( ) => setDeleteDialogVisible( true );
  const hideDialog = ( ) => setDeleteDialogVisible( false );

  useEffect( ( ) => {
    if ( numOfPhotos === 0 ) {
      hideModal( );
    }
  }, [numOfPhotos, hideModal] );

  return (
    <Modal
      visible={mediaViewerVisible}
      onDismiss={hideModal}
      // onRequestClose is used to trigger system back button on Android
      onRequestClose={hideModal}
    >
      <SafeAreaView className="bg-black h-full">
        <Text className="text-2xl text-white self-center mb-2">
          {t( "X-Photos", { photoCount: numOfPhotos } )}
        </Text>
        <HorizontalScroll
          photoUris={photoUris}
          initialPhotoSelected={initialPhotoSelected}
          deleteDialogVisible={deleteDialogVisible}
          setPhotoUris={setPhotoUris}
          hideDialog={hideDialog}
        />
        <IconButton
          icon="arrow-left"
          onPress={hideModal}
          iconColor={colors.white}
        />
        <Button
          className="flex-row justify-end p-5"
          onPress={showDialog}
        >
          {t( "Remove-Photo" )}
        </Button>
      </SafeAreaView>
    </Modal>
  );
};

export default MediaViewerModal;
