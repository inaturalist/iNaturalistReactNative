// @flow
import classNames from "classnames";
import { Body1, Body3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import Taxon from "realmModels/Taxon";
import { generateTaxonPieces } from "sharedHelpers/taxon";

type Props = {
  scientificNameFirst?: boolean,
  taxon: Object,
  layout?: "horizontal" | "vertical",
  color?: string
};

const DisplayTaxonName = ( {
  layout = "horizontal",
  scientificNameFirst = false,
  taxon,
  color
}: Props ): Node => {
  const { t } = useTranslation( );

  const textColorClass = color || "text-darkGray";

  if ( !taxon ) {
    return (
      <Body1 className={textColorClass} numberOfLines={1}>
        {t( "unknown" )}
      </Body1>
    );
  }

  const {
    commonName,
    scientificNamePieces,
    rankPiece,
    rankLevel,
    rank
  } = generateTaxonPieces( taxon );
  const isHorizontal = layout === "horizontal";
  const getSpaceChar = showSpace => ( showSpace && isHorizontal ? " " : "" );

  const scientificNameComponent = scientificNamePieces.map( ( piece, index ) => {
    const isItalics = piece !== rankPiece && (
      rankLevel <= Taxon.SPECIES_LEVEL || rankLevel === Taxon.GENUS_LEVEL
    );
    const spaceChar = ( ( index !== scientificNamePieces.length - 1 ) || isHorizontal ) ? " " : "";
    const text = piece + spaceChar;
    const TextComponent = scientificNameFirst || !commonName ? Body1 : Body3;
    return (
      isItalics
        ? (
          <TextComponent
            key={`DisplayTaxonName-${taxon.id}-${piece}`}
            className={classNames( "italic", textColorClass )}
          >
            {text}
          </TextComponent>
        )
        : text
    );
  } );

  if ( rankLevel > 10 ) {
    scientificNameComponent.unshift( `${rank} ` );
  }

  return (
    <View
      testID="display-taxon-name"
      // 03032023 amanda - it doesn't look to me like we need these styles at all,
      // and they're making the common name and sci name show up on the same
      // line. not sure if i'm missing context here
      // className={classNames( "flex", null, {
      //   "flex-row items-end flex-wrap w-11/12": isHorizontal
      // } )}
    >
      <Body1
        className={textColorClass}
        numberOfLines={scientificNameFirst ? 1 : 3}
      >
        {
          ( scientificNameFirst || !commonName )
            ? scientificNameComponent
            : `${commonName}${
              getSpaceChar( !scientificNameFirst )
            }`
        }
      </Body1>

      {
       commonName && (
       <Body3 className={textColorClass}>
         {scientificNameFirst ? commonName : scientificNameComponent}
       </Body3>
       )
      }
    </View>
  );
};

export default DisplayTaxonName;
