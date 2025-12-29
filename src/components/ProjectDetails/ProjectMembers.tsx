import {
  useNetInfo,
} from "@react-native-community/netinfo";
import { useNavigation, useRoute } from "@react-navigation/native";
import { fetchProjectMembers } from "api/projects";
import {
  ActivityIndicator, InfiniteScrollLoadingWheel,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import UserList from "components/UserList/UserList";
import React, { useCallback, useEffect, useMemo } from "react";
import User from "realmModels/User";
import { useInfiniteScroll, useTranslation } from "sharedHooks";

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
      user: User.LIMITED_FIELDS,
    },
  };

  const {
    data: projectMembers,
    fetchNextPage,
    isFetchingNextPage,
    totalResults: totalMembers,
  } = useInfiniteScroll(
    queryKey,
    fetchProjectMembers,
    queryParams,
    {
      enabled: true,
    },
  );

  const headerOptions = useMemo( ( ) => ( {
    headerTitle: title,
    headerSubtitle: t( "X-MEMBERS", {
      count: totalMembers || 0,
    } ),
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

  const renderEmptyComponent = useCallback( ( ) => (
    <ActivityIndicator size={50} />
  ), [] );

  return (
    <View className="flex-1 bg-white">
      <UserList
        users={projectMembers}
        onEndReached={fetchNextPage}
        refreshing={isFetchingNextPage}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

export default ProjectMembers;
