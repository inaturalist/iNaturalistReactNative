// @flow

import {
  DisplayTaxonName,
  Heading1,
  Heading4,
  Subheading1
} from "components/SharedComponents";
import SpeciesSeenCheckmark from "components/SharedComponents/SpeciesSeenCheckmark";
import {
  View
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  optionalClasses?: any,
  taxon?: {
    rank: string,
    rank_level: number,
    id: number
  }
}

function translatedRank( rank, t ) {
  switch ( rank ) {
    case "stateofmatter": return t( "Ranks-STATEOFMATTER" );
    case "kingdom": return t( "Ranks-KINGDOM" );
    case "phylum": return t( "Ranks-PHYLUM" );
    case "subphylum": return t( "Ranks-SUBPHYLUM" );
    case "superclass": return t( "Ranks-SUPERCLASS" );
    case "class": return t( "Ranks-CLASS" );
    case "subclass": return t( "Ranks-SUBCLASS" );
    case "infraclass": return t( "Ranks-INFRACLASS" );
    case "subterclass": return t( "Ranks-SUBTERCLASS" );
    case "superorder": return t( "Ranks-SUPERORDER" );
    case "order": return t( "Ranks-ORDER" );
    case "suborder": return t( "Ranks-SUBORDER" );
    case "infraorder": return t( "Ranks-INFRAORDER" );
    case "parvorder": return t( "Ranks-PARVORDER" );
    case "zoosection": return t( "Ranks-ZOOSECTION" );
    case "zoosubsection": return t( "Ranks-ZOOSUBSECTION" );
    case "superfamily": return t( "Ranks-SUPERFAMILY" );
    case "epifamily": return t( "Ranks-EPIFAMILY" );
    case "family": return t( "Ranks-FAMILY" );
    case "subfamily": return t( "Ranks-SUBFAMILY" );
    case "supertribe": return t( "Ranks-SUPERTRIBE" );
    case "tribe": return t( "Ranks-TRIBE" );
    case "subtribe": return t( "Ranks-SUBTRIBE" );
    case "genus": return t( "Ranks-GENUS" );
    case "genushybrid": return t( "Ranks-GENUSHYBRID" );
    case "subgenus": return t( "Ranks-SUBGENUS" );
    case "section": return t( "Ranks-SECTION" );
    case "subsection": return t( "Ranks-SUBSECTION" );
    case "complex": return t( "Ranks-COMPLEX" );
    case "species": return t( "Ranks-SPECIES" );
    case "hybrid": return t( "Ranks-HYBRID" );
    case "subspecies": return t( "Ranks-SUBSPECIES" );
    case "variety": return t( "Ranks-VARIETY" );
    case "form": return t( "Ranks-FORM" );
    case "infrahybrid": return t( "Ranks-INFRAHYBRID" );
    default: return t( `Ranks-${rank.toUpperCase( )}` );
  }
}

const TaxonDetailsTitle = ( {
  optionalClasses,
  taxon
}: Props ): Node => {
  const { t } = useTranslation( );

  return (
    <View className="flex-1 flex-col ml-4">
      { taxon?.rank && (
        <View className="flex-row items-center">
          <Heading4 className={optionalClasses}>
            {translatedRank( taxon.rank, t )}
          </Heading4>
          {taxon.rank_level <= 10 && (
            <View className="ml-3">
              <SpeciesSeenCheckmark taxonId={taxon.id} />
            </View>
          )}
        </View>
      ) }
      <DisplayTaxonName
        taxon={taxon}
        color={optionalClasses}
        topTextComponent={Heading1}
        bottomTextComponent={Subheading1}
      />
    </View>
  );
};

export default TaxonDetailsTitle;
