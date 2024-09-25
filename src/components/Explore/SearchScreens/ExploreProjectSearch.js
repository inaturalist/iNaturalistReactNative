// @flow

import { searchProjects } from "api/projects";
import {
  CustomFlashList,
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
import { getShadow } from "styles/global";

import EmptySearchResults from "./EmptySearchResults";
import ExploreSearchHeader from "./ExploreSearchHeader";

const DROP_SHADOW = getShadow( {
  offsetHeight: 4
} );

type Props = {
  closeModal: Function,
  updateProject: Function
};

const ExploreProjectSearch = ( { closeModal, updateProject }: Props ): Node => {
  const [projectQuery, setProjectQuery] = useState( "" );
  const { t } = useTranslation();

  const { data, isLoading, refetch } = useAuthenticatedQuery(
    ["searchProjects", projectQuery],
    optsWithAuth => searchProjects( { q: projectQuery }, optsWithAuth )
  );

  const projects = data.results;

  const onProjectSelected = useCallback( async project => {
    if ( !project.id ) {
      // If this is missing, we can not query by project
      // TODO: user facing error message
      return;
    }
    updateProject( project );
    closeModal();
  }, [updateProject, closeModal] );

  const resetProject = useCallback(
    ( ) => {
      updateProject( null );
      closeModal();
    },
    [updateProject, closeModal]
  );

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

  const renderEmptyList = ( ) => (
    <EmptySearchResults
      isLoading={isLoading}
      searchQuery={projectQuery}
      refetch={refetch}
    />
  );

  return (
    <ViewWrapper>
      <ExploreSearchHeader
        closeModal={closeModal}
        headerText={t( "SEARCH-PROJECTS" )}
        resetFilters={resetProject}
        testID="ExploreProjectSearch.close"
      />
      <View
        className="bg-white px-6 pt-2 pb-8"
        style={DROP_SHADOW}
      >
        <SearchBar
          handleTextChange={setProjectQuery}
          value={projectQuery}
          testID="SearchProject"
        />
      </View>
      <CustomFlashList
        data={projects}
        estimatedItemSize={100}
        testID="SearchProjectList"
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyList}
        ListHeaderComponent={renderItemSeparator}
        ItemSeparatorComponent={renderItemSeparator}
      />
    </ViewWrapper>
  );
};

export default ExploreProjectSearch;
