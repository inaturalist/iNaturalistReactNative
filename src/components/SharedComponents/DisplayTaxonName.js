// @flow
import classNames from "classnames";
import {
  Body1, Body3, Body4
} from "components/SharedComponents";
import ScientificName from "components/SharedComponents/ScientificName";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
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
  ellipsizeCommonName?: boolean,
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
  ellipsizeCommonName,
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

    let TopTextComponent = TopTextComponentProp;
    if ( !TopTextComponent ) {
      TopTextComponent = !small
        ? Body1
        : Body3;
    }
    let BottomTextComponent = BottomTextComponentProp;
    if ( !BottomTextComponent ) {
      BottomTextComponent = !small
        ? Body3
        : Body4;
    }

    const setNumberOfLines = ( ) => {
      if ( scientificNameFirst ) {
        return 1;
      }
      if ( ellipsizeCommonName ) {
        return 2;
      }
      return 3;
    };

    return (
      <View
        testID="display-taxon-name"
        className={classNames( "flex", null, {
          "flex-row items-end flex-wrap w-11/12": isHorizontal
        } )}
      >
        <TopTextComponent
          className={textClass( )}
          numberOfLines={setNumberOfLines( )}
          ellipsizeMode="tail"
        >
          {
            ( scientificNameFirst || !commonName )
              ? (
                <ScientificName
                  scientificNamePieces={scientificNamePieces}
                  rankPiece={rankPiece}
                  rankLevel={rankLevel}
                  rank={rank}
                  fontComponent={TopTextComponent}
                  isHorizontal={isHorizontal}
                  textClass={textClass}
                  taxonId={taxon.id}
                  keyBase={keyBase}
                  isTitle
                />
              )
              : `${commonName}${
                getSpaceChar( !scientificNameFirst )
              }`
          }
        </TopTextComponent>

        {
          commonName && (
            <BottomTextComponent className={textClass( )}>
              {scientificNameFirst
                ? commonName
                : (
                  <ScientificName
                    scientificNamePieces={scientificNamePieces}
                    rankPiece={rankPiece}
                    rankLevel={rankLevel}
                    rank={rank}
                    fontComponent={BottomTextComponent}
                    isHorizontal={isHorizontal}
                    textClass={textClass}
                    taxonId={taxon.id}
                    keyBase={keyBase}
                  />
                )}
            </BottomTextComponent>
          )
        }
      </View>
    );
  }, [
    BottomTextComponentProp,
    ellipsizeCommonName,
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
      <Body1 className={textClass( )} numberOfLines={1}>
        {t( "unknown" )}
      </Body1>
    );
  }

  return renderTaxonName( );
};

export default DisplayTaxonName;
