// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { fetchTaxon } from "api/taxa";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import {
  ActivityIndicator,
  BackButton,
  Body2,
  INatIconButton,
  ScrollViewWrapper
} from "components/SharedComponents";
import {
  Image,
  LinearGradient,
  Pressable,
  View
} from "components/styledComponents";
import { compact } from "lodash";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useCallback, useState } from "react";
import { useTheme } from "react-native-paper";
import Photo from "realmModels/Photo";
import { log } from "sharedHelpers/logger";
import { useAuthenticatedQuery, useTranslation, useUserMe } from "sharedHooks";

import EstablishmentMeans from "./EstablishmentMeans";
import TaxonDetailsMediaViewerHeader from "./TaxonDetailsMediaViewerHeader";
import TaxonDetailsTitle from "./TaxonDetailsTitle";
import Taxonomy from "./Taxonomy";
import Wikipedia from "./Wikipedia";

const logger = log.extend( "TaxonDetails" );

const { useRealm } = RealmContext;

const TaxonDetails = ( ): Node => {
  const theme = useTheme( );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { id } = params;
  const { t } = useTranslation( );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const { remoteUser } = useUserMe( );

  const realm = useRealm( );
  const localTaxon = realm.objectForPrimaryKey( "Taxon", id );

  const taxonFetchParams = {
    place_id: remoteUser?.place_id
  };

  console.log( taxonFetchParams, "taxon fetch params" );

  // Note that we want to authenticate this to localize names, desc language, etc.
  const {
    data: remoteTaxon,
    isLoading,
    isError,
    error
  } = useAuthenticatedQuery(
    ["fetchTaxon", id],
    optsWithAuth => fetchTaxon( id, taxonFetchParams, optsWithAuth ),
    {
      enabled: !!remoteUser
    }
  );
  if ( error ) {
    logger.error( `Failed to retrieve taxon ${id}: ${error}` );
  }
  const taxon = remoteTaxon || localTaxon;

  const photos = compact(
    taxon?.taxonPhotos
      ? taxon.taxonPhotos.map( taxonPhoto => taxonPhoto.photo )
      : [taxon?.defaultPhoto]
  );

  const renderHeader = useCallback( ( { onClose } ) => (
    <TaxonDetailsMediaViewerHeader
      taxon={taxon}
      onClose={onClose}
    />
  ), [taxon] );

  const displayTaxonDetails = ( ) => {
    if ( isLoading ) {
      return <View className="m-3"><ActivityIndicator /></View>;
    }

    if ( isError || !taxon ) {
      return (
        <View className="m-3">
          <Body2>{t( "Error-Could-Not-Fetch-Taxon" )}</Body2>
        </View>
      );
    }

    return (
      <View className="mx-3">
        <EstablishmentMeans taxon={taxon} />
        <Wikipedia taxon={taxon} />
        <Taxonomy taxon={taxon} />
      </View>
    );
  };

  return (
    <ScrollViewWrapper testID={`TaxonDetails.${taxon?.id}`}>
      <View
        className="w-full h-[420px] mb-5"
      >
        <Pressable
          onPress={() => setMediaViewerVisible( true )}
          accessibilityLabel={t( "View-photo" )}
          accessibilityRole="link"
        >
          <Image
            testID="TaxonDetails.photo"
            className="w-full h-full"
            source={{
              uri: Photo.displayMediumPhoto( photos.at( 0 )?.url )
            }}
            accessibilityIgnoresInvertColors
          />
          <LinearGradient
            colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.5) 100%)"]}
            className="absolute w-full h-full"
          />
        </Pressable>
        <View className="absolute left-5 top-5">
          <BackButton
            color={theme.colors.onPrimary}
            onPress={( ) => navigation.goBack( )}
          />
        </View>
        <View className="absolute bottom-0 p-5 w-full flex-row items-center">
          <TaxonDetailsTitle taxon={taxon} optionalClasses="text-white" />
          <INatIconButton
            icon="compass-rose-outline"
            onPress={( ) => navigation.navigate( "TabNavigator", {
              screen: "ObservationsStackNavigator",
              params: {
                screen: "Explore"
              }
            } )}
            accessibilityLabel={t( "Explore" )}
            accessibilityHint={t( "Navigates-to-explore" )}
            size={30}
            color={theme.colors.onPrimary}
            // FWIW, IconButton has a little margin we can control and a
            // little padding that we can't control, so the negative margin
            // here is to ensure the visible icon is flush with the edge of
            // the container
            className="ml-5 bg-inatGreen rounded-full"
          />
        </View>
      </View>
      {displayTaxonDetails( )}
      <MediaViewerModal
        showModal={mediaViewerVisible}
        onClose={( ) => setMediaViewerVisible( false )}
        photos={photos}
        header={renderHeader}
      />
    </ScrollViewWrapper>
  );
};

export default TaxonDetails;
