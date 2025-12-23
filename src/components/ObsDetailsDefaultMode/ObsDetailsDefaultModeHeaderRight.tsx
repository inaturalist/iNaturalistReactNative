import { useNavigation } from "@react-navigation/native";
import {
  INatIconButton,
} from "components/SharedComponents";
import React, { useCallback, useEffect } from "react";
import type { RealmObservation } from "realmModels/types";
import {
  useLocalObservation,
  useNavigateToObsEdit,
  useTranslation,
} from "sharedHooks";
import colors from "styles/tailwindColors";

import HeaderKebabMenu from "./HeaderKebabMenu";

interface Props {
  belongsToCurrentUser?: boolean;
  observationId: number;
  uuid: string;
  refetchSubscriptions: () => void;
  subscriptions: object;
}

const ObsDetailsDefaultModeHeaderRight = ( {
  belongsToCurrentUser,
  observationId,
  uuid,
  refetchSubscriptions,
  subscriptions,
}: Props ) => {
  const navigation = useNavigation( );
  const { localObservation } = useLocalObservation( uuid );
  const { t } = useTranslation( );
  const navigateToObsEdit = useNavigateToObsEdit( );

  const headerRight = useCallback(
    ( ) => ( belongsToCurrentUser
      ? (
        <INatIconButton
          testID="ObsDetail.editButton"
          // TODO remove cast when useLocalObservation converted to typescript
          onPress={() => navigateToObsEdit( localObservation as RealmObservation )}
          icon="pencil"
          color={String( colors?.darkGray )}
          accessibilityLabel={t( "Edit" )}
        />
      )
      : (
        <HeaderKebabMenu
          observationId={observationId}
          subscriptions={subscriptions}
          uuid={uuid}
          refetchSubscriptions={refetchSubscriptions}
        />
      ) ),
    [
      uuid,
      belongsToCurrentUser,
      localObservation,
      navigateToObsEdit,
      observationId,
      refetchSubscriptions,
      subscriptions,
      t,
    ],
  );

  useEffect(
    ( ) => navigation.setOptions( { headerRight } ),
    [headerRight, navigation],
  );

  return null;
};

export default ObsDetailsDefaultModeHeaderRight;
