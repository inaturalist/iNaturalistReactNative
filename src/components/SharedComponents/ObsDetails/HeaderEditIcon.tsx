import { useNavigation } from "@react-navigation/native";
import {
  INatIconButton,
} from "components/SharedComponents";
import React, { useCallback, useEffect } from "react";
import type { RealmObservation } from "realmModels/types";
import {
  useNavigateToObsEdit,
  useTranslation,
} from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props {
  observation: RealmObservation;
  lastScreen?: string;
}

const HeaderEditIcon = ( {
  observation,
  lastScreen,
}: Props ) => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const navigateToObsEdit = useNavigateToObsEdit( );

  const headerRight = useCallback(
    ( ) => (
      <INatIconButton
        testID="ObsEditIcon"
        onPress={() => navigateToObsEdit( observation, lastScreen )}
        icon="pencil"
        color={String( colors?.darkGray )}
        accessibilityLabel={t( "Edit" )}
        size={22}
      />
    ),
    [
      observation,
      navigateToObsEdit,
      t,
      lastScreen,
    ],
  );

  useEffect(
    ( ) => navigation.setOptions( { headerRight } ),
    [headerRight, navigation],
  );

  return null;
};

export default HeaderEditIcon;
