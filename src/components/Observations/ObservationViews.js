// @flow

import { useNavigation } from "@react-navigation/native";
import ViewWrapper from "components/SharedComponents/ViewWrapper";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Dimensions, Pressable } from "react-native";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useLocalObservations from "sharedHooks/useLocalObservations";

import EmptyList from "./EmptyList";
import useInfiniteScroll from "./hooks/useInfiniteScroll";
import InfiniteScrollFooter from "./InfiniteScrollFooter";
import ObsGridItem from "./ObsGridItem";
import ObsListBottomSheet from "./ObsListBottomSheet";
import ObsListHeader from "./ObsListHeader";
import ObsListItem from "./ObsListItem";

const { diffClamp } = Animated;

const { height } = Dimensions.get( "screen" );
const HEADER_HEIGHT = 101;

const ObservationViews = (): Node => {
  const localObservations = useLocalObservations();
  const [layout, setLayout] = useState( "list" );
  const navigation = useNavigation();
  const currentUser = useCurrentUser();
  const { observationList } = localObservations;
  const [hasScrolled, setHasScrolled] = useState( false );
  const [idBelow, setIdBelow] = useState( null );
  const isLoading = useInfiniteScroll( idBelow );
  const { t } = useTranslation();
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
    if ( !observation.wasSynced() ) {
      navigation.navigate( "ObsEdit", { uuid } );
    } else {
      navigation.navigate( "ObsDetails", { uuid } );
    }
  };

  const renderEmptyState = () => {
    if ( currentUser === false || ( !isLoading && observationList.length === 0 ) ) {
      return <EmptyList />;
    }
    return <View />;
  };

  const renderItem = ( { item } ) => (
    <Pressable
      onPress={() => navToObsDetails( item )}
      accessibilityRole="link"
      accessibilityHint={t( "Navigate-to-observation-details" )}
      accessibilityLabel={t( "Observation-Name", {
        scientificName: item.name
      } )}
    >
      {layout === "grid" ? (
        <ObsGridItem observation={item} />
      ) : (
        <ObsListItem observation={item} />
      )}
    </Pressable>
  );

  const renderFooter = () => {
    if ( currentUser === false ) {
      return <View />;
    }
    return <InfiniteScrollFooter view={layout} isLoading={isLoading} />;
  };

  const renderItemSeparator = () => (
    <View className="border border-lightGray" />
  );

  const onEndReached = () => {
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
    <ViewWrapper>
      <View className="overflow-hidden">
        <Animated.View style={[{ transform: [{ translateY }] }]}>
          <Animated.FlatList
            data={observationList}
            key={layout === "grid" ? 1 : 0}
            style={{ height }}
            testID="ObservationViews.myObservations"
            numColumns={layout === "grid" ? 2 : 1}
            renderItem={renderItem}
            ListEmptyComponent={renderEmptyState}
            ListHeaderComponent={
              <ObsListHeader setLayout={setLayout} layout={layout} />
            }
            ListFooterComponent={renderFooter}
            ItemSeparatorComponent={layout !== "grid" && renderItemSeparator}
            stickyHeaderIndices={[0]}
            bounces={false}
            initialNumToRender={10}
            onScroll={handleScroll}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.1}
          />
          <ObsListBottomSheet hasScrolled={hasScrolled} />
        </Animated.View>
      </View>
    </ViewWrapper>
  );
};

export default ObservationViews;
