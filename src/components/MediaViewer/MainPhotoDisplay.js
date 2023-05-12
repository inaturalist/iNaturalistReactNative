// @flow

import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { FlatList } from "react-native";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";

import CustomImageZoom from "./CustomImageZoom";

type Props = {
  photoUris: Array<string>,
  selectedPhotoIndex: number,
  handleScrollEndDrag: Function,
  horizontalScroll: any
}

const MainPhotoDisplay = ( {
  photoUris, selectedPhotoIndex, horizontalScroll,
  handleScrollEndDrag
}: Props ): Node => {
  const { screenWidth } = useDeviceOrientation( );
  const renderImage = ( { item } ) => <CustomImageZoom source={{ uri: item }} />;

  // need getItemLayout for setting initial scroll index
  const getItemLayout = ( data, index ) => ( {
    length: screenWidth,
    offset: screenWidth * index,
    index
  } );

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
