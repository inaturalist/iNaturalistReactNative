// @flow

import { FlashList } from "@shopify/flash-list";
import PhotoGalleryImage from "components/PhotoImporter/PhotoGalleryImage";
import {
  Body3, Button, StickyToolbar, ViewWrapper
} from "components/SharedComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, {
  useCallback, useMemo
} from "react";
import { ActivityIndicator } from "react-native";
import { Snackbar } from "react-native-paper";
import { useDeviceOrientation } from "sharedHooks";

const GUTTER = 1;

type Props = {
  checkSelected: Function,
  checkPreviouslySelected: Function,
  skipGroupPhotos: boolean,
  handleImagePress: Function,
  photosByAlbum: Array<Object>,
  navToNextScreen: Function,
  fetchMorePhotos: Function,
  fetchingPhotos: boolean,
  showAlert: boolean,
  totalSelected: number,
  hideAlert: Function,
  galleryUris: Array<string>
}

const PhotoGallery = ( {
  checkPreviouslySelected,
  checkSelected,
  skipGroupPhotos,
  handleImagePress,
  photosByAlbum,
  navToNextScreen,
  fetchMorePhotos,
  fetchingPhotos,
  galleryUris,
  showAlert,
  totalSelected,
  hideAlert
}: Props ): Node => {
  const {
    isTablet, screenWidth, screenHeight
  } = useDeviceOrientation();
  const numColumns = 4;
  const calculateGridItemWidth = () => {
    const combinedGutter = ( numColumns + 1 ) * GUTTER;
    const gridWidth = isTablet
      ? screenWidth
      : Math.min( screenWidth, screenHeight );
    return Math.floor( ( gridWidth - combinedGutter ) / numColumns );
  };
  const itemWidth = calculateGridItemWidth();

  const itemStyle = useMemo( ( ) => ( {
    height: itemWidth,
    width: itemWidth,
    margin: GUTTER / 2
  } ), [itemWidth] );

  const renderImage = useCallback( ( { item } ) => {
    const uri = item?.image?.uri;
    const isSelected = checkSelected( uri );
    const isDisabled = ( skipGroupPhotos && isSelected && checkPreviouslySelected( uri ) ) || false;

    return (
      <PhotoGalleryImage
        uri={uri}
        timestamp={item.timestamp}
        handleImagePress={( ) => handleImagePress( item, isSelected )}
        isSelected={isSelected}
        isDisabled={isDisabled}
        itemStyle={itemStyle}
      />
    );
  }, [
    checkPreviouslySelected,
    checkSelected,
    skipGroupPhotos,
    handleImagePress,
    itemStyle
  ] );

  const extractKey = ( item, index ) => `${item}${index}`;

  const renderEmptyList = useCallback( ( ) => {
    if ( fetchingPhotos ) {
      return <ActivityIndicator />;
    }
    return <Body3>{t( "No-photos-found" )}</Body3>;
  }, [fetchingPhotos] );

  const flashListStyle = {
    paddingLeft: GUTTER / 2,
    paddingRight: GUTTER / 2,
    paddingBottom: 80 + GUTTER / 2
  };

  const extraData = {
    galleryUris
  };

  return (
    <ViewWrapper testID="photo-gallery">
      <FlashList
        contentContainerStyle={flashListStyle}
        data={photosByAlbum}
        initialNumToRender={4}
        keyExtractor={extractKey}
        numColumns={numColumns}
        renderItem={renderImage}
        onEndReached={fetchMorePhotos}
        testID="PhotoGallery.list"
        ListEmptyComponent={renderEmptyList}
        extraData={extraData}
        estimatedItemSize={itemWidth}
      />
      {totalSelected > 0 && (
        <StickyToolbar containerClass="items-center">
          <Button
            className="max-w-[500px] w-full"
            level="focus"
            text={t( "Import-X-photos", { count: totalSelected || 0 } )}
            onPress={navToNextScreen}
            testID="PhotoGallery.createObsButton"
          />
        </StickyToolbar>
      )}
      <Snackbar visible={showAlert} onDismiss={hideAlert}>
        {t( "You-can-only-upload-20-media" )}
      </Snackbar>
    </ViewWrapper>
  );
};

export default PhotoGallery;
