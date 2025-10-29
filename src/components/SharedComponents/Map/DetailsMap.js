// @flow

import Clipboard from "@react-native-clipboard/clipboard";
import { HeaderBackButton } from "@react-navigation/elements";
import classnames from "classnames";
import CoordinatesCopiedNotification
  from "components/ObsDetails/DetailsTab/CoordinatesCopiedNotification";
import {
  Heading2,
  INatIconButton,
  Map,
  Modal
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";
import openMap from "react-native-open-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getShadow } from "styles/global";
import colors from "styles/tailwindColors";

type Props = {
  closeModal: Function,
  coordinateString?: string,
  headerTitle?: Object,
  observation?: {
    latitude?: number,
    privateLatitude?: number,
    longitude?: number,
    privateLongitude?: number,
    obscured?: boolean
  },
  region?: Object,
  showLocationIndicator: boolean,
  tileMapParams: Object,
}

const FloatingActionButton = ( {
  accessibilityLabel,
  buttonClassName,
  icon,
  onPress
} ) => {
  const fabClassNames = classnames(
    "absolute",
    "bg-white",
    "rounded-full",
    "m-5",
    buttonClassName
  );

  return (
    <INatIconButton
      style={getShadow( )}
      className={fabClassNames}
      icon={icon}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
    />
  );
};

const DetailsMap = ( {
  closeModal,
  coordinateString,
  headerTitle,
  observation,
  region,
  showLocationIndicator,
  tileMapParams
}: Props ): Node => {
  const insets = useSafeAreaInsets();

  const [showNotificationModal, setShowNotificationModal] = useState( false );

  const closeShowNotificationModal = () => {
    setShowNotificationModal( false );
  };
  const copyCoordinates = () => {
    if ( coordinateString ) {
      Clipboard.setString( coordinateString );
      setShowNotificationModal( true );
      // notification disappears after 2 secs
      setTimeout( closeShowNotificationModal, 2000 );
    }
  };

  const latitude = observation?.privateLatitude || observation?.latitude;
  const longitude = observation?.privateLongitude || observation?.longitude;
  const canViewCoordinates = !observation?.obscured || observation?.privateLatitude;

  const shareMap = () => {
    if ( !latitude || !longitude ) return;
    // takes in a provider prop but opens in browser instead of in app(google maps on iOS)
    openMap( { query: `${latitude}, ${longitude}` } );
  };

  return (
    <View className="flex-1">
      <View
        className="bg-white w-fit flex-row py-[22px] pl-[21px] pr-[24px] items-start"
        style={{ paddingTop: insets.top }}
      >
        <HeaderBackButton
          tintColor={colors.darkGray}
          onPress={( ) => closeModal()}
          displayMode="minimal"
        />
        {headerTitle || <Heading2 className="m-0">{t( "Map-Area" )}</Heading2>}
      </View>
      <View className="flex-1">
        <Map
          mapHeight="100%"
          observation={observation}
          region={region}
          showCurrentLocationButton
          showLocationIndicator={showLocationIndicator}
          showSwitchMapTypeButton
          tileMapParams={tileMapParams}
          withObsTiles={tileMapParams !== null}
        >
          { ( observation && canViewCoordinates ) && (
            <>
              <FloatingActionButton
                icon="copy"
                onPress={( ) => copyCoordinates( )}
                accessibilityLabel={t( "Copy-coordinates" )}
                buttonClassName="top-0 left-0"
              />
              <FloatingActionButton
                icon="share"
                onPress={( ) => shareMap( )}
                accessibilityLabel={t( "Share-map" )}
                buttonClassName="top-0 right-0"
              />
            </>
          )}
        </Map>
      </View>
      <Modal
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          alignItems: "center"
        }}
        animationIn="fadeIn"
        animationOut="fadeOut"
        showModal={showNotificationModal}
        closeModal={( ) => closeShowNotificationModal( )}
        modal={(
          <CoordinatesCopiedNotification />
        )}
        backdropOpacity={0}
      />
    </View>
  );
};

export default DetailsMap;
