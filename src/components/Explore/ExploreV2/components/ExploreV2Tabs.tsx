import { OBSERVATIONS_TAB, SPECIES_TAB } from "appConstants/tabs";
import { Tabs } from "components/SharedComponents";
import StatTab from "components/SharedComponents/StatTab";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props {
  observationsCount?: number | null;
  speciesCount?: number | null;
}

// switching between observations and species views is deferred to MOB-1332.
const ExploreV2Tabs = ( { observationsCount, speciesCount }: Props ) => {
  const { t } = useTranslation( );

  return (
    <View testID="ExploreV2Tabs">
      <Tabs
        activeColor={String( colors?.inatGreen )}
        activeId={OBSERVATIONS_TAB}
        tabs={[
          {
            id: OBSERVATIONS_TAB,
            text: t( "Observations" ),
            testID: "ExploreV2Tabs.observations",
            onPress: ( ) => undefined, // MOB-1332
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
            onPress: ( ) => undefined, // MOB-1332
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
