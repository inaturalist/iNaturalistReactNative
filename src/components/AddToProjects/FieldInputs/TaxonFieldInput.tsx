import ExploreTaxonSearchModal from "components/Explore/Modals/ExploreTaxonSearchModal";
import { Body3, DisplayTaxon } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React, { useState } from "react";
import type { RealmTaxon } from "realmModels/types";
import { useTaxon, useTranslation } from "sharedHooks";

import useObservationFieldValue from "../hooks/useObservationFieldValue";

interface Props {
  obsFieldId: number;
}

const TaxonFieldInput = ( { obsFieldId }: Props ) => {
  const { t } = useTranslation( );
  const { value, setValue } = useObservationFieldValue( obsFieldId );
  const [showModal, setShowModal] = useState( false );
  const { taxon } = useTaxon( { id: value } );

  const updateTaxon = ( selectedTaxon: RealmTaxon | null ) => {
    if ( selectedTaxon?.id ) {
      setValue( String( selectedTaxon.id ) );
    } else {
      setValue( null );
    }
  };

  return (
    <>
      <ExploreTaxonSearchModal
        showModal={showModal}
        closeModal={( ) => setShowModal( false )}
        updateTaxon={updateTaxon}
      />
      {value && taxon
        ? (
          <View className="px-2.5 pt-4">
            <DisplayTaxon
              handlePress={( ) => setShowModal( true )}
              taxon={taxon}
            />
          </View>
        )
        : (
          <Pressable
            accessibilityRole="button"
            onPress={( ) => setShowModal( true )}
          >
            <Body3 className="pt-1 color-darkGrayDisabled">
              {t( "Select-a-species" )}
            </Body3>
          </Pressable>
        )}
    </>
  );
};

export default TaxonFieldInput;
