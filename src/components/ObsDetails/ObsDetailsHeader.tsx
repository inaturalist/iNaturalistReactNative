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
  invertToWhiteBackground: boolean,
  observationId: number,
  rightIconDarkGray?: boolean,
  uuid: string
}

const ObsDetailsHeader = ( {
  belongsToCurrentUser,
  invertToWhiteBackground,
  observationId,
  rightIconDarkGray = false,
  uuid
}: Props ) => {
  const navigation = useNavigation( );
  const localObservation = useLocalObservation( uuid );
  const { t } = useTranslation( );
  const prepareObsEdit = useStore( state => state.prepareObsEdit );
  const setMyObsOffsetToRestore = useStore( state => state.setMyObsOffsetToRestore );

  const whiteIcon = !rightIconDarkGray && !invertToWhiteBackground;

  return (
    <LinearGradient
      className={classnames(
        "absolute",
        "top-0",
        "w-full",
        "flex-row",
        "justify-between",
        "h-16"
      )}
      colors={[
        isTablet
          ? "rgba(0,0,0,0.1)"
          : "rgba(0,0,0,0.6)",
        "transparent"
      ]}
    >
      <OverlayHeader
        testID="ObsDetails.BackButton"
        invertToWhiteBackground={invertToWhiteBackground}
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
                color={whiteIcon
                  ? colors.white
                  : colors.darkGray}
                accessibilityLabel={t( "Edit" )}
              />
            )
            : <HeaderKebabMenu observationId={observationId} white={whiteIcon} />
        }
      />
    </LinearGradient>
  );
};

export default ObsDetailsHeader;
