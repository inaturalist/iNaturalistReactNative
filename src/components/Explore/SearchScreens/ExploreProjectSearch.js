// @flow

import { useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { searchProjects } from "api/projects";
import {
  SearchBar,
  ViewWrapper
} from "components/SharedComponents";
import ProjectListItem from "components/SharedComponents/ProjectListItem";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useState
} from "react";
import { useAuthenticatedQuery } from "sharedHooks";

const ExploreProjectSearch = ( ): Node => {
  const [userQuery, setUserQuery] = useState( "" );
  const navigation = useNavigation( );

  const { data: projects, isLoading } = useAuthenticatedQuery(
    ["searchProjects", { q: userQuery }],
    optsWithAuth => searchProjects( { q: userQuery }, optsWithAuth )
  );

  console.log( "isLoading :>> ", isLoading );

  const onUserSelected = useCallback( async project => {
    if ( !project.id ) {
      // If both of those are missing, we can not query by user
      // TODO: user facing error message
      return;
    }
    console.log( "project :>> ", project );
    navigation.navigate( "Explore", { project } );
  }, [navigation] );

  const renderItem = useCallback(
    ( { item } ) => (
      <Pressable
        onPress={() => onUserSelected( item )}
        accessibilityRole="button"
        // TODO: accessibilityLabel={t( "Something like ?" )}
        accessibilityState={{ disabled: false }}
      >
        <ProjectListItem
          item={item}
        />
      </Pressable>
    ),
    [onUserSelected]
  );

  const renderItemSeparator = () => (
    <View className="border-b border-lightGray" />
  );

  return (
    <ViewWrapper className="flex-1">
      <SearchBar
        handleTextChange={setUserQuery}
        value={userQuery}
        testID="SearchUser"
        containerClass="my-5 mx-4"
      />
      <FlashList
        data={projects}
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

export default ExploreProjectSearch;
