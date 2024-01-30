// @flow
import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import {
  BackButton,
  INatIconButton
} from "components/SharedComponents";
import {
  LinearGradient
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import {
  useTranslation
} from "sharedHooks";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

import HeaderKebabMenu from "./HeaderKebabMenu";

type Props = {
  belongsToCurrentUser?: boolean,
  observation: Object,
  rightIconBlack?: boolean
}

const ObsDetailsHeader = ( {
  belongsToCurrentUser,
  observation,
  rightIconBlack = false
}: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const setObservations = useStore( state => state.setObservations );

  return (
    <LinearGradient
      className={classnames(
        "absolute",
        "top-0",
        "w-full",
        "flex-row",
        "justify-between",
        "h-10"
      )}
      colors={["rgba(0,0,0,0.1)", "transparent"]}
    >
      <BackButton color="white" inCustomHeader />
      {
        belongsToCurrentUser
          ? (
            <INatIconButton
              testID="ObsDetail.editButton"
              onPress={() => {
                setObservations( [observation] );
                navigation.navigate( "ObsEdit" );
              }}
              icon="pencil"
              color={!rightIconBlack
                ? colors.white
                : colors.black}
              // className="absolute top-3 right-3"
              accessibilityLabel={t( "Edit" )}
            />
          )
          : <HeaderKebabMenu observationId={observation?.id} white={!rightIconBlack} />
      }
    </LinearGradient>
  );
};

export default ObsDetailsHeader;
