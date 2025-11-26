import { useNavigation } from "@react-navigation/native";
import {
  INatIconButton
} from "components/SharedComponents";
import React, { useCallback, useEffect } from "react";
import type { RealmObservation } from "realmModels/types";
import {
  useLocalObservation,
  useNavigateToObsEdit,
  useTranslation
} from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props {
  uuid: string;
}

const SavedMatchHeaderRight = ( {
  uuid
}: Props ) => {
  const navigation = useNavigation( );
  const { localObservation } = useLocalObservation( uuid );
  const { t } = useTranslation( );
  const navigateToObsEdit = useNavigateToObsEdit( );

  const headerRight = useCallback(
    ( ) => (
      <INatIconButton
        testID="ObsDetail.editButton"
        // TODO remove cast when useLocalObservation converted to typescript
        onPress={() => navigateToObsEdit( localObservation as RealmObservation )}
        icon="pencil"
        color={String( colors?.darkGray )}
        accessibilityLabel={t( "Edit" )}
      />
    ),
    [
      localObservation,
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
