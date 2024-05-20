// @flow

import { FlashList } from "@shopify/flash-list";
import { searchProjects } from "api/projects";
import {
  Heading4,
  INatIconButton,
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

type Props = {
  closeModal: Function,
  updateProject: Function
};

const ExploreProjectSearch = ( { closeModal, updateProject }: Props ): Node => {
  const [userQuery, setUserQuery] = useState( "" );
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
    updateProject( project );
    closeModal();
  }, [updateProject, closeModal] );

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
      <View className="flex-row justify-center p-5 bg-white">
        <INatIconButton
          testID="ExploreTaxonSearch.close"
          size={18}
          icon="back"
          className="absolute top-2 left-3 z-10"
          onPress={( ) => closeModal()}
          accessibilityLabel={t( "SEARCH-PROJECTS" )}
        />
        <Heading4>{t( "SEARCH-PROJECTS" )}</Heading4>
      </View>
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
