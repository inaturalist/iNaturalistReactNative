// @flow

import Clipboard from "@react-native-clipboard/clipboard";
import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation, useRoute } from "@react-navigation/native";
import classNames from "classnames";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
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
import React, { useState } from "react";
import { Platform } from "react-native";
import openMap from "react-native-open-maps";
import { useTheme } from "react-native-paper";

import CoordinatesCopiedNotification from "./CoordinatesCopiedNotification";

const MapModal = (): Node => {
  const navigation = useNavigation( );
  const theme = useTheme( );
  const { params } = useRoute( );
  const { observation, latitude, longitude } = params;
  const privacy = observation?.geoprivacy;
  const coordinateString = t( "Lat-Lon", {
    latitude: observation.latitude,
    longitude: observation.longitude
  } );

  const [showModal, setShowModal] = useState( false );
  const [mapTypeIndex, setMapTypeIndex] = useState( 0 );

  const mapButtonClassName = "absolute bg-white rounded-full m-[15px]";
  const mapTypes = ["standard", "satellite", "hybrid"];
  const isObscured = privacy === "obscured";
  const displayCoordinates = t( "Lat-Lon-Acc", {
    latitude,
    longitude,
    accuracy: observation?.positional_accuracy?.toFixed( 0 ) || t( "none" )
  } );
  let displayLocation = checkCamelAndSnakeCase( observation, "placeGuess" )
  || checkCamelAndSnakeCase( observation, "privatePlaceGuess" );

  if ( !displayLocation ) {
    displayLocation = t( "No-Location" );
  }

  const closeModal = () => {
    setShowModal( false );
  };
  const copyCoordinates = () => {
    Clipboard.setString( coordinateString );
    setShowModal( true );
    // notification disappears after 2 secs
    setTimeout( closeModal, 2000 );
  };

  const cycleMapTypes = () => {
    if ( mapTypeIndex < 2 ) {
      setMapTypeIndex( mapTypeIndex + 1 );
    } else {
      setMapTypeIndex( 0 );
    }
  };

  const shareMap = () => {
    // takes in a provider prop but opens in browser instead of in app(google maps on iOS)
    openMap( { latitude, longitude } );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 h-full">
        <Map
          obsLatitude={latitude}
          obsLongitude={longitude}
          mapHeight="100%"
          privacy={privacy}
          showMarker
          mapType={mapTypes[mapTypeIndex]}
          positionalAccuracy={observation.positional_accuracy}
        >
          <INatIconButton
            icon="copy"
            height={46}
            width={46}
            size={26}
            className={`${mapButtonClassName} top-0 left-0`}
            onPress={() => copyCoordinates()}
          />
          <INatIconButton
            icon="share"
            height={46}
            width={46}
            size={26}
            className={`${mapButtonClassName} top-0 right-0`}
            onPress={() => shareMap()}
          />
          <INatIconButton
            icon="currentlocation"
            height={46}
            width={46}
            size={24}
            className={`${mapButtonClassName} bottom-0 right-0`}
          />
          <INatIconButton
            icon="map-layers"
            height={46}
            width={46}
            size={24}
            className={`${mapButtonClassName} bottom-0 left-0`}
            onPress={() => cycleMapTypes()}
          />
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
          <Body4
            className="text-darkGray"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayCoordinates}
          </Body4>
          {isObscured
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
            onPress={( ) => navigation.goBack( )}
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
        showModal={showModal}
        closeModal={( ) => setShowModal( false )}
        modal={(
          <CoordinatesCopiedNotification />
        )}
        backdropOpacity={0}
      />
    </SafeAreaView>
  );
};

export default MapModal;
