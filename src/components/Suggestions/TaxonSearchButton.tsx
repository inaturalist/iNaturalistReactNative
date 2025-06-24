import { useNavigation, useRoute } from "@react-navigation/native";
import {
  INatIconButton
} from "components/SharedComponents";
import React from "react";
import {
  useTranslation
} from "sharedHooks";

const TaxonSearchButton = ( ) => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { entryScreen, lastScreen } = params;

  return (
    <INatIconButton
      icon="magnifying-glass"
      onPress={
        ( ) => navigation.navigate(
          "SuggestionsTaxonSearch",
          {
            entryScreen,
            lastScreen: lastScreen === "ObsDetails"
              ? "ObsDetails"
              : "Suggestions"
          }
        )
      }
      accessibilityLabel={t( "Search" )}
    />
  );
};

export default TaxonSearchButton;
