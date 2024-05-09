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
import { getShadowForColor } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadowForColor( colors.darkGray, {
  offsetHeight: 4
} );

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
        className="mx-4 my-3"
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
      <View
        className="bg-white px-6 pt-2 pb-8"
        style={DROP_SHADOW}
      >
        <SearchBar
          handleTextChange={setUserQuery}
          value={userQuery}
          testID="SearchUser"
        />
      </View>

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
