// @flow

import { useNavigation } from "@react-navigation/native";
import ExploreTaxonSearch from "components/Explore/SearchScreens/ExploreTaxonSearch";
import Modal from "components/SharedComponents/Modal";
import type { Node } from "react";
import React, { useState } from "react";

type Props = {
    showModal: boolean,
    closeModal: Function,
    updateTaxon: Function,
  };

const ExploreTaxonSearchModal = ( {
  showModal,
  closeModal,
  updateTaxon
}: Props ): Node => {
  const navigation = useNavigation( );
  const [detailTaxonId, setDetailTaxonId] = useState( null );

  return (
    <Modal
      showModal={showModal}
      fullScreen
      closeModal={closeModal}
      disableSwipeDirection
      onModalHide={( ) => {
        if ( detailTaxonId ) {
          navigation.push( "TaxonDetails", { id: detailTaxonId } );
        }
        setDetailTaxonId( null );
      }}
      modal={(
        <ExploreTaxonSearch
          closeModal={closeModal}
          updateTaxon={updateTaxon}
          onPressInfo={taxon => {
            setDetailTaxonId( taxon.id );
            closeModal();
          }}

        />
      )}
    />
  );
};

export default ExploreTaxonSearchModal;
