import classnames from "classnames";
import { Body2 } from "components/SharedComponents";
import React from "react";
import Taxon from "realmModels/Taxon";
import { translatedRank } from "sharedHelpers/taxon";
import useTranslation from "sharedHooks/useTranslation";

interface Props {
  rank: string;
  scientificNamePieces: string[];
  rankLevel: number;
  rankPiece: string;
  isCurrentTaxon?: boolean;
  hasCommonName?: boolean;
  scientificNameFirst?: boolean;
}

const TaxonomyScientificName = ( {
  rank,
  scientificNamePieces,
  rankLevel,
  rankPiece,
  isCurrentTaxon,
  hasCommonName,
  scientificNameFirst,
}: Props ) => {
  const { t } = useTranslation( );
  const underline = ( !hasCommonName || scientificNameFirst ) && !isCurrentTaxon;
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
        key={text}
        className={
          classnames( {
            italic: isItalics,
            "font-bold": !hasCommonName || scientificNameFirst,
            "text-inatGreen": isCurrentTaxon,
          } )
        }
      >
        {text}
      </Body2>
    );
  } );

  return (
    <Body2 className={
      classnames( {
        underline,
        "text-inatGreen": isCurrentTaxon,
        "-ml-1 ": !hasCommonName,
        "font-bold": scientificNameFirst,
      } )
    }
    >
      {hasCommonName && !scientificNameFirst && (
        <Body2 className={
          classnames( {
            "text-inatGreen": isCurrentTaxon,
          } )
        }
        >
          (
        </Body2>
      )}
      {rankLevel > 10 && (
        <Body2
          className={
            classnames( {
              "font-bold": !hasCommonName || scientificNameFirst,
              underline,
              "text-inatGreen": isCurrentTaxon,
            } )
          }
        >
          { translatedRank( rank, t ) }
        </Body2>
      )}
      { " " }
      {scientificNameComponent}
      {hasCommonName && !scientificNameFirst && (
        <Body2 className={
          classnames( {
            "text-inatGreen": isCurrentTaxon,
          } )
        }
        >
          )
        </Body2>
      )}
    </Body2>
  );
};

export default TaxonomyScientificName;
