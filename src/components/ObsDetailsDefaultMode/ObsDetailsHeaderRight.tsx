import { useNavigation } from "@react-navigation/native";
import navigateToObsEdit from "components/ObsEdit/helpers/navigateToObsEdit.ts";
import {
  INatIconButton
} from "components/SharedComponents";
import React, { useCallback, useEffect } from "react";
import {
  useLocalObservation,
  useTranslation
} from "sharedHooks";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

import HeaderKebabMenu from "./HeaderKebabMenu";

interface Props {
  belongsToCurrentUser?: boolean,
  observationId: number,
  uuid: string
}

const ObsDetailsHeader = ( {
  belongsToCurrentUser,
  observationId,
  uuid
}: Props ) => {
  const navigation = useNavigation( );
  const localObservation = useLocalObservation( uuid );
  const { t } = useTranslation( );
  const prepareObsEdit = useStore( state => state.prepareObsEdit );
  const setMyObsOffsetToRestore = useStore( state => state.setMyObsOffsetToRestore );

  const headerRight = useCallback(
    ( ) => ( belongsToCurrentUser
      ? (
        <INatIconButton
          testID="ObsDetail.editButton"
          onPress={() => {
            prepareObsEdit( localObservation );
            navigateToObsEdit( navigation, setMyObsOffsetToRestore );
          }}
          icon="pencil"
          color={colors.darkGray}
          accessibilityLabel={t( "Edit" )}
        />
      )
      : <HeaderKebabMenu observationId={observationId} /> ),
    [
      belongsToCurrentUser,
      localObservation,
      navigation,
      observationId,
      prepareObsEdit,
      setMyObsOffsetToRestore,
      t
    ]
  );

  useEffect(
    ( ) => navigation.setOptions( { headerRight } ),
    [headerRight, navigation]
  );

  return null;
};

export default ObsDetailsHeader;
