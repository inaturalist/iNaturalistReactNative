// @flow

import { useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { searchProjects } from "api/projects";
import {
  ProjectListItem,
  SearchBar,
  ViewWrapper
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useState
} from "react";
import { useAuthenticatedQuery, useTranslation } from "sharedHooks";

const ExploreProjectSearch = ( ): Node => {
  const [userQuery, setUserQuery] = useState( "" );
  const navigation = useNavigation( );
  const { t } = useTranslation();

  const { data: projects } = useAuthenticatedQuery(
    ["searchProjects", userQuery],
    optsWithAuth => searchProjects( { q: userQuery }, optsWithAuth )
  );

  const onProjectSelected = useCallback( async project => {
    if ( !project.id ) {
      // If this is missing, we can not query by project
      // TODO: user facing error message
      return;
    }
    console.log( "project :>> ", project );
    navigation.navigate( "Explore", { project } );
  }, [navigation] );

  const renderItem = useCallback(
    ( { item } ) => (
      <Pressable
        onPress={() => onProjectSelected( item )}
        accessibilityRole="button"
        accessibilityLabel={t( "Change-project" )}
        accessibilityState={{ disabled: false }}
      >
        <ProjectListItem
          item={item}
        />
      </Pressable>
    ),
    [onProjectSelected, t]
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
