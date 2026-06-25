import { OBSERVATIONS_TAB } from "appConstants/tabs";
import { Tabs } from "components/SharedComponents";
import StatTab from "components/SharedComponents/StatTab";
import type { TabComponentProps } from "components/SharedComponents/Tabs/Tabs";
import { View } from "components/styledComponents";
import React, { useCallback } from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

const SPECIES_TAB = "species";

interface Props {
  observationsCount?: number | null;
  speciesCount?: number | null;
}

// switching between observations and species views is deferred to MOB-1332.
const ExploreV2Tabs = ( { observationsCount, speciesCount }: Props ) => {
  const { t } = useTranslation( );

  const renderTabComponent = useCallback(
    ( { id }: TabComponentProps ) => (
      <StatTab
        id={id}
        numTotalObservations={observationsCount}
        numTotalTaxa={speciesCount}
        wrapperClassName="pb-3"
      />
    ),
    [observationsCount, speciesCount],
  );

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
          },
          {
            id: SPECIES_TAB,
            text: t( "Species" ),
            testID: "ExploreV2Tabs.species",
            onPress: ( ) => undefined, // MOB-1332
          },
        ]}
        TabComponent={renderTabComponent}
      />
    </View>
  );
};

export default ExploreV2Tabs;
