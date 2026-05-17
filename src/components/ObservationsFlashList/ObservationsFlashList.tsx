import { useNavigation } from "@react-navigation/native";
import type { FlashListRef } from "@shopify/flash-list";
import {
  ActivityIndicator,
  Body3,
  CustomFlashList,
  CustomRefreshControl,
  InfiniteScrollLoadingWheel,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import React, {
  useCallback,
  useMemo,
  useState,
} from "react";
import type {
  LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle,
} from "react-native";
import { Animated } from "react-native";
import RealmObservation from "realmModels/Observation";
import {
  useCurrentUser,
  useGridLayout,
  useLayoutPrefs,
  useNavigateToObsEdit,
  useTranslation,
} from "sharedHooks";
import useStore from "stores/useStore";

import ObsPressable from "./ObsPressable";

const { useRealm } = RealmContext;

const AnimatedFlashList = Animated.createAnimatedComponent( CustomFlashList );

// unlike the other FlashList Component props, Separator does _not_ accept an Element
const ItemSeparator = () => <View className="border-b border-lightGray" />;

interface Props {
  contentContainerStyle?: StyleProp<ViewStyle>;
  // TODO: type data / observations
  data: unknown[];
  dataCanBeFetched?: boolean;
  fetchFromLastObservation?: ( observationId?: number ) => void;
  explore: boolean;
  handlePullToRefresh: () => void;
  handleIndividualUploadPress: ( observationUuid: string ) => void;
  hideLoadingWheel?: boolean;
  hideMetadata?: boolean;
  hideObsUploadStatus?: boolean;
  hideObsStatus?: boolean;
  isSimpleObsStatus?: boolean;
  hideRGLabel?: boolean;
  isConnected: boolean;
  layout: "list" | "grid";
  obsListKey: string;
  onEndReached: () => void;
  onLayout?: ( event: LayoutChangeEvent ) => void;
  onScroll?: ( event: NativeSyntheticEvent<NativeScrollEvent> ) => void;
  // this ref is being forwarded to the underlying CustomFlashList and used as an imperative handle
  // so the parent can control behavior like scrolling; it's typed as Function because there's not
  // a good way to capture this otherwise with Flow.
  // TODO: type data / observations
  ref?: React.Ref<FlashListRef<unknown>>;
  renderHeader?: () => React.ReactElement | null;
  showNoResults?: boolean;
  showObservationsEmptyScreen?: boolean;
  testID: string;
}

const ObservationsFlashList = ( {
  contentContainerStyle: contentContainerStyleProp = {},
  data,
  dataCanBeFetched,
  explore,
  fetchFromLastObservation,
  handlePullToRefresh,
  handleIndividualUploadPress,
  hideLoadingWheel,
  hideMetadata,
  hideObsUploadStatus,
  hideObsStatus,
  isSimpleObsStatus,
  hideRGLabel,
  isConnected,
  layout,
  obsListKey = "unknown",
  onEndReached,
  onLayout,
  onScroll,
  ref,
  renderHeader,
  showNoResults,
  showObservationsEmptyScreen,
  testID,
}: Props ) => {
  const {
    isDefaultMode,
  } = useLayoutPrefs( );
  const realm = useRealm( );
  const currentUser = useCurrentUser( );
  const navigation = useNavigation( );
  const navigateToObsEdit = useNavigateToObsEdit( );
  const uploadQueue = useStore( state => state.uploadQueue );
  const totalUploadProgress = useStore( state => state.totalUploadProgress );
  const [refreshing, setRefreshing] = useState( false );

  const onRefresh = async ( ) => {
    setRefreshing( true );
    await handlePullToRefresh( );
    setRefreshing( false );
  };

  const {
    flashListStyle,
    gridItemStyle,
    gridItemWidth,
    numColumns,
  } = useGridLayout( layout );
  const { t } = useTranslation( );

  // TODO: type data / observation
  const renderItem = useCallback( ( { item: observation } ) => {
    // Empty box
    if ( observation.empty ) {
      return (
        <View
          className="rounded-[15px] border-dotted border-4 border-lightGray"
          style={gridItemStyle}
        />
      );
    }
    const { uuid } = observation;
    const onUploadButtonPress = ( ) => handleIndividualUploadPress( uuid );
    // 20240529 amanda - filtering in realm is a fast way to look up sync status
    const obsNeedsSync = RealmObservation.isUnsyncedObservation( realm, observation );
    const obsUploadState = totalUploadProgress.find( o => o.uuid === uuid );
    const uploadProgress = obsNeedsSync
      ? obsUploadState?.totalProgress || 0
      : obsUploadState?.totalProgress;

    const queued = uploadQueue.includes( uuid );

    const onItemPress = ( ) => {
      if ( obsNeedsSync && !isDefaultMode ) {
        const realmObservation = realm.objectForPrimaryKey( "Observation", observation.uuid );
        navigateToObsEdit( realmObservation );
      } else {
        // Uniquely identify the list this observation appears in so we can ensure
        // ObsDetails doesn't get pushed onto the stack twice after multiple taps
        navigation.navigate( {
          key: `Obs-${obsListKey}-${uuid}`,
          name: "ObsDetails",
          params: { uuid },
        } );
      }
    };

    // Add a unique key to ensure component recreation
    // so images don't get recycled and show on the wrong taxon
    const itemKey = `uuid-${uuid}`;

    return (
      <ObsPressable
        currentUser={currentUser}
        explore={explore}
        gridItemStyle={gridItemStyle}
        hideMetadata={hideMetadata}
        hideObsUploadStatus={hideObsUploadStatus}
        hideObsStatus={hideObsStatus}
        isSimpleObsStatus={isSimpleObsStatus}
        hideRGLabel={hideRGLabel}
        layout={layout}
        key={itemKey}
        observation={observation}
        onItemPress={onItemPress}
        onUploadButtonPress={onUploadButtonPress}
        queued={queued}
        unsynced={obsNeedsSync}
        uploadProgress={uploadProgress}
      />
    );
  }, [
    currentUser,
    explore,
    gridItemStyle,
    handleIndividualUploadPress,
    hideMetadata,
    hideObsUploadStatus,
    hideObsStatus,
    isSimpleObsStatus,
    hideRGLabel,
    isDefaultMode,
    layout,
    navigateToObsEdit,
    navigation,
    obsListKey,
    realm,
    totalUploadProgress,
    uploadQueue,
  ] );

  const itemSeparatorComponent = useMemo( ( ) => {
    if ( layout === "grid" ) {
      return null;
    }
    return ItemSeparator;
  }, [layout] );

  const renderFooter = useCallback( ( ) => (
    <InfiniteScrollLoadingWheel
      explore={explore}
      hideLoadingWheel={hideLoadingWheel}
      isConnected={isConnected}
      layout={layout}
    />
  ), [
    explore,
    hideLoadingWheel,
    isConnected,
    layout,
  ] );

  const contentContainerStyle = useMemo( ( ) => {
    if ( layout === "list" ) { return contentContainerStyleProp; }
    return {
      ...flashListStyle,
      ...contentContainerStyleProp,
    };
  }, [
    contentContainerStyleProp,
    flashListStyle,
    layout,
  ] );

  const renderEmptyComponent = useCallback( ( ) => {
    const showEmptyScreen = showObservationsEmptyScreen
      ? null
      : (
        <Body3 className="self-center mt-[150px]">
          {t( "No-results-found-try-different-search" )}
        </Body3>
      );

    return showNoResults
      ? showEmptyScreen
      : (
        <View className="self-center mt-[150px]">
          <ActivityIndicator size={50} testID="ObservationsFlashList.loading" />
        </View>
      );
  }, [
    showObservationsEmptyScreen,
    showNoResults,
    t,
  ] );

  const extraData = {
    gridItemWidth,
    numColumns,
  };

  // only used id as a fallback key because after upload
  // react thinks we've rendered a second item w/ a duplicate key
  const keyExtractor = item => item.uuid || item.id;

  const onMomentumScrollEnd = useCallback( ( ) => {
    if ( dataCanBeFetched ) {
      onEndReached( );
    }
  }, [dataCanBeFetched, onEndReached] );

  const handleEndReached = useCallback( ( ) => {
    if ( !dataCanBeFetched || explore ) return;

    if ( fetchFromLastObservation && data.length > 0 ) {
      const lastObservation = data[data.length - 1];
      const lastId = lastObservation?.id;
      if ( lastId && !lastObservation?.empty ) {
        fetchFromLastObservation( lastId );
        return;
      }
    }

    onEndReached( );
  }, [dataCanBeFetched, fetchFromLastObservation, data, onEndReached, explore] );

  const refreshControl = (
    <CustomRefreshControl
      accessibilityLabel={t( "Pull-to-refresh-and-sync-observations" )}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );

  return (
    <AnimatedFlashList
      ItemSeparatorComponent={itemSeparatorComponent}
      ListEmptyComponent={renderEmptyComponent}
      ListFooterComponent={renderFooter}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={contentContainerStyle}
      data={data}
      extraData={extraData}
      ref={ref}
      key={numColumns}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      onLayout={onLayout}
      onEndReached={handleEndReached}
      onMomentumScrollEnd={onMomentumScrollEnd}
      onScroll={onScroll}
      renderItem={renderItem}
      refreshControl={refreshControl}
      testID={testID}
    />
  );
};

export default ObservationsFlashList;
