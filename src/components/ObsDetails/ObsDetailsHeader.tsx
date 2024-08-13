import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import navigateToObsEdit from "components/ObsEdit/helpers/navigateToObsEdit.ts";
import {
  BackButton,
  INatIconButton
} from "components/SharedComponents";
import {
  LinearGradient, View
} from "components/styledComponents";
import React from "react";
import DeviceInfo from "react-native-device-info";
import {
  useLocalObservation,
  useTranslation
} from "sharedHooks";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

import HeaderKebabMenu from "./HeaderKebabMenu";

const isTablet = DeviceInfo.isTablet( );

interface Props {
  belongsToCurrentUser?: boolean,
  observationId: number,
  rightIconBlack?: boolean,
  uuid: string
}

const ObsDetailsHeader = ( {
  belongsToCurrentUser,
  observationId,
  rightIconBlack = false,
  uuid
}: Props ) => {
  const navigation = useNavigation( );
  const localObservation = useLocalObservation( uuid );
  const { t } = useTranslation( );
  const prepareObsEdit = useStore( state => state.prepareObsEdit );

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
      colors={[
        isTablet
          ? "rgba(0,0,0,0.1)"
          : "rgba(0,0,0,0.6)",
        "transparent"
      ]}
    >
      <View className="left-4 top-4">
        <BackButton color="white" inCustomHeader testID="ObsDetails.BackButton" />
      </View>
      <View className="right-4">
        {
          belongsToCurrentUser
            ? (
              <INatIconButton
                testID="ObsDetail.editButton"
                onPress={() => {
                  prepareObsEdit( localObservation );
                  navigateToObsEdit( navigation );
                }}
                icon="pencil"
                color={!rightIconBlack
                  ? colors.white
                  : colors.black}
                accessibilityLabel={t( "Edit" )}
              />
            )
            : <HeaderKebabMenu observationId={observationId} white={!rightIconBlack} />
        }
      </View>
    </LinearGradient>
  );
};

export default ObsDetailsHeader;
