// @flow

import colors from "colors";
import { SafeAreaView, Text } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, IconButton } from "react-native-paper";

import HorizontalScroll from "./HorizontalScroll";

type Props = {
  photoUris: Array<string>,
  setPhotoUris: Function,
  initialPhotoSelected: Object,
  hideModal: Function
}

const MediaViewer = ( {
  photoUris, setPhotoUris, initialPhotoSelected, hideModal
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
    <SafeAreaView>
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
        className="flex-row justify-end"
        onPress={showDialog}
      >
        {t( "Remove-Photo" )}
      </Button>
    </SafeAreaView>
  );
};

export default MediaViewer;
