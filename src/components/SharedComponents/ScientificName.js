// @flow
import classNames from "classnames";
import { Body3 } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import Taxon from "realmModels/Taxon";

type Props = {
  fontComponent: any,
  isHorizontal: boolean,
  isTitle?: boolean,
  keyBase: string,
  rank: string,
  rankLevel: number,
  rankPiece: string,
  scientificNamePieces: any,
  taxonId: string,
  textClassName?: string
};

const ScientificName = ( {
  fontComponent,
  isHorizontal,
  isTitle,
  keyBase,
  rank,
  rankLevel,
  rankPiece,
  scientificNamePieces,
  taxonId,
  textClassName
}: Props ): Node => {
  const scientificNameArray = scientificNamePieces?.map( ( piece, index ) => {
    const isItalics = piece !== rankPiece && (
      rankLevel <= Taxon.SPECIES_LEVEL || rankLevel === Taxon.GENUS_LEVEL
    );
    const spaceChar = ( ( index !== scientificNamePieces.length - 1 ) || isHorizontal )
      ? " "
      : "";
    const text = piece + spaceChar;
    const FontComponent = fontComponent || Body3;

    return (
      <FontComponent
        key={`DisplayTaxonName-${keyBase}-${taxonId}-${rankLevel}-${piece}`}
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

  if ( rank && rankLevel > Taxon.SPECIES_LEVEL ) {
    scientificNameArray.unshift( `${rank} ` );
  }

  return (
    scientificNameArray
  );
};

export default ScientificName;
