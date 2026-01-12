import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Button,
  Heading4,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useState } from "react";
import { useCurrentUser, useTranslation } from "sharedHooks";

import TaxonomyTaxon from "./TaxonomyTaxon";

interface Props {
  taxon: object;
  hideNavButtons: boolean;
}

const Taxonomy = ( { taxon: currentTaxon, hideNavButtons }: Props ) => {
  const [viewChildren, setViewChildren] = useState( false );
  const navigation = useNavigation( );
  const route = useRoute( );
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );
  const scientificNameFirst = currentUser?.prefers_scientific_name_first;

  const navigateToTaxonDetails = ( taxonId: number ) => (
    navigation.push( "TaxonDetails", {
      // Ensure button mashing doesn't open multiple TaxonDetails instances
      key: `${route.key}-Taxonomy-TaxonDetails-${taxonId}`,
      id: taxonId,
      hideNavButtons,
      usesVision: false,
    } )
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
