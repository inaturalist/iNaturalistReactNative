import { useNavigation } from "@react-navigation/native";
import type { ApiPlace, ApiProject } from "api/types";
import React from "react";

import FilterModalV2 from "./Modals/FilterModalV2";

const ExploreFiltersContainer = ( ) => {
  const navigation = useNavigation( );

  const closeModal = ( ) => {
    navigation.goBack( );
  };

  const updateTaxon = ( taxon: {
      name: string;
    } | null ) => {
    console.log( " Not implemented in ExploreV2 yet", taxon );
  };

  const updateLocation = ( location: "worldwide" | ApiPlace ) => {
    console.log( " Not implemented in ExploreV2 yet", location );
  };

  const updateUser = ( user: {
        login: string;
    } | null ) => {
    console.log( " Not implemented in ExploreV2 yet", user );
  };

  const updateProject = ( project: ApiProject ) => {
    console.log( " Not implemented in ExploreV2 yet", project );
  };

  return (
    <FilterModalV2
      closeModal={closeModal}
      // filterByIconicTaxonUnknown={filterByIconicTaxonUnknown}
      // renderLocationPermissionsGate={renderPermissionsGate}
      // requestLocationPermissions={requestLocationPermissions}
      updateTaxon={updateTaxon}
      updateLocation={updateLocation}
      updateUser={updateUser}
      updateProject={updateProject}
    />
  );
};

export default ExploreFiltersContainer;
