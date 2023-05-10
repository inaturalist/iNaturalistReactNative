// @flow

import { Pressable } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Dimensions, FlatList } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Photo from "realmModels/Photo";
import colors from "styles/tailwindColors";

import CustomImageZoom from "./CustomImageZoom";

type Props = {
  photoUris: Array<string>,
  selectedPhotoIndex: number,
  setSelectedPhotoIndex: Function,
  scrollToIndex: Function,
  horizontalScroll: any
}

const { width } = Dimensions.get( "screen" );

const MainPhotoDisplay = ( {
  photoUris, selectedPhotoIndex, setSelectedPhotoIndex, horizontalScroll, scrollToIndex
}: Props ): Node => {
  const atFirstPhoto = selectedPhotoIndex === 0;
  const atLastPhoto = selectedPhotoIndex === photoUris.length - 1;

  const renderImage = ( { item } ) => (
    <CustomImageZoom source={{ uri: Photo.displayLargePhoto( item ) }} />
  );

  // need getItemLayout for setting initial scroll index
  const getItemLayout = ( data, index ) => ( {
    length: width,
    offset: width * index,
    index
  } );

  const handleScrollLeft = index => {
    if ( atFirstPhoto ) { return; }
    setSelectedPhotoIndex( index );
  };

  const handleScrollRight = index => {
    if ( atLastPhoto ) { return; }
    setSelectedPhotoIndex( index );
  };

  const handleScrollEndDrag = e => {
    const { contentOffset, layoutMeasurement } = e.nativeEvent;
    const { x } = contentOffset;

    const currentOffset = width * selectedPhotoIndex;

    // https://gist.github.com/dozsolti/6d01d0f96d9abced3450a2e6149a2bc3?permalink_comment_id=4107663#gistcomment-4107663
    const index = Math.floor(
      Math.floor( x ) / Math.floor( layoutMeasurement.width )
    );

    if ( x > currentOffset ) {
      handleScrollRight( index );
    } else if ( x < currentOffset ) {
      handleScrollLeft( index );
    }
  };

  const handleArrowPressLeft = ( ) => {
    if ( atFirstPhoto ) { return; }
    scrollToIndex( selectedPhotoIndex - 1 );
  };

  const handleArrowPressRight = ( ) => {
    if ( atLastPhoto ) { return; }
    scrollToIndex( selectedPhotoIndex + 1 );
  };

  return (
    <>
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
      {!atFirstPhoto && (
        <Pressable
          accessibilityRole="button"
          className="p-5 absolute top-1/2 -mt-24 left-0"
          onPress={handleArrowPressLeft}
        >
          <Icon name="arrow-back-ios" color={colors.white} size={16} />
        </Pressable>
      )}
      {!atLastPhoto && (
        <Pressable
          accessibilityRole="button"
          className="p-5 absolute top-1/2 -mt-24 right-0"
          onPress={handleArrowPressRight}
        >
          <Icon name="arrow-forward-ios" color={colors.white} size={16} />
        </Pressable>
      )}
    </>
  );
};

export default MainPhotoDisplay;
