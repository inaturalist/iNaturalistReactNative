// @flow

import { useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import fetchSearchResults from "api/search";
import {
  SearchBar,
  ViewWrapper
} from "components/SharedComponents";
import UserListItem from "components/SharedComponents/UserListItem";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useState
} from "react";
import { useTheme } from "react-native-paper";
import { useAuthenticatedQuery, useTranslation } from "sharedHooks";
import { getShadowStyle } from "styles/global";

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 4,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 5
} );

const ExploreUserSearch = ( ): Node => {
  const theme = useTheme();
  const [userQuery, setUserQuery] = useState( "" );
  const navigation = useNavigation( );
  const { t } = useTranslation();

  // TODO: replace this with infinite scroll like ExploreFlashList
  const { data: userList } = useAuthenticatedQuery(
    ["fetchSearchResults", userQuery],
    optsWithAuth => fetchSearchResults(
      {
        q: userQuery,
        sources: "users",
        fields: "user.id,user.login,user.icon_url,user.observations_count"
      },
      optsWithAuth
    )
  );

  const onUserSelected = useCallback( async user => {
    if ( !user.id && !user.login ) {
      // If both of those are missing, we can not query by user
      // TODO: user facing error message
      return;
    }
    navigation.navigate( "Explore", { user } );
  }, [navigation] );

  const renderItem = useCallback(
    ( { item } ) => (
      <Pressable
        onPress={() => onUserSelected( item )}
        accessibilityRole="button"
        accessibilityLabel={t( "Change-user" )}
        accessibilityState={{ disabled: false }}
      >
        <UserListItem
          item={{ user: item }}
          count={item.observations_count}
          countText="X-Observations"
        />
      </Pressable>
    ),
    [onUserSelected, t]
  );

  // TODO: pagination like in ExploreFlashList ?

  const renderItemSeparator = () => (
    <View className="border-b border-lightGray" />
  );

  return (
    <ViewWrapper className="flex-1">
      <View
        className="bg-white px-6 pt-2 pb-8"
        style={getShadow( theme.colors.primary )}
      >
        <SearchBar
          handleTextChange={setUserQuery}
          value={userQuery}
          testID="SearchUser"
        />
      </View>
      <FlashList
        data={userList}
        initialNumToRender={5}
        estimatedItemSize={100}
        testID="SearchUserList"
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderItemSeparator}
        ItemSeparatorComponent={renderItemSeparator}
        accessible
      />
    </ViewWrapper>
  );
};

export default ExploreUserSearch;
