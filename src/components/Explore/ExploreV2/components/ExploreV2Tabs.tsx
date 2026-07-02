import { OBSERVATIONS_TAB, SPECIES_TAB } from "appConstants/tabs";
import { Tabs } from "components/SharedComponents";
import StatTab from "components/SharedComponents/StatTab";
import { View } from "components/styledComponents";
import { EXPLORE_V2_ACTION, useExploreV2 } from "providers/ExploreV2Context";
import React from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props {
  observationsCount?: number | null;
  speciesCount?: number | null;
}

const ExploreV2Tabs = ( { observationsCount, speciesCount }: Props ) => {
  const { t } = useTranslation( );
  const { state, dispatch } = useExploreV2( );

  return (
    <View testID="ExploreV2Tabs">
      <Tabs
        activeColor={String( colors?.inatGreen )}
        activeId={state.activeTab}
        tabs={[
          {
            id: OBSERVATIONS_TAB,
            text: t( "Observations" ),
            testID: "ExploreV2Tabs.observations",
            onPress: ( ) => dispatch( {
              type: EXPLORE_V2_ACTION.SET_ACTIVE_TAB,
              tab: OBSERVATIONS_TAB,
            } ),
            renderComponent: ( ) => (
              <StatTab
                stat={observationsCount}
                label={t( "X-OBSERVATIONS--below-number", { count: observationsCount } )}
                wrapperClassName="pb-3"
              />
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
              <StatTab
                stat={speciesCount}
                label={t( "X-SPECIES--below-number", { count: speciesCount } )}
                wrapperClassName="pb-3"
              />
            ),
          },
        ]}
      />
    </View>
  );
};

export default ExploreV2Tabs;
