// @flow

// ScrollableWithStickyHeader renders a scrollable view (e.g. ScrollView or
// FlashList) with a header component above it. The header component will
// stick to the top of the screen when scrolled to a particular y value
// (stickyAt)
//
// To use this, you need to give it two functions, one to render the header
// and the other to render an *animated* scrollable (i.e. whatever subclass
// of ScrollView you're using must be wrapped in
// Animated.createAnimatedComponent()). renderHeader takes a single argument,
// the setStickyAt function, that sets the scroll offset at which the header
// sticks (this is probably dependent on the height of the rendered layout).
//
// renderScrollable takes a single argument, the animatedScrollEvent, which
// should be passed to the scrollable's onScroll prop, and/or get called with
// the same event
//
// Some background: the easiest way to set a sticky header header with a
// ScrollView is the stickyHeaderIndices prop, but that doesn't work quite as
// expected with FlashList because the only children of the underlying
// ScrollView in FlashList are the items themselves. You can render the
// header as the first item and then make that stick, but you run into
// problems when you try to show multiple columns and your header component
// gets confined to the column width. The solution here uses an offset
// transform to achive something similar. It also assumes it occupies full
// height
//
// In case git loses some of the history, this approach was original authored
// by @albullington, with modifications by @budowski to deal with overscroll
// problems

import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated } from "react-native";
import { useDeviceOrientation } from "sharedHooks";

type Props = {
  onScroll?: Function,
  renderHeader: Function,
  renderScrollable: Function
};

const ScrollableWithStickyHeader = ( {
  onScroll,
  renderHeader,
  renderScrollable,
}: Props ): Node => {
  const {
    isTablet,
    screenHeight,
    screenWidth,
  } = useDeviceOrientation( );
  const [_scrollPosition, setScrollPosition] = useState( 0 );

  const [stickyAt, setStickyAt] = useState( 0 );

  // basing collapsible sticky header code off the example in this article
  // https://medium.com/swlh/making-a-collapsible-sticky-header-animations-with-react-native-6ad7763875c3
  const scrollY = useRef( new Animated.Value( 0 ) );

  const animatedScrollEvent = Animated.event(
    [
      {
        nativeEvent: {
          contentOffset: { y: scrollY.current },
        },
      },
    ],
    {
      useNativeDriver: true,
      listener: onScroll,
    },
  );

  useEffect( () => {
    const currentScrollY = scrollY.current;
    // #560 - We use a state variable to force rendering of the component - since on iOS,
    // you can over scroll a list when scrolling it to the top (creating a bounce effect),
    // and sometimes, even though offsetForHeader gets updated correctly, it doesn't cause
    // a re-render of the component, and then the Animated.View's translateY property doesn't
    // get updated with the latest value of offsetForHeader (this causes a weird view, where the
    // top header if semi cut off, even though the user scrolled the list all the way to the top).
    // So by changing a state variable of the component, every time the user scroll the list -> we
    // make sure the component always gets re-rendered.
    currentScrollY.addListener( ( { value } ) => {
      if ( value <= 0 ) {
        // Only force refresh of the state in case of an over-scroll (bounce effect)
        // don't let this value go negative, or else bottom tabs will be unresponsive to taps
        setScrollPosition( Math.max( value, 0 ) );
      }
    } );

    return () => {
      currentScrollY.removeAllListeners();
    };
  }, [scrollY] );

  const contentHeight = useMemo(
    ( ) => (
      isTablet
        ? screenHeight
        : Math.max( screenWidth, screenHeight )
    ),
    [isTablet, screenHeight, screenWidth],
  );

  const animatedStyle = useMemo( ( ) => ( {
    transform: [{
      // Translate the view up (negative value) relative to scroll
      // position *until* the user scrolls to stickyAt, at which point
      // we stop translating because the sticky part needs to stick. So
      // roughly any scroll positions between 0 and stickyAt get mapped
      // to values between 0 and -stickyAt
      //
      // The input range is doubled because on Android, the scroll view
      // offset is a double (not an integer), and interpolation
      // shouldn't be one-to-one, which causes a jittery header while
      // slow scrolling(see issue #634). See here as well:
      // https://stackoverflow.com/a/60898411/1233767
      //
      // The third value in the interpolation ranges ensures that any
      // scroll values beyond stickyAt always get mapped to -stickyAt,
      // which has the effect of only unsticking the header when you're
      // scrolled to the top of the screen
      //
      // And finally, that +1 seems to solve an error in iOS
      translateY: scrollY.current.interpolate( {
        inputRange: [0, stickyAt * 2, stickyAt * 2 + 1],
        outputRange: [0, -stickyAt, -stickyAt],
      } ),
    }],
    // Set the height to flow off screen so that when we translate the
    // view up, there's no gap at the bottom
    height: contentHeight + stickyAt,
  } ), [contentHeight, stickyAt] );

  return (
    // Note that we want to occupy full height but hide the overflow because
    // we are intentionally setting the height of the Animated.View to exceed
    // the height of this parent view. We want the parent view to be laid out
    // nicely with its peers, not flow off the screen.
    <View className="overflow-hidden h-full">
      <Animated.View style={animatedStyle}>
        {renderHeader( setStickyAt )}
        {renderScrollable( animatedScrollEvent )}
      </Animated.View>
    </View>
  );
};

export default ScrollableWithStickyHeader;
