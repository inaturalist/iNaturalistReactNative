// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import classnames from "classnames";
import {
  Body2,
  Body4,
  INatIconButton,
  Map,
  Modal
} from "components/SharedComponents";
import {
  SafeAreaView,
  View
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import IconMaterial from "react-native-vector-icons/MaterialCommunityIcons";
import { getShadowForColor } from "styles/global";

import CoordinatesCopiedNotification from "./CoordinatesCopiedNotification";

const HEADER_BACK_BUTTON_STYLE = {
  marginBottom: 15,
  marginLeft: 15
};

type Props = {
  latitude: number,
  longitude: number,
  obscured?: boolean,
  positionalAccuracy: number,
  mapViewRef: any,
  showNotificationModal: boolean,
  displayLocation: string,
  displayCoordinates: string,
  closeNotificationsModal: Function,
  copyCoordinates: Function,
  shareMap: Function,
  closeModal: Function,
  tileMapParams: Object
}

const FloatingActionButton = ( {
  buttonClassName,
  onPress,
  accessibilityLabel,
  icon,
  theme
} ) => {
  const fabClassNames = classnames(
    "absolute",
    "bg-white",
    "rounded-full",
    "m-5",
    buttonClassName
  );
  if ( icon === "export-variant" ) {
    return (
      <INatIconButton
        style={getShadowForColor( theme.colors.primary )}
        className={fabClassNames}
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
      >
        <IconMaterial name={icon} size={24} />
      </INatIconButton>
    );
  }
  return (
    <INatIconButton
      style={getShadowForColor( theme.colors.primary )}
      className={fabClassNames}
      icon={icon}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
    />
  );
};

const DetailsMap = ( {
  closeModal,
  closeNotificationsModal,
  copyCoordinates,
  displayCoordinates,
  displayLocation,
  latitude,
  longitude,
  mapViewRef,
  obscured,
  positionalAccuracy,
  shareMap,
  showNotificationModal,
  tileMapParams
}: Props ): Node => {
  const theme = useTheme( );
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 h-full">
        <Map
          showLocationIndicator
          showCurrentLocationButton
          showSwitchMapTypeButton
          obsLatitude={latitude}
          obsLongitude={longitude}
          mapHeight="100%"
          obscured={obscured}
          positionalAccuracy={positionalAccuracy}
          mapViewRef={mapViewRef}
          withObsTiles={tileMapParams !== null}
          tileMapParams={tileMapParams}
        >
          { !obscured && (
            <>
              <FloatingActionButton
                icon="copy"
                onPress={( ) => copyCoordinates( )}
                accessibilityLabel={t( "Copy-map-coordinates" )}
                buttonClassName="top-0 left-0"
                theme={theme}
              />
              <FloatingActionButton
                icon="share"
                onPress={( ) => shareMap( )}
                accessibilityLabel={t( "Share-map" )}
                buttonClassName="top-0 right-0"
                theme={theme}
              />
            </>
          )}
        </Map>
      </View>
      <View className="bg-white w-fit flex-row items-end">
        <HeaderBackButton
          tintColor={theme.colors.primary}
          onPress={( ) => closeModal()}
          style={HEADER_BACK_BUTTON_STYLE}
        />
        <View className="pt-5 pr-5 pb-5 flex-1">
          <Body2
            className="text-darkGray"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayLocation}
          </Body2>

          <Body2
            className="text-darkGray"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayCoordinates}
          </Body2>
          {obscured && (
            <Body4 className="italic">
              {t( "Obscured-observation-location-map-description" )}
            </Body4>
          ) }
        </View>
      </View>
      <Modal
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          alignItems: "center"
        }}
        animationIn="fadeIn"
        animationOut="fadeOut"
        showModal={showNotificationModal}
        closeModal={( ) => closeNotificationsModal( false )}
        modal={(
          <CoordinatesCopiedNotification />
        )}
        backdropOpacity={0}
      />
    </SafeAreaView>
  );
};

export default DetailsMap;
