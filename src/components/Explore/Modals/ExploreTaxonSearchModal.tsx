// @flow

import { useNavigation } from "@react-navigation/native";
import ExploreTaxonSearch from "components/Explore/SearchScreens/ExploreTaxonSearch";
import Modal from "components/SharedComponents/Modal";
import type { Node } from "react";
import React, { useState } from "react";

type Props = {
  closeModal: Function,
  hideInfoButton?: boolean,
  showModal: boolean,
  updateTaxon: Function
};

const ExploreTaxonSearchModal = ( {
  closeModal,
  hideInfoButton,
  showModal,
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
          hideInfoButton={hideInfoButton}
          onPressInfo={taxon => {
            setDetailTaxonId( taxon.id );
            closeModal();
          }}
          updateTaxon={updateTaxon}
        />
      )}
    />
  );
};

export default ExploreTaxonSearchModal;
