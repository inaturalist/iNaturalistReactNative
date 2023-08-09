// @flow

// import { useRoute } from "@react-navigation/native";
import {
  Heading4
} from "components/SharedComponents";
import Map from "components/SharedComponents/Map";
// import Modal from "components/SharedComponents/Modal";
import {
  SafeAreaView
} from "components/styledComponents";
import { t } from "i18next";
import * as React from "react";
// import { useMemo, useState } from "react";
import { Dimensions } from "react-native";

type Props = {
 observation: Object,
 closeModal: ( ) => void
}

const MapModal = ( {
  observation, closeModal
}: Props ): React.Node => {
  // const { params } = useRoute( );
  // const { observation } = params;
  const privacy = observation?.geoprivacy;
  const { height } = Dimensions.get( "screen" );

  return (
    <SafeAreaView className="flex-1 p-0">
      <Heading4 onPress={() => { closeModal(); }}>{t( "NOTES" )}</Heading4>
      <Map
        obsLatitude={observation.latitude}
        obsLongitude={observation.longitude}
        mapHeight={height - 10}
        privacy={privacy}
        showMarker
      />
    </SafeAreaView>
  );
};

export default MapModal;
