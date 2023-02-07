// @flow
import classnames from "classnames";
import { Body1, Body3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { generateTaxonPieces } from "sharedHelpers/taxon";

type Props = {
  item: Object,
  layout?: "horizontal" | "vertical",
};

const DisplayTaxonName = ( {
  layout = "horizontal",
  item: { user, taxon }
}: Props ): Node => {
  const { t } = useTranslation( );

  if ( !taxon ) {
    return <Body1 numberOfLines={1}>{t( "unknown" )}</Body1>;
  }

  const {
    commonName,
    scientificNamePieces,
    rankPiece,
    rankLevel,
    rank
  } = generateTaxonPieces( taxon );
  const isHorizontal = layout === "horizontal";
  const scientificNameFirst = user?.prefers_scientific_name_first;
  const getSpaceChar = showSpace => ( showSpace && isHorizontal ? " " : "" );

  const scientificNameComponent = scientificNamePieces.map( ( piece, index ) => {
    const isItalics = rankLevel <= 10 && piece !== rankPiece;
    const spaceChar = ( ( index !== scientificNamePieces.length - 1 ) || isHorizontal ) ? " " : "";
    const text = piece + spaceChar;
    const TextComponent = scientificNameFirst || !commonName ? Body1 : Body3;
    return (
      isItalics ? <TextComponent className="italic">{text}</TextComponent> : text
    );
  } );

  if ( rankLevel > 10 ) {
    scientificNameComponent.unshift( `${rank} ` );
  }

  return (
    <View
      testID="display-taxon-name"
      className={classnames( "flex", null, {
        "flex-row items-end flex-wrap w-11/12": isHorizontal
      } )}
    >
      <Body1
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
       <Body3>
         {scientificNameFirst ? commonName : scientificNameComponent}
       </Body3>
       )
      }
    </View>
  );
};

export default DisplayTaxonName;
