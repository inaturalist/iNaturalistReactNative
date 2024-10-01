import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useNavigation, useRoute } from "@react-navigation/native";
import { fetchProjectMembers } from "api/projects";
import {
  ActivityIndicator, CustomFlashList, InfiniteScrollLoadingWheel, UserListItem
} from "components/SharedComponents";
import { SafeAreaView, View } from "components/styledComponents";
import React, { useCallback, useEffect, useMemo } from "react";
import User from "realmModels/User.ts";
import { useInfiniteScroll, useTranslation } from "sharedHooks";

const CONTAINER_STYLE = {
  backgroundColor: "white"
};

const ProjectMembers = ( ) => {
  const { isConnected } = useNetInfo( );
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const { params } = useRoute( );
  const { id, title } = params;

  const queryKey = ["projectMembers", "fetchProjectMembers", id];
  const queryParams = {
    id,
    order_by: "login",
    fields: {
      user: User.LIMITED_FIELDS
    }
  };

  const {
    data: projectMembers,
    fetchNextPage,
    isFetchingNextPage,
    totalResults: totalMembers
  } = useInfiniteScroll(
    queryKey,
    fetchProjectMembers,
    queryParams,
    {
      enabled: true
    }
  );

  const headerOptions = useMemo( ( ) => ( {
    headerTitle: title,
    headerSubtitle: t( "X-MEMBERS", {
      count: totalMembers || 0
    } )
  } ), [title, totalMembers, t] );

  const renderFooter = useCallback( ( ) => (
    <InfiniteScrollLoadingWheel
      hideLoadingWheel={!isFetchingNextPage}
      layout="list"
      isConnected={isConnected}
    />
  ), [isConnected, isFetchingNextPage] );

  useEffect( ( ) => {
    navigation.setOptions( headerOptions );
  }, [navigation, headerOptions] );

  const renderItem = ( { item } ) => (
    <UserListItem
      item={item}
      countText={t( "X-Observations", {
        count: item.observations_count
      } )}
    />
  );

  const renderItemSeparator = ( ) => <View className="border-b border-lightGray" />;

  const renderEmptyComponent = useCallback( ( ) => (
    <ActivityIndicator size={50} />
  ), [] );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <CustomFlashList
        ItemSeparatorComponent={renderItemSeparator}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        contentContainerStyle={CONTAINER_STYLE}
        data={projectMembers}
        estimatedItemSize={98}
        keyExtractor={item => item.user.id}
        onEndReached={fetchNextPage}
        refreshing={isFetchingNextPage}
        renderItem={renderItem}
        testID="ProjectMembers.CustomFlashList"
      />
    </SafeAreaView>
  );
};

export default ProjectMembers;
