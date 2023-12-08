// @flow

import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import { FlatList } from "react-native";
import Photo from "realmModels/Photo";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";

import CustomImageZoom from "./CustomImageZoom";

type Props = {
  handleScrollEndDrag: Function,
  horizontalScroll: any,
  photoUris: Array<string>,
  selectedPhotoIndex: number
}

const MainPhotoDisplay = ( {
  handleScrollEndDrag,
  horizontalScroll,
  photoUris,
  selectedPhotoIndex
}: Props ): Node => {
  const { screenWidth } = useDeviceOrientation( );
  const renderImage = ( { item } ) => (
    <CustomImageZoom source={{ uri: Photo.displayLargePhoto( item ) }} />
  );

  // need getItemLayout for setting initial scroll index
  const getItemLayout = useCallback( ( data, idx ) => ( {
    length: screenWidth,
    offset: screenWidth * idx,
    index: idx
  } ), [screenWidth] );

  return (
    <View className="flex-1">
      <FlatList
        data={photoUris}
        renderItem={renderImage}
        initialScrollIndex={selectedPhotoIndex}
        getItemLayout={getItemLayout}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        // $FlowIgnore
        ref={horizontalScroll}
        onMomentumScrollEnd={handleScrollEndDrag}
      />
    </View>
  );
};

export default MainPhotoDisplay;
