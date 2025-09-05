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

const FollowersList = ( ) => {
  const { isConnected } = useNetInfo( );
  const currentUser = useCurrentUser( );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { user } = params;
  const { t } = useTranslation( );

  const userId = user?.id;

  const usersFollowingQueryKey = ["fetchUsers", "followers", user?.login];

  const {
    data: followers,
    // fetchNextPage,
    totalResults
  } = useInfiniteUserScroll(
    usersFollowingQueryKey,
    fetchUsers,
    [],
    {
      following: userId,
      fields: User.LIMITED_FIELDS
    },
    {
      enabled: !!currentUser
    }
  );

  const followersHeaderOptions = useMemo( ( ) => ( {
    headerTitle: user?.login,
    headerSubtitle: t( "X-FOLLOWERS", {
      count: totalResults
    } )
  } ), [totalResults, t, user] );

  useEffect( ( ) => {
    if ( totalResults ) {
      navigation.setOptions( followersHeaderOptions );
    }
  }, [followersHeaderOptions, navigation, totalResults] );

  const renderFooter = useCallback( ( ) => (
    <InfiniteScrollLoadingWheel
      hideLoadingWheel={false}
      isConnected={isConnected}
    />
  ), [isConnected] );

  if ( !followers ) {
    return null;
  }

  return (
    <ViewWrapper>
      <View className="border-b border-lightGray mt-5" />
      <UserList
        users={followers}
        // TODO: need API v2 to support pagination for infinite scroll
        // onEndReached={fetchNextPage}
        ListFooterComponent={renderFooter}
      />
    </ViewWrapper>
  );
};

export default FollowersList;
