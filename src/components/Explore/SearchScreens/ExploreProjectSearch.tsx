import { searchProjects } from "api/projects";
import type { ApiProject } from "api/types";
import ProjectList from "components/ProjectList/ProjectList.tsx";
import {
  SearchBar,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, {
  useCallback,
  useState
} from "react";
import { useInfiniteScroll, useTranslation } from "sharedHooks";
import { getShadow } from "styles/global";

import EmptySearchResults from "./EmptySearchResults";
import ExploreSearchHeader from "./ExploreSearchHeader";

const DROP_SHADOW = getShadow( {
  offsetHeight: 4
} );

type Props = {
  closeModal: ( ) => void,
  updateProject: ( project: ApiProject ) => void
};

const ExploreProjectSearch = ( { closeModal, updateProject }: Props ) => {
  const [projectQuery, setProjectQuery] = useState( "" );
  const { t } = useTranslation();

  // TODO fix these types if/when we ever figure out how to type react query
  // wrappers like useInfiniteScroll
  const {
    data: projects,
    isFetching,
    fetchNextPage,
    refetch
  } = useInfiniteScroll(
    ["ExploreProjectSearch", projectQuery],
    searchProjects,
    { q: projectQuery }
  );

  const onProjectSelected = useCallback( async ( project: ApiProject ) => {
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
