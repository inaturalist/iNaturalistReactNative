import { PROJECT_SUMMARY_FIELDS } from "api/fields";
import { search } from "api/search";
import type { ApiProjectSummary } from "api/types";
import ProjectList from "components/ProjectList/ProjectList";
import {
  SearchBar,
  SearchHeader,
  ViewWrapper,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, {
  useCallback,
  useState,
} from "react";
import { useInfiniteScroll, useTranslation } from "sharedHooks";
import { getShadow } from "styles/global";

import EmptySearchResults from "./EmptySearchResults";

const DROP_SHADOW = getShadow( {
  offsetHeight: 4,
} );

interface Props {
  closeModal: ( ) => void;
  updateProject: ( project: ApiProjectSummary ) => void;
}

const ExploreProjectSearch = ( { closeModal, updateProject }: Props ) => {
  const [projectQuery, setProjectQuery] = useState( "" );
  const { t } = useTranslation();

  // TODO fix these types if/when we ever figure out how to type react query
  // wrappers like useInfiniteScroll
  const {
    data,
    isFetching,
    fetchNextPage,
    refetch,
  } = useInfiniteScroll(
    ["ExploreProjectSearch", projectQuery],
    search,
    {
      q: projectQuery,
      sources: "projects",
      fields: {
        project: PROJECT_SUMMARY_FIELDS,
      },
    },
  );

  const projects = data.map( ( r: { project: ApiProjectSummary } ) => r.project );

  const onProjectSelected = useCallback( async ( project: ApiProjectSummary ) => {
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
    [updateProject, closeModal],
  );

  return (
    <ViewWrapper>
      <SearchHeader
        onClose={closeModal}
        headerText={t( "SEARCH-PROJECTS" )}
        onReset={resetProject}
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
      <ProjectList
        projects={projects}
        ListFooterComponent={<View className="h-[336px]" />}
        ListEmptyComponent={(
          <EmptySearchResults
            isLoading={isFetching}
            searchQuery={projectQuery}
            refetch={refetch}
          />
        )}
        onEndReached={fetchNextPage}
        onPress={onProjectSelected}
        accessibilityLabel={t( "Change-project" )}
      />
    </ViewWrapper>
  );
};

export default ExploreProjectSearch;
