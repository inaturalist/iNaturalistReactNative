// @flow

import {
  TaxonResult,
  TaxonSearch
} from "components/SharedComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useState
} from "react";
import { useTranslation } from "sharedHooks";
import useTaxonSearch from "sharedHooks/useTaxonSearch.ts";

import ExploreSearchHeader from "./ExploreSearchHeader";

type Props = {
  closeModal: Function,
  hideInfoButton?: boolean,
  onPressInfo?: Function,
  updateTaxon: Function
};

const ExploreTaxonSearch = ( {
  closeModal,
  hideInfoButton,
  onPressInfo,
  updateTaxon
}: Props ): Node => {
  const { t } = useTranslation( );
  const [taxonQuery, setTaxonQuery] = useState( "" );

  const {
    taxa,
    isLoading,
    isLocal
  } = useTaxonSearch( taxonQuery );

  const onTaxonSelected = useCallback( async newTaxon => {
    updateTaxon( newTaxon );
    closeModal();
  }, [closeModal, updateTaxon] );

  const resetTaxon = useCallback(
    ( ) => {
      updateTaxon( null );
      closeModal();
    },
    [updateTaxon, closeModal]
  );

  const renderItem = useCallback( ( { item: taxon, index } ) => (
    <TaxonResult
      first={index === 0}
      handleTaxonOrEditPress={() => onTaxonSelected( taxon )}
      hideInfoButton={hideInfoButton}
      onPressInfo={onPressInfo}
      showCheckmark={false}
      taxon={taxon}
      testID={`Search.taxa.${taxon.id}`}
    />
  ), [
    hideInfoButton,
    onPressInfo,
    onTaxonSelected
  ] );

  return (
    <TaxonSearch
      header={(
        <ExploreSearchHeader
          closeModal={closeModal}
          headerText={t( "SEARCH-TAXA" )}
          resetFilters={resetTaxon}
          testID="ExploreTaxonSearch.close"
        />
      )}
      isLoading={isLoading}
      isLocal={isLocal}
      query={taxonQuery}
      renderItem={renderItem}
      setQuery={setTaxonQuery}
      taxa={taxa}
    />
  );
};

export default ExploreTaxonSearch;
