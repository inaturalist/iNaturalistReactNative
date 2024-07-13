import Clipboard from "@react-native-clipboard/clipboard";
import {
  Body4,
  DetailsMap,
  Heading4,
  KebabMenu,
  Map,
  Modal,
  ObservationLocation
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useCallback, useMemo, useState } from "react";
import createOpenLink from "react-native-open-maps";
import { Menu } from "react-native-paper";
import { useCurrentUser } from "sharedHooks";

import DetailsMapHeader from "./DetailsMapHeader";

interface Props {
  observation: Object
}

const DETAILS_MAP_MODAL_STYLE = { margin: 0 };

const headingClass = "mt-[20px] mb-[11px] text-black";
const sectionClass = "mx-[15px] mb-[20px]";

const LocationSection = ( { observation }: Props ): Node => {
  const currentUser = useCurrentUser( );
  const [locationKebabMenuVisible, setLocationKebabMenuVisible] = useState( false );
  const geoprivacy = observation?.geoprivacy;
  const positionalAccuracy = observation?.positional_accuracy;
  const [showMapModal, setShowMapModal] = useState( false );

  const belongsToCurrentUser = observation?.user?.login === currentUser?.login;
  const isPrivate = geoprivacy === "private" && !belongsToCurrentUser;
  const isObscured = observation?.obscured && !belongsToCurrentUser;
  const showShareOptions = !isPrivate && !isObscured;

  const latitude = observation.privateLatitude || observation.latitude;
  const longitude = observation.privateLongitude || observation.longitude;
  const coordinateString = t( "Lat-Lon", {
    latitude,
    longitude
  } );

  const openMapScreen = useCallback( ( ) => setShowMapModal( true ), [] );

  const taxonId = observation?.taxon?.id;

  const tileMapParams = useMemo( ( ) => ( taxonId
    ? {
      taxon_id: taxonId,
      verifiable: true
    }
    : null ), [taxonId] );

  const displayMap = useCallback(
    ( ) => (
      <Map
        mapHeight={230}
        obsLatitude={latitude}
        obsLongitude={longitude}
        obscured={isObscured}
        openMapScreen={openMapScreen}
        positionalAccuracy={positionalAccuracy}
        scrollEnabled={false}
        showLocationIndicator
        tileMapParams={tileMapParams}
        withObsTiles={tileMapParams !== null}
        zoomEnabled={false}
        zoomTapEnabled={false}
      />
    ),
    [
      latitude,
      longitude,
      positionalAccuracy,
      tileMapParams,
      isObscured,
      openMapScreen
    ]
  );

  const showModalMap = useMemo( ( ) => (
    <DetailsMap
      latitude={latitude}
      longitude={longitude}
      obscured={isObscured}
      coordinateString={coordinateString}
      closeModal={( ) => setShowMapModal( false )}
      positionalAccuracy={positionalAccuracy}
      tileMapParams={tileMapParams}
      showLocationIndicator
      headerTitle={(
        <DetailsMapHeader
          observation={observation}
          obscured={isObscured}
        />
      )}
    />
  ), [
    coordinateString,
    isObscured,
    latitude,
    longitude,
    observation,
    positionalAccuracy,
    tileMapParams
  ] );

  return (
    <>
      <View className="flex-row justify-between items-center mt-[8px] mx-[15px]">
        <Heading4 className={headingClass}>{t( "LOCATION" )}</Heading4>
        {showShareOptions && (
          <KebabMenu
            visible={locationKebabMenuVisible}
            setVisible={setLocationKebabMenuVisible}
          >
            <Menu.Item
              title={t( "Share-location" )}
              onPress={() => createOpenLink(
                { query: `${latitude},${longitude}` }
              )}
            />
            <Menu.Item
              title={t( "Copy-coordinates" )}
              onPress={() => Clipboard.setString( coordinateString )}
            />
          </KebabMenu>
        )}
      </View>
      {displayMap( )}
      <View className={`mt-[11px] space-y-[11px] ${sectionClass}`}>
        <ObservationLocation observation={observation} obscured={isObscured} details />
        {isObscured && (
          <Body4 className="italic ml-[20px]">
            {t( "Obscured-observation-location-map-description" )}
          </Body4>
        ) }
      </View>
      <Modal
        animationIn="fadeIn"
        animationOut="fadeOut"
        showModal={showMapModal}
        closeModal={( ) => setShowMapModal( false )}
        disableSwipeDirection
        style={DETAILS_MAP_MODAL_STYLE}
        modal={showModalMap}
      />
    </>
  );
};

export default LocationSection;
