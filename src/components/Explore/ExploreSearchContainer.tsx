import { useNavigation, useRoute } from "@react-navigation/native";
import type { ApiPlace, ApiProject, ApiTaxon } from "api/types";
import { View } from "components/styledComponents";
import type { TabStackScreenProps } from "navigation/types";
import {
  ExploreProvider,
} from "providers/ExploreContext";
import React from "react";
import type { RealmTaxon } from "realmModels/types";
import { useLocationPermission } from "sharedHooks";

import ExploreLocationSearch from "./SearchScreens/ExploreLocationSearch";
import ExploreProjectSearch from "./SearchScreens/ExploreProjectSearch";
import ExploreTaxonSearch from "./SearchScreens/ExploreTaxonSearch";
import ExploreUserSearch from "./SearchScreens/ExploreUserSearch";

const ExploreSearchContainerWithContext = () => {
  const navigation = useNavigation<TabStackScreenProps<"ExploreSearch">["navigation"]>();
  const { params } = useRoute<TabStackScreenProps<"ExploreSearch">["route"]>();

  const {
    hasPermissions,
    renderPermissionsGate,
    requestPermissions,
  } = useLocationPermission( );

  const initialSearchMode = params?.initialSearchMode || "none";

  const closeModal = () => {
    navigation.goBack();
  };

  const updateTaxon = (
    taxon: {
      name: string;
    } | null,
  ) => {
    console.log( "Not implemented in ExploreV2 yet.", taxon );
  };

  const updateLocation = ( location: "worldwide" | ApiPlace ) => {
    console.log( "Not implemented in ExploreV2 yet.", location );
  };

  const updateUser = ( user: null | { login: string } ) => {
    console.log( "Not implemented in ExploreV2 yet.", user );
  };
  const updateProject = ( project: null | ApiProject ) => {
    console.log( "Not implemented in ExploreV2 yet.", project );
  };

  if ( initialSearchMode === "taxon" ) {
    return (
      <ExploreTaxonSearch
        closeModal={closeModal}
        onPressInfo={( taxon: RealmTaxon | ApiTaxon ) => {
          navigation.push( "TaxonDetails", { id: taxon.id } );
        }}
        updateTaxon={updateTaxon}
      />
    );
  }

  if ( initialSearchMode === "location" ) {
    return (
      <ExploreLocationSearch
        closeModal={closeModal}
        hasPermissions={hasPermissions}
        renderPermissionsGate={renderPermissionsGate}
        requestPermissions={requestPermissions}
        updateLocation={updateLocation}
      />
    );
  }

  if ( initialSearchMode === "users" ) {
    return (
      <ExploreUserSearch closeModal={closeModal} updateUser={updateUser} />
    );
  }

  if ( initialSearchMode === "projects" ) {
    return (
      <ExploreProjectSearch
        closeModal={closeModal}
        updateProject={updateProject}
      />
    );
  }

  return (
    <View>
      {renderPermissionsGate( {} )}
    </View>
  );
};

const ExploreSearchContainer = () => (
  <ExploreProvider>
    <ExploreSearchContainerWithContext />
  </ExploreProvider>
);

export default ExploreSearchContainer;
