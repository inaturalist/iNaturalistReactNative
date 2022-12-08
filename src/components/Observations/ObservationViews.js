// @flow

import { useNavigation } from "@react-navigation/native";
import { searchObservations } from "api/observations";
import BottomSheet from "components/SharedComponents/BottomSheet";
import ViewWithFooter from "components/SharedComponents/ViewWithFooter";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useEffect, useMemo, useRef, useState
} from "react";
import { Animated, Dimensions } from "react-native";
import Observation from "realmModels/Observation";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useLocalObservations from "sharedHooks/useLocalObservations";
import useLoggedIn from "sharedHooks/useLoggedIn";
import useUploadStatus from "sharedHooks/useUploadStatus";

import EmptyList from "./EmptyList";
import GridItem from "./GridItem";
import InfiniteScrollFooter from "./InfiniteScrollFooter";
import LoginPrompt from "./LoginPrompt";
import ObsCard from "./ObsCard";
import ObsListHeader from "./ObsListHeader";
import UploadProgressBar from "./UploadProgressBar";
import UploadPrompt from "./UploadPrompt";

const { useRealm } = RealmContext;

const ObservationViews = ( ): Node => {
  const localObservations = useLocalObservations( );
  const realm = useRealm( );
  const [view, setView] = useState( "list" );
  const navigation = useNavigation( );
  const isLoggedIn = useLoggedIn( );
  const { observationList, unuploadedObsList } = localObservations;
  const numOfUnuploadedObs = unuploadedObsList?.length;

  const currentUser = realm.objects( "User" ).filtered( "signedIn == true" )[0];
  const [idBelow, setIdBelow] = useState( null );

  const params = {
    user_id: currentUser?.id,
    per_page: 10,
    fields: Observation.FIELDS
  };

  if ( idBelow ) {
    // $FlowIgnore
    params.id_below = idBelow;
  } else {
    // $FlowIgnore
    params.page = 1;
  }

  const {
    data: observations,
    isLoading
  } = useAuthenticatedQuery(
    ["searchObservations", idBelow],
    optsWithAuth => searchObservations( params, optsWithAuth ),
    {
      keepPreviousData: true
    }
  );

  const handleEndReached = oldestId => setIdBelow( oldestId );

  useEffect( ( ) => {
    if ( observations ) {
      Observation.updateLocalObservationsFromRemote( realm, observations );
    }
  }, [realm, observations] );

  // eslint-disable-next-line
  const [hasScrolled, setHasScrolled] = useState( false );

  const { diffClamp } = Animated;
  const headerHeight = 120;

  // basing collapsible sticky header code off the example in this article
  // https://medium.com/swlh/making-a-collapsible-sticky-header-animations-with-react-native-6ad7763875c3
  const scrollY = useRef( new Animated.Value( 0 ) );
  const scrollYClamped = diffClamp( scrollY.current, 0, headerHeight );

  const translateY = scrollYClamped.interpolate( {
    inputRange: [0, headerHeight],
    // $FlowIgnore
    outputRange: [0, -headerHeight]
  } );

  const translateYNumber = useRef();

  translateY.addListener( ( { value } ) => {
    translateYNumber.current = value;
  } );

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
  const { uploadInProgress, updateUploadStatus } = useUploadStatus( );
  const { allObsToUpload } = localObservations;

  const { height } = Dimensions.get( "screen" );
  const FOOTER_HEIGHT = 75;
  const HEADER_HEIGHT = 101;
  const BUTTON_ROW_HEIGHT = 50;

  // using flatListHeight to make the bottom sheet snap points work when the flatlist
  // has only a few items and isn't scrollable
  const flatListHeight = height - (
    HEADER_HEIGHT + FOOTER_HEIGHT + BUTTON_ROW_HEIGHT
  );

  const navToObsDetails = async observation => {
    navigation.navigate( "ObsDetails", { uuid: observation.uuid } );
  };

  const renderItem = ( { item } ) => (
    <ObsCard item={item} handlePress={navToObsDetails} />
  );

  const renderGridItem = ( { item, index } ) => (
    <GridItem
      item={item}
      index={index}
      handlePress={navToObsDetails}
    />
  );

  const renderEmptyState = ( ) => {
    if ( ( isLoggedIn === false )
      || ( !isLoading && observationList.length === 0 ) ) {
      return <EmptyList />;
    }
    return <View />;
  };

  const renderBottomSheet = ( ) => {
    if ( isLoggedIn === false ) {
      return (
        <BottomSheet hide={hasScrolled}>
          <LoginPrompt />
        </BottomSheet>
      );
    }
    if ( uploadInProgress ) {
      return (
        <UploadProgressBar
          unuploadedObsList={unuploadedObsList}
          allObsToUpload={allObsToUpload}
        />
      );
    }
    if ( numOfUnuploadedObs > 0 && isLoggedIn ) {
      return (
        <BottomSheet hide={hasScrolled}>
          <UploadPrompt
            uploadObservations={updateUploadStatus}
            numOfUnuploadedObs={numOfUnuploadedObs}
            updateUploadStatus={updateUploadStatus}
          />
        </BottomSheet>
      );
    }
    return null;
  };

  const renderFooter = ( ) => {
    if ( isLoggedIn === false ) { return <View />; }
    return (
      <InfiniteScrollFooter
        view={view}
        isLoading={isLoading}
      />
    );
  };

  const renderHeader = useMemo( ( ) => (
    <ObsListHeader
      numOfUnuploadedObs={numOfUnuploadedObs}
      isLoggedIn={isLoggedIn}
      translateY={translateY}
      setView={setView}
    />
  ), [isLoggedIn, translateY, numOfUnuploadedObs] );

  const renderItemSeparator = ( ) => <View className="border border-border" />;

  const onEndReached = ( ) => {
    if ( !isLoading ) {
      handleEndReached( observationList[observationList.length - 1].id );
    }
  };

  return (
    <ViewWithFooter>
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
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ItemSeparatorComponent={view !== "grid" && renderItemSeparator}
        stickyHeaderIndices={[0]}
        bounces={false}
        initialNumToRender={10}
        onScroll={handleScroll}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
      />
      {numOfUnuploadedObs > 0 && renderBottomSheet( )}
    </ViewWithFooter>
  );
};

export default ObservationViews;
