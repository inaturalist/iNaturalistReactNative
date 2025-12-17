import type { FlashListProps, FlashListRef } from "@shopify/flash-list";
import { FlashList } from "@shopify/flash-list";
import React, {
  useCallback,
  useEffect,
  useRef
} from "react";
import type {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ViewabilityConfig
} from "react-native";
import flashListTracker from "sharedHelpers/flashListPerformanceTracker";

const defaultViewabilityConfig: ViewabilityConfig = {
  minimumViewTime: 0,
  viewAreaCoveragePercentThreshold: 10,
  waitForInteraction: false
};

type OnViewableItemsChanged<TItem> = FlashListProps<TItem>["onViewableItemsChanged"];
type ScrollToOffsetParams<TItem> = Parameters<FlashListRef<TItem>["scrollToOffset"]>[0];
type ViewableItemsChangedParams<TItem> = Parameters<NonNullable<OnViewableItemsChanged<TItem>>>[0];

interface Props<TItem> extends FlashListProps<TItem> {
  ref?: React.Ref<FlashListRef<TItem>>;
  viewabilityConfig?: ViewabilityConfig;
}

const CustomFlashList = <TItem, >( props: Props<TItem> ) => {
  const isFirstRender = useRef( true );
  const lastContentOffset = useRef( 0 );

  const scrollStartPosition = useRef( 0 );
  const scrollStartTime = useRef( 0 );
  const isUserScrolling = useRef( false );
  const ignoreInitialEvents = useRef( true );
  const fetchInProgress = useRef( false );

  const {
    ref,
    onMomentumScrollEnd,
    onScroll,
    onViewableItemsChanged,
    onEndReached,
    ...otherProps
  } = props;

  useEffect( ( ) => {
    if ( isFirstRender.current ) {
      flashListTracker.reset( );
      isFirstRender.current = false;

      const timer = setTimeout( () => {
        ignoreInitialEvents.current = false;
      }, 1000 );

      return () => clearTimeout( timer );
    }
    return ( ) => undefined;
  }, [] );

  const handleViewableItemsChanged = useCallback( (
    info: ViewableItemsChangedParams<TItem>
  ) => {
    if ( info.viewableItems.length > 0 ) {
      flashListTracker.markItemsVisible( );
    }

    if ( onViewableItemsChanged ) {
      onViewableItemsChanged( info );
    }
  }, [onViewableItemsChanged] );

  const handleScroll = useCallback( (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    lastContentOffset.current = event.nativeEvent.contentOffset.y;

    if ( onScroll ) {
      onScroll( event );
    }
  }, [onScroll] );

  const handleScrollBeginDrag = useCallback( (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if ( ignoreInitialEvents.current ) return;

    const { y } = event.nativeEvent.contentOffset;

    scrollStartPosition.current = y;
    scrollStartTime.current = Date.now();
    isUserScrolling.current = true;

    flashListTracker.beginScrollEvent( y );
  }, [] );

  const handleScrollEndDrag = useCallback( (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if ( ignoreInitialEvents.current || !isUserScrolling.current ) return;

    const { y } = event.nativeEvent.contentOffset;

    isUserScrolling.current = false;
    flashListTracker.endScrollEvent( y );

    fetchInProgress.current = true;
    flashListTracker.beginDataFetch( );
  }, [] );

  const handleMomentumScrollEnd = useCallback( (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if ( onMomentumScrollEnd ) {
      onMomentumScrollEnd( event );
    }

    if ( isUserScrolling.current && !ignoreInitialEvents.current ) {
      const { y } = event.nativeEvent.contentOffset;
      isUserScrolling.current = false;
      flashListTracker.endScrollEvent( y );

      if ( !fetchInProgress.current ) {
        fetchInProgress.current = true;
        flashListTracker.beginDataFetch();
      }
    }
  }, [onMomentumScrollEnd] );

  const handleEndReached = useCallback( ( ) => {
    if ( ignoreInitialEvents.current ) return;

    if ( !fetchInProgress.current ) {
      fetchInProgress.current = true;
      flashListTracker.beginDataFetch( );
    }

    if ( onEndReached ) {
      onEndReached( );
    }
  }, [onEndReached] );

  // To be called when new data is received
  // This needs to be exposed so it can be called from parent component
  React.useImperativeHandle( ref, ( ) => {
    const originalRef = typeof ref === "function"
      ? {} // Function refs can't be read, only written
      : ( ref?.current || {} );

    return {
      ...originalRef,
      notifyDataFetched: ( itemsCount: number ) => {
        if ( fetchInProgress.current ) {
          flashListTracker.endDataFetch( itemsCount );
          fetchInProgress.current = false;
        } else {
          flashListTracker.beginDataFetch( );
          flashListTracker.endDataFetch( itemsCount );
        }
      },
      scrollToOffset: ( params: ScrollToOffsetParams<TItem> ) => {
        if ( ref && typeof ref !== "function" && ref.current ) {
          ref.current.scrollToOffset( params );
        }
      }
    };
  } );

  const viewabilityConfig = {
    ...defaultViewabilityConfig,
    ...props.viewabilityConfig
  };

  return (
    <FlashList<TItem>
      ref={ref}
      initialNumToRender={5}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.2}
      onViewableItemsChanged={handleViewableItemsChanged}
      onScroll={handleScroll}
      onScrollBeginDrag={handleScrollBeginDrag}
      onScrollEndDrag={handleScrollEndDrag}
      onMomentumScrollEnd={handleMomentumScrollEnd}
      viewabilityConfig={viewabilityConfig}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...otherProps}
    />
  );
};

export default CustomFlashList;
