// @flow

import { useNavigation } from "@react-navigation/native";
import {
  FullWidthButton,
  Heading4
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { useCurrentUser, useTranslation } from "sharedHooks";

import TaxonomyTaxon from "./TaxonomyTaxon";

type Props = {
  taxon: Object,
  hideNavButtons: boolean
}

const Taxonomy = ( { taxon: currentTaxon, hideNavButtons }: Props ): Node => {
  const [viewChildren, setViewChildren] = useState( false );
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );
  const scientificNameFirst = currentUser?.prefers_scientific_name_first;

  const navigateToTaxonDetails = taxonId => (
    navigation.push( "TaxonDetails", { id: taxonId, hideNavButtons } )
  );

  return (
    <View className="mb-5">
      <Heading4 className="my-3">
        {t( "TAXONOMY-header" )}
      </Heading4>
      {currentTaxon.ancestors?.map( ancestor => (
        <TaxonomyTaxon
          currentUser={currentUser}
          key={ancestor.id}
          navigateToTaxonDetails={navigateToTaxonDetails}
          scientificNameFirst={scientificNameFirst}
          t={t}
          taxon={ancestor}
        />
      ) )}
      <TaxonomyTaxon
        currentUser={currentUser}
        isCurrentTaxon
        key={currentTaxon.id}
        navigateToTaxonDetails={navigateToTaxonDetails}
        scientificNameFirst={scientificNameFirst}
        t={t}
        taxon={currentTaxon}
      />
      {viewChildren && currentTaxon?.children?.map( child => (
        <TaxonomyTaxon
          currentUser={currentUser}
          isChild
          key={child.id}
          navigateToTaxonDetails={navigateToTaxonDetails}
          scientificNameFirst={scientificNameFirst}
          t={t}
          taxon={child}
        />
      ) )}
      {!viewChildren && currentTaxon?.children && (
        <FullWidthButton
          className="mt-3 w-full"
          onPress={( ) => setViewChildren( true )}
          text={t( "VIEW-CHILDREN-TAXA" )}
        />
      )}
    </View>
  );
};

export default Taxonomy;
