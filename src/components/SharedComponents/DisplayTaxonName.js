// @flow
import classNames from "classnames";
import {
  Body1Bold, Body3, Body4, INatText
} from "components/SharedComponents";
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
  bottomTextComponent?: Function,
  color?: string,
  keyBase?: string,
  layout?: "horizontal" | "vertical",
  scientificNameFirst?: boolean,
  small?: boolean,
  taxon: Object,
  topTextComponent?: Function,
  withdrawn?: boolean
};

const DisplayTaxonName = ( {
  bottomTextComponent: BottomTextComponentProp,
  color,
  keyBase = "",
  layout = "vertical",
  scientificNameFirst = false,
  small = false,
  taxon,
  topTextComponent: TopTextComponentProp,
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
      return (
        isItalics
          ? (
            <INatText
              // eslint-disable-next-line react/no-array-index-key
              key={`DisplayTaxonName-${keyBase}-${taxon.id}-${rankLevel}-${piece}-${index}`}
              className={classNames( "italic font-normal", textClass() )}
            >
              {text}
            </INatText>
          )
          : text
      );
    } );

    if ( rank && rankLevel > 10 ) {
      scientificNameComponent.unshift( `${rank} ` );
    }

    let TopTextComponent = TopTextComponentProp;
    if ( !TopTextComponent ) {
      TopTextComponent = !small
        ? Body1Bold
        : Body3;
    }
    let BottomTextComponent = BottomTextComponentProp;
    if ( !BottomTextComponent ) {
      BottomTextComponent = !small
        ? Body3
        : Body4;
    }

    return (
      <View
        testID="display-taxon-name"
        className={classNames( "flex", null, {
          "flex-row items-end flex-wrap w-11/12": isHorizontal
        } )}
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
    BottomTextComponentProp,
    keyBase,
    layout,
    scientificNameFirst,
    small,
    taxon,
    textClass,
    TopTextComponentProp
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
