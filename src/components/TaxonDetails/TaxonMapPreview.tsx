import { searchObservations } from "api/observations";
import type { ApiTaxon } from "api/types";
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
import type { RealmTaxon } from "realmModels/types";
import { useTranslation } from "sharedHooks";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";

import TaxonDetailsTitle from "./TaxonDetailsTitle";

const ONE_HOUR_MS = 3600000;

interface Props {
  observation: object;
  showSpeciesSeenCheckmark: boolean;
  taxon: ApiTaxon | RealmTaxon;
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
  // TODO: enable fields if it makes sense
  // https://linear.app/inaturalist/issue/MOB-1360/enable-fields-for-searchobservations-in-taxonmappreview
  const {
    data: obsSearchResponse,
  } = useAuthenticatedQuery(
    ["fetchTaxonBoundingBox", taxon.id],
    optsWithAuth => searchObservations( {
      ...obsParams,
      return_bounds: true,
      per_page: 0,
      ttl: -1,
    }, optsWithAuth ),
    // The bounding box of a taxon's observations changes very slowly, so
    // avoid refetching on every mount.
    {
      enabled: !!taxon.id,
      gcTime: ONE_HOUR_MS,
      staleTime: ONE_HOUR_MS,
    },
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
