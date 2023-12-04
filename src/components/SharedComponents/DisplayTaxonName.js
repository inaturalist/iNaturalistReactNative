// @flow
import classNames from "classnames";
import { Body1Bold, Body3, Body4 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import Taxon from "realmModels/Taxon";
import { generateTaxonPieces } from "sharedHelpers/taxon";
import useTranslation from "sharedHooks/useTranslation";

const rankNames = {
  // $FlowIgnore
  10: "species",
  // $FlowIgnore
  20: "genus",
  // $FlowIgnore
  30: "family",
  // $FlowIgnore
  40: "order",
  // $FlowIgnore
  50: "class",
  // $FlowIgnore
  60: "phylum",
  // $FlowIgnore
  70: "kingdom"
};

type Props = {
  color?: string,
  keyBase?: string,
  layout?: "horizontal" | "vertical",
  scientificNameFirst?: boolean,
  small?: boolean,
  taxon: Object,
  withdrawn?: boolean
};

const DisplayTaxonName = ( {
  color,
  keyBase = "",
  layout = "horizontal",
  scientificNameFirst = false,
  small = false,
  taxon,
  withdrawn
}: Props ): Node => {
  const { t } = useTranslation( );

  const textClass = useCallback( ( ) => {
    const textColorClass = color || "text-darkGray";
    if ( withdrawn ) {
      return "text-darkGray opacity-50 line-through";
    }
    return textColorClass;
  }, [color, withdrawn] );

  const renderTaxonName = useCallback( ( ) => {
    const taxonPojo = typeof ( taxon.toJSON ) === "function"
      ? taxon.toJSON( )
      : taxon;

    // this is mostly for the ARCamera, but might be helpful to display elsewhere
    if ( taxonPojo?.rank_level && !taxonPojo?.rank ) {
      // console.log( "taxon: ", taxon );
      taxonPojo.rank = rankNames[taxonPojo?.rank_level];
    }

    const {
      commonName,
      scientificNamePieces,
      rankPiece,
      rankLevel,
      rank
    } = generateTaxonPieces( taxonPojo );
    const isHorizontal = layout === "horizontal";
    const getSpaceChar = showSpace => ( showSpace && isHorizontal
      ? " "
      : "" );

    const scientificNameComponent = scientificNamePieces?.map( ( piece, index ) => {
      const isItalics = piece !== rankPiece && (
        rankLevel <= Taxon.SPECIES_LEVEL || rankLevel === Taxon.GENUS_LEVEL
      );
      const spaceChar = ( ( index !== scientificNamePieces.length - 1 ) || isHorizontal )
        ? " "
        : "";
      const text = piece + spaceChar;
      const TextComponent = scientificNameFirst || !commonName
        ? Body1Bold
        : Body3;
      return (
        isItalics
          ? (
            <TextComponent
              // eslint-disable-next-line react/no-array-index-key
              key={`DisplayTaxonName-${keyBase}-${taxon.id}-${rankLevel}-${piece}-${index}`}
              className={classNames( "italic", textClass() )}
            >
              {text}
            </TextComponent>
          )
          : text
      );
    } );

    if ( rank && rankLevel > 10 ) {
      scientificNameComponent.unshift( `${rank} ` );
    }

    const TopTextComponent = !small
      ? Body1Bold
      : Body3;
    const BottomTextComponent = !small
      ? Body3
      : Body4;

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
        <TopTextComponent
          className={textClass()}
          numberOfLines={scientificNameFirst
            ? 1
            : 3}
        >
          {
            ( scientificNameFirst || !commonName )
              ? scientificNameComponent
              : `${commonName}${
                getSpaceChar( !scientificNameFirst )
              }`
          }
        </TopTextComponent>

        {
          commonName && (
            <BottomTextComponent className={textClass()}>
              {scientificNameFirst
                ? commonName
                : scientificNameComponent}
            </BottomTextComponent>
          )
        }
      </View>
    );
  }, [
    keyBase,
    scientificNameFirst,
    layout,
    small,
    taxon,
    textClass
  ] );

  if ( !taxon ) {
    return (
      <Body1Bold className={textClass()} numberOfLines={1}>
        {t( "unknown" )}
      </Body1Bold>
    );
  }

  return renderTaxonName( );
};

export default DisplayTaxonName;
