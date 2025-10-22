import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useNavigation, useRoute } from "@react-navigation/native";
import { fetchUsers } from "api/users";
import {
  Body1,
  InfiniteScrollLoadingWheel,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import UserList from "components/UserList/UserList";
import React, {
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
    isFetching,
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
    if ( totalResults !== undefined && totalResults !== null ) {
      navigation.setOptions( followersHeaderOptions );
    }
  }, [followersHeaderOptions, navigation, totalResults] );

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
        ListEmptyComponent={(
          isFetching
            ? (
              <InfiniteScrollLoadingWheel
                hideLoadingWheel={false}
                isConnected={isConnected}
              />
            )
            : (
              <View className="self-center mt-5 p-4">
                <Body1 className="align-center text-center">
                  {t( "This-user-has-no-followers" )}
                </Body1>
              </View>
            )
        )}
      />
    </ViewWrapper>
  );
};

export default FollowersList;
