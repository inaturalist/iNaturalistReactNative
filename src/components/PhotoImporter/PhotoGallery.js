// @flow

import PhotoGalleryImage from "components/PhotoImporter/PhotoGalleryImage";
import { Button, StickyToolbar } from "components/SharedComponents";
import ViewWrapper from "components/SharedComponents/ViewWrapper";
import { Text } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, {
  useCallback
} from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { Snackbar } from "react-native-paper";

type Props = {
  checkSelected: Function,
  checkPreviouslySelected: Function,
  skipGroupPhotos: boolean,
  handleImagePress: Function,
  photosByAlbum: Array<Object>,
  navToNextScreen: Function,
  fetchMorePhotos: Function,
  fetchingPhotos: boolean,
  rerenderList: Function,
  showAlert: boolean,
  totalSelected: number,
  hideAlert: Function
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
  rerenderList,
  showAlert,
  totalSelected,
  hideAlert
}: Props ): Node => {
  const renderImage = useCallback( ( { item } ) => {
    const uri = item?.image?.uri;
    const isSelected = checkSelected( uri );
    const isDisabled = skipGroupPhotos && isSelected && checkPreviouslySelected( uri );

    return (
      <PhotoGalleryImage
        uri={uri}
        timestamp={item.timestamp}
        handleImagePress={( ) => handleImagePress( item, isSelected )}
        isSelected={isSelected}
        isDisabled={isDisabled}
      />
    );
  }, [
    checkPreviouslySelected,
    checkSelected,
    skipGroupPhotos,
    handleImagePress
  ] );

  const extractKey = ( item, index ) => `${item}${index}`;

  const renderEmptyList = useCallback( ( ) => {
    if ( fetchingPhotos ) {
      return <ActivityIndicator />;
    }
    return <Text>{t( "No-photos-found" )}</Text>;
  }, [fetchingPhotos] );

  return (
    <ViewWrapper testID="photo-gallery">
      <FlatList
        // $FlowIgnore
        data={photosByAlbum}
        initialNumToRender={4}
        keyExtractor={extractKey}
        numColumns={4}
        renderItem={renderImage}
        onEndReached={fetchMorePhotos}
        testID="PhotoGallery.list"
        ListEmptyComponent={renderEmptyList}
        extraData={rerenderList}
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
