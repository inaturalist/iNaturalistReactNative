import {
  INatIcon
} from "components/SharedComponents";
import { Pressable, Text, View } from "components/styledComponents";
import React from "react";
import { accessibleTaxonName, generateTaxonPieces } from "sharedHelpers/taxon";

import TaxonomyCommonName from "./TaxonomyCommonName";
import TaxonomyScientificName from "./TaxonomyScientificName";

interface Props {
  currentUser: { login: string, id: number };
  isChild?: boolean;
  isCurrentTaxon?: boolean;
  navigateToTaxonDetails: ( _taxonId: number ) => void;
  scientificNameFirst?: boolean;
  t: Function;
  taxon: {
    id: number;
    name: string;
    preferred_common_name?: string;
    rank: string;
    rank_level: number;
  };
}

const TaxonomyTaxon = ( {
  currentUser,
  isChild,
  isCurrentTaxon,
  navigateToTaxonDetails,
  scientificNameFirst,
  t,
  taxon
}: Props ) => {
  const {
    commonName,
    scientificNamePieces,
    rankPiece,
    rankLevel,
    rank
  } = generateTaxonPieces( taxon );
  const accessibleName = accessibleTaxonName( taxon, currentUser, t );
  const sciNameComponent = (
    <TaxonomyScientificName
      hasCommonName={!!commonName}
      isCurrentTaxon={isCurrentTaxon}
      rank={rank}
      rankLevel={rankLevel}
      rankPiece={rankPiece}
      scientificNameFirst={scientificNameFirst}
      scientificNamePieces={scientificNamePieces}
    />
  );
  const comNameComponent = (
    <TaxonomyCommonName commonName={commonName} isCurrentTaxon={isCurrentTaxon} />
  );

  return (
    <Pressable
      accessibilityRole="link"
      className="flex-row py-2"
      key={taxon.id}
      disabled={isCurrentTaxon}
      onPress={() => navigateToTaxonDetails( taxon.id )}
      accessibilityLabel={accessibleName}
      accessibilityState={{
        disabled: isCurrentTaxon
      }}
      testID={`TaxonomyTaxon.${taxon.id}`}
    >
      {isChild && (
        <View className="mt-[2px] ml-2 mr-1">
          <INatIcon name="arrow-turn-down-right" size={11} />
        </View>
      )}
      <View className="flex-row flex-wrap shrink">
        <Text>
          {
            scientificNameFirst
              ? (
                <>
                  { sciNameComponent }
                  { " " }
                  { comNameComponent }
                </>
              )
              : (
                <>
                  { comNameComponent }
                  { " " }
                  { sciNameComponent }
                </>
              )
          }
        </Text>
      </View>
    </Pressable>
  );
};

export default TaxonomyTaxon;
