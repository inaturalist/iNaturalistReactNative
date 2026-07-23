import { useNetInfo } from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import type { ApiTaxon } from "api/types";
import {
  SearchHeader,
  TaxonResult,
  TaxonSearch,
  ViewWrapper,
} from "components/SharedComponents";
import {
  MY_OBSERVATIONS_ACTION,
  useMyObservations,
} from "providers/MyObservationsContext";
import React, { useCallback, useState } from "react";
import { Alert } from "react-native";
import type { RealmTaxon, RealmUser } from "realmModels/types";
import { taxonDisplayName } from "sharedHelpers/taxon";
import { useCurrentUser, useTranslation } from "sharedHooks";
import useTaxonSearch from "sharedHooks/useTaxonSearch";

const SearchMyObservationsTaxon = ( ) => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const { state, dispatch } = useMyObservations( );
  const { searchedTaxon } = state;
  const currentUser = useCurrentUser( ) as RealmUser | null;
  const { isConnected } = useNetInfo( );

  const [taxonQuery, setTaxonQuery] = useState( ( ) => (
    searchedTaxon
      ? taxonDisplayName( searchedTaxon, currentUser )
      : ""
  ) );

  const { taxa, isLoading, isLocal } = useTaxonSearch( taxonQuery );

  const closeScreen = useCallback( ( ) => navigation.goBack( ), [navigation] );

  const onTaxonSelected = useCallback( ( newTaxon: ApiTaxon | null ) => {
    if ( newTaxon && typeof newTaxon.id === "number" && newTaxon.name ) {
      if ( currentUser && !isConnected ) {
        Alert.alert(
          t( "You-are-offline" ),
          t( "Please-try-again-when-you-are-online" ),
        );
        return;
      }
      // useTaxonSearch can return either ApiTaxon-shaped or RealmTaxon-shaped
      // taxa depending on the source, so we have to check for both here.
      // TODO: normalize taxa at ingest.
      const realmTaxon = newTaxon as RealmTaxon;
      const iconUri = newTaxon.default_photo?.url
        || realmTaxon.defaultPhoto?.url;
      const preferredCommonName = newTaxon.preferred_common_name
        || realmTaxon.preferredCommonName;
      dispatch( {
        type: MY_OBSERVATIONS_ACTION.SET_TAXON_SEARCH,
        searchTaxon: {
          id: newTaxon.id,
          name: newTaxon.name,
          preferredCommonName,
          iconUri,
        },
      } );
    } else {
      dispatch( { type: MY_OBSERVATIONS_ACTION.CLEAR_TAXON_SEARCH } );
    }
    closeScreen( );
  }, [closeScreen, currentUser, dispatch, isConnected, t] );

  const resetSearch = useCallback( ( ) => {
    setTaxonQuery( "" );
    dispatch( { type: MY_OBSERVATIONS_ACTION.CLEAR_TAXON_SEARCH } );
    closeScreen( );
  }, [closeScreen, dispatch] );

  const renderItem = useCallback(
    // no-unused-prop-types failing for components defined at runtime seems to
    // be a bug. These props are clearly used
    // eslint-disable-next-line react/no-unused-prop-types
    ( { item: taxon, index }: { item: ApiTaxon; index: number } ) => (
      <TaxonResult
        first={index === 0}
        fetchRemote={false}
        handleTaxonOrEditPress={( ) => onTaxonSelected( taxon )}
        showCheckmark={false}
        taxon={taxon}
        testID={`SearchMyObservations.taxa.${taxon.id}`}
      />
    ),
    [onTaxonSelected],
  );

  return (
    <ViewWrapper>
      <SearchHeader
        onClose={closeScreen}
        headerText={t( "SEARCH" )}
        onReset={resetSearch}
        resetDisabled={!searchedTaxon}
        testID="SearchMyObservationsTaxon.close"
      />
      <TaxonSearch
        isLoading={isLoading}
        isLocal={isLocal}
        query={taxonQuery}
        renderItem={renderItem}
        setQuery={setTaxonQuery}
        taxa={taxa}
      />
    </ViewWrapper>
  );
};

export default SearchMyObservationsTaxon;
