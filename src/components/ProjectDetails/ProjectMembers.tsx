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
import React, { useEffect, useMemo } from "react";
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

  const footerComponent = useMemo( ( ) => (
    <InfiniteScrollLoadingWheel
      hideLoadingWheel={!isFetchingNextPage}
      layout="list"
      isConnected={isConnected}
    />
  ), [isConnected, isFetchingNextPage] );

  useEffect( ( ) => {
    navigation.setOptions( headerOptions );
  }, [navigation, headerOptions] );

  const emptyComponent = useMemo( ( ) => (
    <ActivityIndicator size={50} />
  ), [] );

  return (
    <View className="flex-1 bg-white">
      <UserList
        users={projectMembers}
        onEndReached={fetchNextPage}
        refreshing={isFetchingNextPage}
        ListEmptyComponent={emptyComponent}
        ListFooterComponent={footerComponent}
      />
    </View>
  );
};

export default ProjectMembers;
