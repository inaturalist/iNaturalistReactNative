import { useNavigation } from "@react-navigation/native";
import type { ApiProject } from "api/types";
import {
  ExploreProvider,
} from "providers/ExploreContext";
import React from "react";

import FilterModalV2 from "./Modals/FilterModalV2";

const ExploreFiltersContainerWithContext = () => {
  const navigation = useNavigation();

  const closeModal = () => {
    navigation.goBack();
  };

  const filterByIconicTaxonUnknown = () => {
    console.log(" Not implemented in ExploreV2 yet");
  };

  const updateTaxon = (
    taxon: {
      name: string;
    } | null,
  ) => {
    console.log(" Not implemented in ExploreV2 yet", taxon);
  };

  const updateUser = (
    user: {
      login: string;
    } | null,
  ) => {
    console.log(" Not implemented in ExploreV2 yet", user);
  };

  const updateProject = (project: ApiProject) => {
    console.log(" Not implemented in ExploreV2 yet", project);
  };

  return (
    <FilterModalV2
      closeModal={closeModal}
      filterByIconicTaxonUnknown={filterByIconicTaxonUnknown}
      updateTaxon={updateTaxon}
      updateUser={updateUser}
      updateProject={updateProject}
    />
  );
};

const ExploreFiltersContainer = () => (
  <ExploreProvider>
    <ExploreFiltersContainerWithContext />
  </ExploreProvider>
);

export default ExploreFiltersContainer;
