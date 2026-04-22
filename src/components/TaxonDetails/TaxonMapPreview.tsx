import { searchObservations } from "api/observations";
import {
  Button,
  DetailsMap,
  Heading4,
  Map,
  Modal,
} from "components/SharedComponents";
import { getMapRegion } from "components/SharedComponents/Map/helpers/mapHelpers";
import {
  View,
} from "components/styledComponents";
import React, { useState } from "react";
import { useTranslation } from "sharedHooks";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";

import TaxonDetailsTitle from "./TaxonDetailsTitle";

interface Props {
  observation: object;
  showSpeciesSeenCheckmark: boolean;
  taxon: object;
}

const TaxonMapPreview = ( {
  observation,
  showSpeciesSeenCheckmark,
  taxon,
}: Props ) => {
  const { t } = useTranslation( );
  const [showMapModal, setShowMapModal] = useState( false );
  const obsParams = {
    taxon_id: taxon.id,
    verifiable: true,
  };

  // TODO: add a loading indicator for map preview
  const {
    data: obsSearchResponse,
  } = useAuthenticatedQuery(
    ["fetchTaxonBoundingBox"],
    optsWithAuth => searchObservations( {
      ...obsParams,
      return_bounds: true,
      per_page: 0,
      ttl: -1,
    }, optsWithAuth ),
  );

  const hasObservationResults = obsSearchResponse?.total_results > 0;
  const hasBounds = obsSearchResponse?.total_bounds;

  if ( hasBounds && hasObservationResults ) {
    const region = getMapRegion( obsSearchResponse?.total_bounds );
    if ( observation ) {
      const lat = observation.privateLatitude || observation.latitude;
      const lng = observation.privateLongitude || observation.longitude;
      if ( typeof ( lat ) === "number" && typeof ( lng ) === "number" ) {
        region.latitude = lat;
        region.longitude = lng;
      }
    }

    return (
      <View className="relative h-[390px]">
        <Heading4 className="mb-3">{t( "MAP" )}</Heading4>
        <Map
          mapHeight={230}
          mapViewClassName="-mx-3"
          observation={observation}
          openMapScreen={() => setShowMapModal( true )}
          initialRegion={region}
          scrollEnabled={false}
          tileMapParams={obsParams}
          withObsTiles
          zoomEnabled={false}
          zoomTapEnabled={false}
        />
        <Button
          text={t( "EXPAND-MAP" )}
          className="mt-4"
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
          // eslint-disable-next-line react-native/no-inline-styles
          style={{ margin: 0 }}
          modal={(
            <DetailsMap
              initialRegion={region}
              observation={observation}
              closeModal={( ) => setShowMapModal( false )}
              tileMapParams={obsParams}
              showLocationIndicator={false}
              headerTitle={(
                <TaxonDetailsTitle
                  taxon={taxon}
                  showSpeciesSeenCheckmark={showSpeciesSeenCheckmark}
                />
              )}
            />
          )}
        />
      </View>

    );
  }

  return null;
};

export default TaxonMapPreview;
