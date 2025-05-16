import classNames from "classnames";
import { Body3 } from "components/SharedComponents";
import { random } from "lodash";
import React from "react";
import type { TextProps } from "react-native";
import Taxon from "realmModels/Taxon";
import { translatedRank } from "sharedHelpers/taxon.ts";
import useTranslation from "sharedHooks/useTranslation.ts";

interface Props {
  fontComponent: React.ComponentType<TextProps>;
  isHorizontal: boolean;
  isFirst?: boolean;
  isTitle?: boolean;
  keyBase: string;
  rank?: string;
  rankLevel?: number;
  rankPiece?: string;
  scientificNamePieces?: string[];
  taxonId: string | number;
  textClassName: string;
  maxFontSizeMultiplier: number;
}

const ScientificName = ( {
  fontComponent,
  isHorizontal,
  isTitle,
  isFirst,
  keyBase,
  rank,
  rankLevel,
  rankPiece,
  scientificNamePieces,
  taxonId,
  textClassName,
  maxFontSizeMultiplier
}: Props ) => {
  const { t } = useTranslation( );
  const scientificNameArray = scientificNamePieces?.map( ( piece, index ) => {
    const isItalics = piece !== rankPiece && rankLevel && (
      rankLevel <= Taxon.SPECIES_LEVEL || rankLevel === Taxon.GENUS_LEVEL
    );
    const spaceChar = ( ( index !== scientificNamePieces.length - 1 ) || isHorizontal )
      ? " "
      : "";
    const text = ( isFirst || index !== scientificNamePieces.length - 1 )
      ? piece + spaceChar
      : piece;
    const FontComponent = fontComponent || Body3;

    return (
      <FontComponent
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        key={`DisplayTaxonName-${keyBase}-${taxonId}-${rankLevel}-${piece}-${random( 0, 10000 )}`}
        className={classNames(
          "font-normal",
          textClassName,
          {
            "font-light": !isTitle,
            italic: isItalics
          }
        )}
      >
        {text}
      </FontComponent>
    );
  } );

  if ( rank && rankLevel && rankLevel > Taxon.SPECIES_LEVEL ) {
    scientificNameArray.unshift( " " );
    scientificNameArray.unshift( translatedRank( rank, t ) );
  }

  return (
    scientificNameArray
  );
};

export default ScientificName;
