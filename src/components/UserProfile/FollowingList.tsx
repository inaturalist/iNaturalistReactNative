import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useNavigation, useRoute } from "@react-navigation/native";
import { fetchUsers } from "api/users";
import {
  InfiniteScrollLoadingWheel,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import UserList from "components/UserList/UserList";
import React, {
  useCallback,
  useEffect,
  useMemo
} from "react";
import User from "realmModels/User";
import {
  useCurrentUser,
  useInfiniteUserScroll,
  useTranslation
} from "sharedHooks";

const FollowingList = ( ) => {
  const { isConnected } = useNetInfo( );
  const currentUser = useCurrentUser( );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { user } = params;
  const { t } = useTranslation( );

  const userId = user?.id;

  const usersFollowedByQueryKey = ["fetchUsers", "following", user?.login];

  const {
    data: following,
    // fetchNextPage,
    totalResults
  } = useInfiniteUserScroll(
    usersFollowedByQueryKey,
    fetchUsers,
    [],
    {
      followed_by: userId,
      fields: User.LIMITED_FIELDS
    },
    {
      enabled: !!currentUser
    }
  );

  const followingHeaderOptions = useMemo( ( ) => ( {
    headerTitle: user?.login,
    headerSubtitle: t( "FOLLOWING-X-PEOPLE", {
      count: totalResults
    } )
  } ), [totalResults, t, user] );

  useEffect( ( ) => {
    if ( totalResults ) {
      navigation.setOptions( followingHeaderOptions );
    }
  }, [followingHeaderOptions, navigation, totalResults] );

  const renderFooter = useCallback( ( ) => (
    <InfiniteScrollLoadingWheel
      hideLoadingWheel={false}
      isConnected={isConnected}
    />
  ), [isConnected] );

  if ( !following ) {
    return null;
  }

  return (
    <ViewWrapper>
      <View className="border-b border-lightGray mt-5" />
      <UserList
        users={following}
        // TODO: need API v2 to support pagination for infinite scroll
        // onEndReached={fetchNextPage}
        ListFooterComponent={renderFooter}
      />
    </ViewWrapper>
  );
};

export default FollowingList;
