import { useNavigation } from "@react-navigation/native";
import {
  INatIconButton
} from "components/SharedComponents";
import React, { useCallback, useEffect } from "react";
import type { RealmObservation } from "realmModels/types";
import {
  useNavigateToObsEdit,
  useTranslation
} from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props {
  observation: RealmObservation;
}

const SavedMatchHeaderRight = ( {
  observation
}: Props ) => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const navigateToObsEdit = useNavigateToObsEdit( );

  const headerRight = useCallback(
    ( ) => (
      <INatIconButton
        testID="SavedMatch.editButton"
        // TODO remove cast when useLocalObservation converted to typescript
        onPress={() => navigateToObsEdit( observation )}
        icon="pencil"
        color={String( colors?.darkGray )}
        accessibilityLabel={t( "Edit" )}
        size={22}
      />
    ),
    [
      observation,
      navigateToObsEdit,
      t
    ]
  );

  useEffect(
    ( ) => navigation.setOptions( { headerRight } ),
    [headerRight, navigation]
  );

  return null;
};

export default SavedMatchHeaderRight;
