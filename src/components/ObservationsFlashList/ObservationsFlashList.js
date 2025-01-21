// @flow
import { useNavigation } from "@react-navigation/native";
import MyObservationsEmpty from "components/MyObservations/MyObservationsEmpty";
import {
  ActivityIndicator,
  Body3,
  CustomFlashList,
  CustomRefreshControl,
  InfiniteScrollLoadingWheel
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts.ts";
import type { Node } from "react";
import React, {
  forwardRef,
  useCallback,
  useMemo,
  useState
} from "react";
import { Animated } from "react-native";
import RealmObservation from "realmModels/Observation";
import {
  useCurrentUser,
  useFontScale,
  useGridLayout,
  useNavigateToObsEdit,
  useTranslation
} from "sharedHooks";
import useStore from "stores/useStore";

import ObsPressable from "./ObsPressable";

const { useRealm } = RealmContext;

const AnimatedFlashList = Animated.createAnimatedComponent( CustomFlashList );

type Props = {
  contentContainerStyle?: Object,
  data: Array<Object>,
  dataCanBeFetched?: boolean,
  explore: boolean,
  handlePullToRefresh: Function,
  handleIndividualUploadPress: Function,
  hideLoadingWheel?: boolean,
  hideMetadata?: boolean,
  isConnected: boolean,
  isFetchingNextPage?: boolean,
  layout: "list" | "grid",
  obsListKey: string,
  onEndReached: Function,
  onLayout?: Function,
  onScroll?: Function,
  renderHeader?: Function,
  showNoResults?: boolean,
  showObservationsEmptyScreen?: boolean,
  testID: string
};

const ObservationsFlashList: Function = forwardRef( ( {
  contentContainerStyle: contentContainerStyleProp = {},
  data,
  dataCanBeFetched,
  explore,
  handlePullToRefresh,
  handleIndividualUploadPress,
  hideLoadingWheel,
  hideMetadata,
  isConnected,
  isFetchingNextPage,
  layout,
  obsListKey = "unknown",
  onEndReached,
  onLayout,
  onScroll,
  renderHeader,
  showNoResults,
  showObservationsEmptyScreen,
  testID
}: Props, ref ): Node => {
  const realm = useRealm( );
  const { isLargeFontScale } = useFontScale( );
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
    estimatedGridItemSize,
    flashListStyle,
    gridItemStyle,
    gridItemWidth,
    numColumns
  } = useGridLayout( layout );
  const { t } = useTranslation( );

  const renderItem = useCallback( ( { item: observation } ) => {
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
      if ( obsNeedsSync ) {
        navigateToObsEdit( observation );
      } else {
        // Uniquely identify the list this observation appears in so we can ensure
        // ObsDetails doesn't get pushed onto the stack twice after multiple taps
        navigation.navigate( {
          key: `Obs-${obsListKey}-${uuid}`,
          name: "ObsDetails",
          params: { uuid }
        } );
      }
    };

    return (
      <ObsPressable
        currentUser={currentUser}
        explore={explore}
        gridItemStyle={gridItemStyle}
        hideMetadata={hideMetadata}
        isLargeFontScale={isLargeFontScale}
        layout={layout}
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
    isLargeFontScale,
    layout,
    navigateToObsEdit,
    navigation,
    obsListKey,
    realm,
    totalUploadProgress,
    uploadQueue
  ] );

  const renderItemSeparator = useCallback( ( ) => {
    if ( layout === "grid" ) {
      return null;
    }
    return <View className="border-b border-lightGray" />;
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
    layout
  ] );

  const contentContainerStyle = useMemo( ( ) => {
    if ( layout === "list" ) { return contentContainerStyleProp; }
    return {
      ...contentContainerStyleProp,
      ...flashListStyle
    };
  }, [
    contentContainerStyleProp,
    flashListStyle,
    layout
  ] );

  const renderEmptyComponent = useCallback( ( ) => {
    const showEmptyScreen = showObservationsEmptyScreen
      ? <MyObservationsEmpty isFetchingNextPage={isFetchingNextPage} />
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
    isFetchingNextPage,
    showObservationsEmptyScreen,
    showNoResults,
    t
  ] );

  const estimatedItemSize = layout === "grid"
    ? estimatedGridItemSize
    : 98;

  const extraData = {
    gridItemWidth,
    numColumns
  };

  // only used id as a fallback key because after upload
  // react thinks we've rendered a second item w/ a duplicate key
  const keyExtractor = item => item.uuid || item.id;

  const onMomentumScrollEnd = ( ) => {
    if ( dataCanBeFetched ) {
      onEndReached( );
    }
  };

  const refreshControl = (
    <CustomRefreshControl
      accessibilityLabel={t( "Pull-to-refresh-and-sync-observations" )}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );

  return (
    <AnimatedFlashList
      ItemSeparatorComponent={renderItemSeparator}
      ListEmptyComponent={renderEmptyComponent}
      ListFooterComponent={renderFooter}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={contentContainerStyle}
      data={data}
      estimatedItemSize={estimatedItemSize}
      extraData={extraData}
      ref={ref}
      key={numColumns}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      onLayout={onLayout}
      onMomentumScrollEnd={onMomentumScrollEnd}
      onScroll={onScroll}
      renderItem={renderItem}
      refreshControl={refreshControl}
      testID={testID}
    />
  );
} );

export default ObservationsFlashList;
