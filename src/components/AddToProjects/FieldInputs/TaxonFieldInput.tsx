import ExploreTaxonSearchModal from "components/Explore/Modals/ExploreTaxonSearchModal";
import { Body3 } from "components/SharedComponents";
import { Pressable } from "components/styledComponents";
import React, { useState } from "react";
import type { RealmTaxon } from "realmModels/types";
import { useTranslation } from "sharedHooks";

interface Props {
  obsFieldId: number;
}

const TaxonFieldInput = ( { obsFieldId }: Props ) => {
  const { t } = useTranslation( );
  console.log( "obsFieldId", obsFieldId );
  const [showModal, setShowModal] = useState( false );
  const updateTaxon = ( selectedTaxon: RealmTaxon | null ) => {
    console.log( "selectedTaxon", selectedTaxon );
  };

  return (
    <>
      <ExploreTaxonSearchModal
        showModal={showModal}
        closeModal={( ) => setShowModal( false )}
        updateTaxon={updateTaxon}
      />
      <Pressable
        accessibilityRole="button"
        onPress={( ) => setShowModal( true )}
      >
        <Body3 className="pt-1 color-darkGrayDisabled">
          {t( "Select-a-species" )}
        </Body3>
      </Pressable>
    </>
  );
};

export default TaxonFieldInput;
