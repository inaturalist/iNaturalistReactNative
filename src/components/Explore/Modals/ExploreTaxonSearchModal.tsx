import { useNavigation } from "@react-navigation/native";
import type { ApiTaxon } from "api/types";
import ExploreTaxonSearch from "components/Explore/SearchScreens/ExploreTaxonSearch";
import Modal from "components/SharedComponents/Modal";
import React, { useState } from "react";
import type { RealmTaxon } from "realmModels/types";

type Props = {
  closeModal: ( ) => void;
  hideInfoButton?: boolean;
  onPressInfo?: ( ) => void;
  showModal: boolean;
  updateTaxon: ( taxon: RealmTaxon | null ) => void;
};

const ExploreTaxonSearchModal = ( {
  closeModal,
  hideInfoButton,
  onPressInfo,
  showModal,
  updateTaxon
}: Props ) => {
  const navigation = useNavigation( );
  const [detailTaxonId, setDetailTaxonId] = useState<number | undefined | null>( null );

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
          onPressInfo={( taxon: RealmTaxon | ApiTaxon ) => {
            setDetailTaxonId( taxon.id );
            closeModal();
            if ( onPressInfo ) {
              onPressInfo( );
            }
          }}
          updateTaxon={updateTaxon}
        />
      )}
    />
  );
};

export default ExploreTaxonSearchModal;
