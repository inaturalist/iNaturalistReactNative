import {
  IDENTIFIERS_TAB,
  OBSERVATIONS_TAB,
  OBSERVERS_TAB,
  SPECIES_TAB,
} from "appConstants/tabs";
import {
  IdentifiersStatTab,
  ObservationsStatTab,
  ObserversStatTab,
  SpeciesStatTab,
} from "components/SharedComponents/StatTab";
import type { Tab } from "components/SharedComponents/Tabs/Tabs";
import Tabs from "components/SharedComponents/Tabs/Tabs";
import { View } from "components/styledComponents";
import { EXPLORE_V2_ACTION, useExploreV2 } from "providers/ExploreV2Context";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";
import type { ExploreV2AdvancedSearchSlice } from "stores/createExploreV2AdvancedSearchSlice";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

interface Props {
  identifiersCount?: number | null;
  observationsCount?: number | null;
  observersCount?: number | null;
  speciesCount?: number | null;
}

const ExploreV2Tabs = ( {
  identifiersCount,
  observationsCount,
  observersCount,
  speciesCount,
}: Props ) => {
  const { t } = useTranslation( );
  const { state, dispatch } = useExploreV2( );
  const advancedSearchMode = useStore(
    ( storeState: ExploreV2AdvancedSearchSlice ) => storeState
      .exploreV2AdvancedSearch.advancedSearchMode,
  );

  const tabs: Tab[] = [
    {
      id: OBSERVATIONS_TAB,
      text: t( "Observations" ),
      testID: "ExploreV2Tabs.observations",
      onPress: ( ) => dispatch( {
        type: EXPLORE_V2_ACTION.SET_ACTIVE_TAB,
        tab: OBSERVATIONS_TAB,
      } ),
      renderComponent: ( ) => (
        <ObservationsStatTab count={observationsCount} wrapperClassName="pb-3" />
      ),
    },
    {
      id: SPECIES_TAB,
      text: t( "Species" ),
      testID: "ExploreV2Tabs.species",
      onPress: ( ) => dispatch( {
        type: EXPLORE_V2_ACTION.SET_ACTIVE_TAB,
        tab: SPECIES_TAB,
      } ),
      renderComponent: ( ) => (
        <SpeciesStatTab count={speciesCount} wrapperClassName="pb-3" />
      ),
    },
  ];

  // Observers and identifiers are advanced search mode only
  if ( advancedSearchMode ) {
    tabs.push(
      {
        id: OBSERVERS_TAB,
        text: t( "Observers" ),
        testID: "ExploreV2Tabs.observers",
        onPress: ( ) => dispatch( {
          type: EXPLORE_V2_ACTION.SET_ACTIVE_TAB,
          tab: OBSERVERS_TAB,
        } ),
        renderComponent: ( ) => (
          <ObserversStatTab count={observersCount} wrapperClassName="pb-3" />
        ),
      },
      {
        id: IDENTIFIERS_TAB,
        text: t( "Identifiers" ),
        testID: "ExploreV2Tabs.identifiers",
        onPress: ( ) => dispatch( {
          type: EXPLORE_V2_ACTION.SET_ACTIVE_TAB,
          tab: IDENTIFIERS_TAB,
        } ),
        renderComponent: ( ) => (
          <IdentifiersStatTab count={identifiersCount} wrapperClassName="pb-3" />
        ),
      },
    );
  }

  return (
    <View testID="ExploreV2Tabs">
      <Tabs
        activeColor={String( colors?.inatGreen )}
        activeId={state.activeTab}
        scrollable={advancedSearchMode}
        tabs={tabs}
      />
    </View>
  );
};

export default ExploreV2Tabs;
