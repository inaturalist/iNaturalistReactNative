import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import navigateToObsEdit from "components/ObsEdit/helpers/navigateToObsEdit.ts";
import {
  INatIconButton,
  OverlayHeader
} from "components/SharedComponents";
import {
  LinearGradient
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
  rightIconDarkGray?: boolean,
  uuid: string
}

const ObsDetailsHeader = ( {
  belongsToCurrentUser,
  observationId,
  rightIconDarkGray = false,
  uuid
}: Props ) => {
  const navigation = useNavigation( );
  const localObservation = useLocalObservation( uuid );
  const { t } = useTranslation( );
  const prepareObsEdit = useStore( state => state.prepareObsEdit );
  const setMyObsOffsetToRestore = useStore( state => state.setMyObsOffsetToRestore );

  return (
    <LinearGradient
      className={classnames(
        "absolute",
        "top-0",
        "w-full",
        "flex-row",
        "justify-between",
        "h-12"
      )}
      colors={[
        isTablet
          ? "rgba(0,0,0,0.1)"
          : "rgba(0,0,0,0.6)",
        "transparent"
      ]}
      pointerEvents="box-none"
    >
      <OverlayHeader
        testID="ObsDetails.BackButton"
        rightHeaderButton={
          belongsToCurrentUser
            ? (
              <INatIconButton
                testID="ObsDetail.editButton"
                onPress={() => {
                  prepareObsEdit( localObservation );
                  navigateToObsEdit( navigation, setMyObsOffsetToRestore );
                }}
                icon="pencil"
                color={!rightIconDarkGray
                  ? colors.white
                  : colors.darkGray}
                accessibilityLabel={t( "Edit" )}
              />
            )
            : <HeaderKebabMenu observationId={observationId} white={!rightIconDarkGray} />
        }
      />
    </LinearGradient>
  );
};

export default ObsDetailsHeader;
