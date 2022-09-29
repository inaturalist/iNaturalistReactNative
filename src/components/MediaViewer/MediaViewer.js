// @flow

import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native";
import { Appbar, Button, IconButton } from "react-native-paper";
import colors from "styles/colors";
import { textStyles, viewStyles } from "styles/mediaViewer/mediaViewer";

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
    <SafeAreaView style={viewStyles.container}>
      <Appbar.Header style={viewStyles.container}>
        <Appbar.Content
          title={t( "X-Photos", { photoCount: numOfPhotos } )}
          titleStyle={textStyles.whiteText}
        />
      </Appbar.Header>
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
        style={viewStyles.alignRight}
        onPress={showDialog}
      >
        {t( "Remove-Photo" )}
      </Button>
    </SafeAreaView>
  );
};

export default MediaViewer;
