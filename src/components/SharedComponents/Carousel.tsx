// Horizontal flatlist wrapper for showing scrollable slides that act like
// pages (i.e. they snap to show one slide at a time)
//
// Biggest caveat is that renderItem may need return a component where width
// and height are set in the style component. Tailwind classes do not always
// seem to work for some reason.
import React from "react";
import {
  FlatList,
  FlatListProps,
  I18nManager
} from "react-native";

interface Props extends FlatListProps<object> {
  onSlideScroll: ( index: number ) => void;
}

const Carousel = ( props: Props ) => (
  <FlatList
    horizontal
    pagingEnabled
    showsHorizontalScrollIndicator={false}
    onMomentumScrollEnd={e => {
      if ( typeof ( props.onSlideScroll ) !== "function" ) {
        return;
      }
      // The carousel is the container of all the slides
      const {
        contentOffset: carouselOffset,
        contentSize: carouselSize,
        layoutMeasurement: slideSize
      } = e.nativeEvent;
      // In RTL, the offset still assume the origin is on the left, so
      // we need to invert the offset and account for the slide size
      const effectiveOffset = I18nManager.isRTL
        ? carouselSize.width - carouselOffset.x - slideSize.width
        : carouselOffset.x;

      // https://gist.github.com/dozsolti/6d01d0f96d9abced3450a2e6149a2bc3?permalink_comment_id=4107663#gistcomment-4107663
      const newIndex = Math.floor(
        Math.floor( effectiveOffset ) / Math.floor( slideSize.width )
      );
      props.onSlideScroll( newIndex );
    }}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

export default Carousel;
