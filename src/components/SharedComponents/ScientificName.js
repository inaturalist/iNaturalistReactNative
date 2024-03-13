// @flow
import classNames from "classnames";
import type { Node } from "react";
import React from "react";
import Taxon from "realmModels/Taxon";

import INatTextMedium from "./Typography/INatTextMedium";

type Props = {
    scientificNamePieces: Object,
    rankPiece: string,
    rankLevel: number,
    rank: string,
    fontComponent: Object,
    isHorizontal: boolean,
    textClass: Function,
    keyBase: string,
    taxonId: string,
    isTitle?: boolean
};

const ScientificName = ( {
  scientificNamePieces, rankPiece, rankLevel, fontComponent,
  isHorizontal, rank, textClass, keyBase, taxonId, isTitle
}: Props ): Node => {
  const scientificNameArray = scientificNamePieces?.map( ( piece, index ) => {
    const isItalics = piece !== rankPiece && (
      rankLevel <= Taxon.SPECIES_LEVEL || rankLevel === Taxon.GENUS_LEVEL
    );
    const spaceChar = ( ( index !== scientificNamePieces.length - 1 ) || isHorizontal )
      ? " "
      : "";
    const text = piece + spaceChar;
    const FontComponent = fontComponent || INatTextMedium;

    if ( isItalics ) {
      return (
        <FontComponent
          // eslint-disable-next-line react/no-array-index-key
          key={`DisplayTaxonName-${keyBase}-${taxonId}-${rankLevel}-${piece}-${index}`}
          className={classNames( "italic font-normal", textClass( ), {
            "font-light": !isTitle
          } )}
        >
          {text}
        </FontComponent>
      );
    }
    return (
      <FontComponent
        // eslint-disable-next-line react/no-array-index-key
        key={`DisplayTaxonName-${keyBase}-${taxonId}-${index}`}
      >
        {text}
      </FontComponent>
    );
  } );

  if ( rank && rankLevel > 10 ) {
    scientificNameArray.unshift( `${rank} ` );
  }

  return (
    scientificNameArray
  );
};

export default ScientificName;
