import { useNavigation } from "@react-navigation/native";
import type { ApiTaxon } from "api/types";
import {
  INatIconButton,
} from "components/SharedComponents";
import React, { useCallback, useEffect } from "react";
import type { RealmObservation, RealmTaxon } from "realmModels/types";
import {
  useNavigateToObsEdit,
  useTranslation,
} from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props {
  observation: RealmObservation;
  lastScreen?: string;
  taxon?: ApiTaxon | RealmTaxon;
}

const HeaderEditIcon = ( {
  observation,
  lastScreen,
  taxon,
}: Props ) => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const navigateToObsEdit = useNavigateToObsEdit( );

  const handleEditPress = useCallback( ( ) => {
    navigateToObsEdit( observation, lastScreen, taxon );
  }, [taxon, navigateToObsEdit, observation, lastScreen] );

  const headerRight = useCallback(
    ( ) => (
      <INatIconButton
        testID="ObsEditIcon"
        onPress={handleEditPress}
        icon="pencil"
        color={String( colors?.darkGray )}
        accessibilityLabel={t( "Edit" )}
        size={22}
      />
    ),
    [
      handleEditPress,
      t,
    ],
  );

  useEffect(
    ( ) => navigation.setOptions( { headerRight } ),
    [headerRight, navigation],
  );

  return null;
};

export default HeaderEditIcon;
