// @flow

import { useNavigation } from "@react-navigation/native";
import fetchSearchResults from "api/search";
import {
  SearchBar,
  ViewWrapper
} from "components/SharedComponents";
import UserListItem from "components/SharedComponents/UserListItem";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useState
} from "react";
import { FlatList } from "react-native";
import { useAuthenticatedQuery } from "sharedHooks";

const ExploreUserSearch = ( ): Node => {
  const [userQuery, setUserQuery] = useState( "" );
  const navigation = useNavigation( );

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

  const onUserSelected = useCallback( async newTaxon => {
    navigation.navigate( "Explore", { taxon: newTaxon } );
  }, [navigation] );

  const renderFooter = ( ) => (
    <View className="pb-10" />
  );

  const renderItem = useCallback(
    ( { item } ) => (
      <UserListItem
        item={{ user: item }}
        count={item.observations_count}
        countText="X-Observations"
      />
    ),
    [onUserSelected]
  );

  return (
    <ViewWrapper className="flex-1">
      <SearchBar
        handleTextChange={setUserQuery}
        value={userQuery}
        testID="SearchUser"
        containerClass="my-5 mx-4"
      />
      <FlatList
        keyboardShouldPersistTaps="always"
        data={userList}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListFooterComponent={renderFooter}
      />
    </ViewWrapper>
  );
};

export default ExploreUserSearch;
