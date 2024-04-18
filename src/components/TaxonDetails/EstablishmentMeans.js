// @flow

import {
  Body2,
  Heading4
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import _ from "lodash";
import * as React from "react";
import { Trans } from "react-i18next";
import {
  Linking
} from "react-native";
import { useTranslation } from "sharedHooks";

const baseUrl = "https://www.inaturalist.org";

type Props = {
  taxon: object
}

const EstablishmentMeans = ( { taxon }: Props ): React.Node => {
  const { t } = useTranslation( );

  const establishmentMeans = taxon?.establishment_means?.establishment_means;

  const displayEstablishmentMeansText = ( ) => {
    const placeName = taxon.establishment_means.place.display_name;
    if ( establishmentMeans === "native" ) {
      return t( "Native-to-place", { place: placeName } );
    }
    if ( establishmentMeans === "introduced" ) {
      return t( "Introduced-to-place", { place: placeName } );
    }
    if ( establishmentMeans === "endemic" ) {
      return t( "Endemic-to-place", { place: placeName } );
    }
    return "";
  };

  const displaySourceListText = ( ) => {
    let url = baseUrl;

    const listedTaxon = _.find( taxon.listed_taxa, lt => (
      lt.place.id === taxon.establishment_means.place.id
      && lt.establishment_means === establishmentMeans
    ) );

    // refer to web implementation:
    // https://github.com/inaturalist/inaturalist/blob/aedd35bd74bfb2a6d8c6c98427f25f9b5222410e/app/webpack/taxa/show/containers/establishment_header_container.js
    if ( listedTaxon ) {
      url += `/listed_taxa/${listedTaxon.id}`;
    } else if ( taxon.establishment_means.id ) {
      url += `/listed_taxa/${taxon.establishment_means.id}`;
    }

    if ( !listedTaxon?.list?.title ) return null;

    return (
      <Trans
        i18nKey="Source-List"
        values={{ source: listedTaxon.list.title }}
        components={[
          <Body2 />,
          <Body2
            className="text-inatGreen underline"
            onPress={( ) => Linking.openURL( url )}
          />
        ]}
      />
    );
  };

  return taxon?.establishment_means && (
    <View className="mb-6">
      <Heading4 className="mb-3">{t( "ESTABLISHMENT-MEANS-header" )}</Heading4>
      <Body2>
        {displayEstablishmentMeansText( )}
        {" "}
        {displaySourceListText( )}
      </Body2>
    </View>
  );
};

export default EstablishmentMeans;
