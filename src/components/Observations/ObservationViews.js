// @flow

import { useNavigation } from "@react-navigation/native";
import ViewWithFooter from "components/SharedComponents/ViewWithFooter";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useRef, useState
} from "react";
import { Animated, Dimensions } from "react-native";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useLocalObservations from "sharedHooks/useLocalObservations";

import EmptyList from "./EmptyList";
import GridItem from "./GridItem";
import useInfiniteScroll from "./hooks/useInfiniteScroll";
import InfiniteScrollFooter from "./InfiniteScrollFooter";
import ObsCard from "./ObsCard";
import ObsListBottomSheet from "./ObsListBottomSheet";
import ObsListHeader from "./ObsListHeader";

const { diffClamp } = Animated;

const { height } = Dimensions.get( "screen" );
const FOOTER_HEIGHT = 75;
const HEADER_HEIGHT = 101;
const BUTTON_ROW_HEIGHT = 50;

// using flatListHeight to make the bottom sheet snap points work when the flatlist
// has only a few items and isn't scrollable
const flatListHeight = height - (
  HEADER_HEIGHT + FOOTER_HEIGHT + BUTTON_ROW_HEIGHT
);

const ObservationViews = ( ): Node => {
  const localObservations = useLocalObservations( );
  const [view, setView] = useState( "list" );
  const navigation = useNavigation( );
  const currentUser = useCurrentUser( );
  const { observationList } = localObservations;
  const [hasScrolled, setHasScrolled] = useState( false );
  const [idBelow, setIdBelow] = useState( null );
  const isLoading = useInfiniteScroll( idBelow );

  // basing collapsible sticky header code off the example in this article
  // https://medium.com/swlh/making-a-collapsible-sticky-header-animations-with-react-native-6ad7763875c3
  const scrollY = useRef( new Animated.Value( 0 ) );

  const handleScroll = Animated.event(
    [
      {
        nativeEvent: {
          contentOffset: { y: scrollY.current }
        }
      }
    ],
    {
      listener: ( { nativeEvent } ) => {
        const { y } = nativeEvent.contentOffset;

        if ( y <= 0 ) {
          setHasScrolled( false );
        } else {
          setHasScrolled( true );
        }
      },
      useNativeDriver: true
    }
  );

  const navToObsDetails = async observation => {
    const { uuid } = observation;
    if ( !observation.wasSynced( ) ) {
      navigation.navigate( "ObsEdit", { uuid } );
    } else {
      navigation.navigate( "ObsDetails", { uuid } );
    }
  };

  const renderEmptyState = ( ) => {
    if ( ( currentUser === false )
      || ( !isLoading && observationList.length === 0 ) ) {
      return <EmptyList />;
    }
    return <View />;
  };

  const renderItem = ( { item } ) => <ObsCard item={item} handlePress={navToObsDetails} />;

  const renderGridItem = ( { item, index } ) => (
    <GridItem
      item={item}
      index={index}
      handlePress={navToObsDetails}
    />
  );

  const renderFooter = ( ) => {
    if ( currentUser === false ) { return <View />; }
    return (
      <InfiniteScrollFooter
        view={view}
        isLoading={isLoading}
      />
    );
  };

  const renderBottomSheet = ( ) => <ObsListBottomSheet hasScrolled={hasScrolled} />;

  const renderItemSeparator = ( ) => <View className="border border-border" />;

  const onEndReached = ( ) => {
    if ( !isLoading ) {
      setIdBelow( observationList[observationList.length - 1].id );
    }
  };

  const scrollYClamped = diffClamp( scrollY.current, 0, HEADER_HEIGHT );

  const translateY = scrollYClamped.interpolate( {
    inputRange: [0, HEADER_HEIGHT],
    // $FlowIgnore
    outputRange: [0, -HEADER_HEIGHT]
  } );

  return (
    <ViewWithFooter>
      <View className="overflow-hidden">
        <Animated.View style={[{ transform: [{ translateY }] }]}>
          <ObsListHeader setView={setView} />
          <Animated.FlatList
            data={observationList}
            key={view === "grid" ? 1 : 0}
            contentContainerStyle={{
            // add extra height to make lists scrollable when there are less
            // items than can fill the screen
              minHeight: flatListHeight + 400
            }}
            testID="ObservationViews.myObservations"
            numColumns={view === "grid" ? 2 : 1}
            renderItem={view === "grid" ? renderGridItem : renderItem}
            ListEmptyComponent={renderEmptyState}
            ListFooterComponent={renderFooter}
            ItemSeparatorComponent={view !== "grid" && renderItemSeparator}
            bounces={false}
            initialNumToRender={10}
            onScroll={handleScroll}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.1}
          />
          {renderBottomSheet( )}
        </Animated.View>
      </View>
    </ViewWithFooter>
  );
};

export default ObservationViews;
