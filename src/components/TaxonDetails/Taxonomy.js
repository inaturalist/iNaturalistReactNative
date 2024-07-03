// @flow

import { useNavigation } from "@react-navigation/native";
import {
  Button,
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

  const navigateToTaxonDetails = ( ) => (
    navigation.navigate( "TaxonDetails", { id: currentTaxon.id, hideNavButtons } )
  );

  return (
    <View className="mb-5">
      <Heading4 className="my-3">
        {t( "TAXONOMY-header" )}
      </Heading4>
      {currentTaxon.ancestors?.map( ancestor => (
        <TaxonomyTaxon
          currentUser={currentUser}
          onPress={navigateToTaxonDetails}
          scientificNameFirst={scientificNameFirst}
          t={t}
          taxon={ancestor}
        />
      ) )}
      <TaxonomyTaxon
        currentUser={currentUser}
        isCurrentTaxon
        onPress={navigateToTaxonDetails}
        scientificNameFirst={scientificNameFirst}
        t={t}
        taxon={currentTaxon}
      />
      {viewChildren && currentTaxon?.children?.map( child => (
        <TaxonomyTaxon
          currentUser={currentUser}
          isChild
          onPress={navigateToTaxonDetails}
          scientificNameFirst={scientificNameFirst}
          t={t}
          taxon={child}
        />
      ) )}
      {!viewChildren && currentTaxon?.children && (
        <Button
          className="mt-3"
          onPress={( ) => setViewChildren( true )}
          text={t( "VIEW-CHILDREN-TAXA" )}
        />
      )}
    </View>
  );
};

export default Taxonomy;
