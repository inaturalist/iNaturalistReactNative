import classnames from "classnames";
import {
  INatIconButton,
  OverlayHeader
} from "components/SharedComponents";
import {
  LinearGradient
} from "components/styledComponents";
import React from "react";
import DeviceInfo from "react-native-device-info";
import type { RealmObservation } from "realmModels/types";
import {
  useLocalObservation,
  useNavigateToObsEdit,
  useTranslation
} from "sharedHooks";
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
  const localObservation = useLocalObservation( uuid );
  const navigateToObsEdit = useNavigateToObsEdit( );
  const { t } = useTranslation( );

  const whiteIcon = !rightIconDarkGray && !invertToWhiteBackground;

  return (
    <LinearGradient
      className={classnames(
        "h-16 transparent"
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
        headerRight={
          belongsToCurrentUser
            ? (
              <INatIconButton
                testID="ObsDetail.editButton"
                // TODO remove this cast when useLocalObservation is properly typed
                onPress={() => navigateToObsEdit( localObservation as RealmObservation )}
                icon="pencil"
                color={String(
                  whiteIcon
                    ? colors?.white
                    : colors?.darkGray
                )}
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
