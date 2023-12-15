// @flow

import classnames from "classnames";
import {
  Body2,
  Heading4
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";
import Taxon from "realmModels/Taxon";
import { generateTaxonPieces } from "sharedHelpers/taxon";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  taxon?: Object
}

const Taxonomy = ( { taxon: currentTaxon }: Props ): React.Node => {
  const { t } = useTranslation( );

  const displayCommonName = ( commonName, options ) => (
    <Body2 className={
      classnames( "font-bold mr-2 mb-3", {
        "text-inatGreen": options?.isCurrentTaxon,
        underline: !options?.isCurrentTaxon
      } )
    }
    >
      {commonName}
    </Body2>
  );

  const displayScientificName = ( rank, scientificNamePieces, rankLevel, rankPiece ) => {
    // italics part ported over from DisplayTaxonName
    const scientificNameComponent = scientificNamePieces?.map( ( piece, index ) => {
      const isItalics = piece !== rankPiece && (
        rankLevel <= Taxon.SPECIES_LEVEL || rankLevel === Taxon.GENUS_LEVEL
      );
      const spaceChar = ( ( index !== scientificNamePieces.length - 1 ) )
        ? " "
        : "";
      const text = piece + spaceChar;

      return (
        <Body2
          className={
            classnames( {
              italic: isItalics
            } )
          }
        >
          {text}
        </Body2>
      );
    } );

    return (
      <>
        <Body2>(</Body2>
        {rank && rankLevel > 10 && <Body2>{`${rank} `}</Body2>}
        {scientificNameComponent}
        <Body2>)</Body2>
      </>
    );
  };

  const renderTaxon = ( taxon, isCurrentTaxon ) => {
    const {
      commonName,
      scientificNamePieces,
      rankPiece,
      rankLevel,
      rank
    } = generateTaxonPieces( taxon );

    return (
      <View className="flex-row">
        {displayCommonName( commonName, { isCurrentTaxon } )}
        {displayScientificName( rank, scientificNamePieces, rankLevel, rankPiece )}
      </View>
    );
  };

  const displayTaxonomyList = ( ) => currentTaxon?.ancestors?.map( ancestor => (
    <View key={ancestor.id || currentTaxon.id}>
      {renderTaxon( ancestor )}
    </View>
  ) );

  return (
    <View className="mb-5">
      <Heading4 className="my-3">
        {t( "TAXONOMY-header" )}
      </Heading4>
      {displayTaxonomyList( )}
      {renderTaxon( currentTaxon, { isCurrentTaxon: true } )}
    </View>
  );
};

export default Taxonomy;
