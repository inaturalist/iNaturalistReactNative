import Clipboard from "@react-native-clipboard/clipboard";
import {
  Button,
  DetailsMap,
  Heading4,
  KebabMenu,
  Map,
  Modal,
  ObservationLocation
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import React, { useCallback, useMemo, useState } from "react";
import createOpenLink from "react-native-open-maps";
import type Observation from "realmModels/Observation";
import { useCurrentUser } from "sharedHooks";

import DetailsMapHeader from "./DetailsMapHeader";
import ObscurationExplanation from "./ObscurationExplanation";

interface Props {
  observation: Observation;
}

const DETAILS_MAP_MODAL_STYLE = { margin: 0 };

const headingClass = "mt-[20px] mb-[11px] text-darkGray";
const sectionClass = "mx-[15px] mb-[20px]";

const LocationSection = ( { observation }: Props ) => {
  const currentUser = useCurrentUser( );
  const [locationKebabMenuVisible, setLocationKebabMenuVisible] = useState( false );
  const [showMapModal, setShowMapModal] = useState( false );
  const showShareOptions = observation && !!(
    !observation.obscured || observation.privateLatitude
  );
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
        observation={observation}
        openMapScreen={openMapScreen}
        scrollEnabled={false}
        showLocationIndicator
        tileMapParams={tileMapParams}
        withObsTiles={tileMapParams !== null}
        zoomEnabled={false}
        zoomTapEnabled={false}
      />
    ),
    [
      observation,
      tileMapParams,
      openMapScreen
    ]
  );

  const showModalMap = useMemo( ( ) => (
    <DetailsMap
      coordinateString={coordinateString}
      closeModal={( ) => setShowMapModal( false )}
      observation={observation}
      tileMapParams={tileMapParams}
      showLocationIndicator
      headerTitle={(
        <DetailsMapHeader currentUser={currentUser} observation={observation} />
      )}
    />
  ), [
    coordinateString,
    currentUser,
    observation,
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
            <KebabMenu.Item
              isFirst
              title={t( "Share-location" )}
              onPress={() => createOpenLink(
                { query: `${latitude},${longitude}` }
              )}
            />
            <KebabMenu.Item
              title={t( "Copy-coordinates" )}
              onPress={() => Clipboard.setString( coordinateString )}
            />
          </KebabMenu>
        )}
      </View>
      {( observation.latitude || observation.private_latitude ) && (
        <>
          { displayMap( ) }
          <Button
            text={t( "EXPAND-MAP" )}
            className="mb-4 mt-[20px] mx-[15px]"
            onPress={() => {
              setShowMapModal( true );
            }}
          />
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
      )}
      <View className={`mt-[11px] space-y-[11px] ${sectionClass}`}>
        <ObservationLocation observation={observation} details />
        {observation.obscured && (
          <ObscurationExplanation
            textClassName="ml-[20px] mt-[10px]"
            observation={observation}
            currentUser={currentUser}
          />
        ) }
      </View>
    </>
  );
};

export default LocationSection;
