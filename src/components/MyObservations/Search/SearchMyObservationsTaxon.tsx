import { useNavigation } from "@react-navigation/native";
import type { ApiTaxon } from "api/types";
// TODO: ExploreSearchHeader is a generic back/title/reset button header that previously
// was only used in explore. It should be promoted to components/SharedComponents now that it's
// shared. The cross-feature import below works for now but will be fixed in a follow-up.
import ExploreSearchHeader from "components/Explore/SearchScreens/ExploreSearchHeader";
import {
  TaxonResult,
  TaxonSearch,
  ViewWrapper,
} from "components/SharedComponents";
import {
  MY_OBSERVATIONS_ACTION,
  useMyObservations,
} from "providers/MyObservationsContext";
import React, { useCallback, useState } from "react";
import type { RealmTaxon } from "realmModels/types";
import { useTranslation } from "sharedHooks";
import useTaxonSearch from "sharedHooks/useTaxonSearch";

const SearchMyObservationsTaxon = ( ) => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const { dispatch } = useMyObservations( );
  const [taxonQuery, setTaxonQuery] = useState( "" );

  const { taxa, isLoading, isLocal } = useTaxonSearch( taxonQuery );

  const closeScreen = useCallback( ( ) => navigation.goBack( ), [navigation] );

  const onTaxonSelected = useCallback( ( newTaxon: ApiTaxon | null ) => {
    if ( newTaxon && typeof newTaxon.id === "number" && newTaxon.name ) {
      // useTaxonSearch can return either ApiTaxon-shaped or RealmTaxon-shaped
      // taxa depending on the source, so we have to check for both here.
      // TODO: normalize taxa at ingest.
      const iconUri = newTaxon.default_photo?.url
        || ( newTaxon as unknown as RealmTaxon ).defaultPhoto?.url;
      dispatch( {
        type: MY_OBSERVATIONS_ACTION.SET_TAXON_SEARCH,
        searchTaxon: {
          id: newTaxon.id,
          name: newTaxon.name,
          preferred_common_name: newTaxon.preferred_common_name,
          iconUri,
        },
      } );
    } else {
      dispatch( { type: MY_OBSERVATIONS_ACTION.CLEAR_TAXON_SEARCH } );
    }
    closeScreen( );
  }, [closeScreen, dispatch] );

  const resetSearch = useCallback( ( ) => setTaxonQuery( "" ), [] );

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
      <ExploreSearchHeader
        closeModal={closeScreen}
        headerText={t( "SEARCH" )}
        resetFilters={resetSearch}
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
