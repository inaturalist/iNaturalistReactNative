import {
  useNetInfo,
} from "@react-native-community/netinfo";
import { useNavigation, useRoute } from "@react-navigation/native";
import { fetchUsers } from "api/users";
import {
  Body1,
  InfiniteScrollLoadingWheel,
} from "components/SharedComponents";
import { ScreenShell } from "components/SharedComponents/ViewWrapper";
import { View } from "components/styledComponents";
import UserList from "components/UserList/UserList";
import type { TabStackScreenProps } from "navigation/types";
import React, {
  useEffect,
  useMemo,
} from "react";
import User from "realmModels/User";
import {
  useCurrentUser,
  useInfiniteUserScroll,
  useTranslation,
} from "sharedHooks";

const FollowingList = ( ) => {
  const { isConnected } = useNetInfo( );
  const currentUser = useCurrentUser( );
  const navigation = useNavigation<TabStackScreenProps<"FollowingList">["navigation"]>( );
  const { params } = useRoute<TabStackScreenProps<"FollowingList">["route"]>( );
  const { userId, userLogin } = params;
  const { t } = useTranslation( );

  const usersFollowedByQueryKey = ["fetchUsers", "following", userLogin];

  const {
    data: following,
    // fetchNextPage,
    isFetching,
    totalResults,
  } = useInfiniteUserScroll(
    usersFollowedByQueryKey,
    fetchUsers,
    [],
    {
      followed_by: userId,
      fields: User.LIMITED_FIELDS,
    },
    {
      enabled: !!currentUser,
    },
  );

  const followingHeaderOptions = useMemo( ( ) => ( {
    headerTitle: userLogin,
    headerSubtitle: t( "FOLLOWING-X-PEOPLE", {
      count: totalResults,
    } ),
  } ), [totalResults, t, userLogin] );

  useEffect( ( ) => {
    if ( totalResults !== undefined && totalResults !== null ) {
      navigation.setOptions( followingHeaderOptions );
    }
  }, [followingHeaderOptions, navigation, totalResults] );

  if ( !following ) {
    return null;
  }

  return (
    <ScreenShell>
      <View className="border-b border-lightGray mt-5" />
      <UserList
        users={following}
        // TODO: need API v2 to support pagination for infinite scroll
        // onEndReached={fetchNextPage}
        ListEmptyComponent={isFetching
          ? (
            <InfiniteScrollLoadingWheel
              hideLoadingWheel={false}
              isConnected={isConnected}
            />
          )
          : (
            <View className="self-center mt-5 p-4">
              <Body1 className="align-center text-center">
                {t( "This-user-is-not-following-anyone" )}
              </Body1>
            </View>
          )}
      />
    </ScreenShell>
  );
};

export default FollowingList;
