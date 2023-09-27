// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import classNames from "classnames";
import {
  Body4,
  INatIconButton
} from "components/SharedComponents";
import Map from "components/SharedComponents/Map";
import Modal from "components/SharedComponents/Modal";
import {
  SafeAreaView,
  View
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Platform } from "react-native";
import { useTheme } from "react-native-paper";
import { getShadowStyle } from "styles/global";

import CoordinatesCopiedNotification from "./CoordinatesCopiedNotification";

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 2,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 5
} );

type Props = {
  latitude: number,
  longitude: number,
  mapType: string,
  obscured?: boolean,
  positionalAccuracy: number,
  mapViewRef: any,
  showNotificationModal: boolean,
  displayLocation: string,
  displayCoordinates: string,
  closeNotificationsModal: Function,
  copyCoordinates: Function,
  shareMap: Function,
  cycleMapTypes: Function,
  zoomToCurrentUserLocation: Function,
  closeModal: Function
}

const DetailsMap = ( {
  latitude, longitude, obscured, positionalAccuracy,
  mapViewRef, mapType, closeNotificationsModal, displayLocation,
  displayCoordinates,
  copyCoordinates, shareMap, cycleMapTypes, zoomToCurrentUserLocation,
  showNotificationModal, closeModal
}: Props ): Node => {
  const theme = useTheme( );

  const mapButtonClassName = "absolute bg-white rounded-full m-[15px]";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 h-full">
        <Map
          showLocationIndicator
          obsLatitude={latitude}
          obsLongitude={longitude}
          mapHeight="100%"
          obscured={obscured}
          mapType={mapType}
          positionalAccuracy={positionalAccuracy}
          mapViewRef={mapViewRef}
        >
          { !obscured && (
            <>
              <View
                style={getShadow( theme.colors.primary )}
                className={`${mapButtonClassName} top-0 left-0`}
              >
                <INatIconButton
                  icon="copy"
                  height={46}
                  width={46}
                  size={26}
                  onPress={() => copyCoordinates()}
                  accessibilityLabel={t( ( "Copy-map-coordinates" ) )}
                />
              </View>
              <View
                style={getShadow( theme.colors.primary )}
                className={`${mapButtonClassName} top-0 right-0`}
              >
                <INatIconButton
                  icon="share"
                  height={46}
                  width={46}
                  size={26}
                  onPress={() => shareMap()}
                  accessibilityLabel={t( ( "Share-map" ) )}
                />
              </View>
            </>
          )}

          <View
            style={getShadow( theme.colors.primary )}
            className={`${mapButtonClassName} bottom-0 right-0`}
          >
            <INatIconButton
              icon="currentlocation"
              height={46}
              width={46}
              size={24}
              onPress={() => zoomToCurrentUserLocation()}
              accessibilityLabel={t( ( "User-location" ) )}
            />
          </View>
          <View
            style={getShadow( theme.colors.primary )}
            className={`${mapButtonClassName} bottom-0 left-0`}
          >
            <INatIconButton
              icon="map-layers"
              height={46}
              width={46}
              size={24}
              onPress={() => cycleMapTypes()}
              accessibilityLabel={t( ( "Map-layers" ) )}
            />
          </View>
        </Map>
      </View>
      <View className="py-[17px] bg-white w-fit">
        <View
          className={classNames( "space-y-[11px] pl-[64px] pr-[26px]", {
            "": Platform.OS === "android",
            "pl-[74px]": Platform.OS === "ios"
          } )}
        >
          <Body4
            className="text-darkGray"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayLocation}
          </Body4>
          {
            !obscured && (
              <Body4
                className="text-darkGray"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {displayCoordinates}
              </Body4>
            )
          }

          {obscured
        && (
          <Body4 className="italic">
            {t( "Obscured-observation-location-map-description" )}
          </Body4>
        ) }
        </View>
        <View
          className={classNames( "absolute bottom-0 left-0", {
            "mb-[25px]": Platform.OS === "android",
            "m-[25px] mb-[10px]": Platform.OS === "ios"
          } )}
        >
          <HeaderBackButton
            tintColor={theme.colors.primary}
            onPress={( ) => closeModal()}
          />
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
