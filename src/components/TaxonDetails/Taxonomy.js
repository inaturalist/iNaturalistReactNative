// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import {
  Body2,
  Heading4,
  INatIcon
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import Taxon from "realmModels/Taxon";
import { generateTaxonPieces } from "sharedHelpers/taxon";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  taxon?: Object
}

const Taxonomy = ( { taxon: currentTaxon }: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );

  const displayCommonName = ( commonName, options ) => (
    <Body2 className={
      classnames( "font-bold mr-1", {
        "text-inatGreen": options?.isCurrentTaxon,
        underline: !options?.isCurrentTaxon
      } )
    }
    >
      {commonName}
    </Body2>
  );

  const displayScientificName = ( rank, scientificNamePieces, rankLevel, rankPiece, options ) => {
    const isCurrentTaxon = options?.isCurrentTaxon;
    const hasCommonName = options?.hasCommonName;
    const isChild = rankLevel < 10;
    const underline = ( isChild && !isCurrentTaxon ) || !hasCommonName;
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
              italic: isItalics,
              "font-bold": ( isChild && !isCurrentTaxon ) || !hasCommonName,
              "text-inatGreen": isCurrentTaxon
            } )
          }
        >
          {text}
        </Body2>
      );
    } );

    return isChild
      ? (
        <View className="flex-row">
          <View className="ml-2 mr-1">
            <INatIcon name="arrow-turn-down-right" size={11} />
          </View>
          <Body2 className={
            classnames( {
              underline
            } )
          }
          >
            { scientificNameComponent }
          </Body2>
        </View>
      )
      : (
        <Body2 className={
          classnames( {
            underline,
            "text-inatGreen": isCurrentTaxon,
            "-ml-1 ": !hasCommonName
          } )
        }
        >
          {hasCommonName && <Body2>(</Body2>}
          {rankLevel > 10 && (
            <Body2
              className={
                classnames( {
                  "font-bold": !hasCommonName
                } )
              }
            >
              {`${rank} `}
            </Body2>
          )}
          {scientificNameComponent}
          {hasCommonName && <Body2>)</Body2>}
        </Body2>
      );
  };

  const renderTaxon = useCallback( ( taxon, options ) => {
    const isCurrentTaxon = options?.isCurrentTaxon;
    const isChild = options?.isChild;
    const {
      commonName,
      scientificNamePieces,
      rankPiece,
      rankLevel,
      rank
    } = generateTaxonPieces( taxon );

    return (
      <Pressable
        accessibilityRole="button"
        className="flex-row py-2"
        key={taxon?.id}
        disabled={isCurrentTaxon}
        onPress={( ) => navigation.navigate( "TaxonDetails", { id: taxon?.id } )}
      >
        {!isChild && displayCommonName( commonName, { isCurrentTaxon } )}
        {displayScientificName(
          rank,
          scientificNamePieces,
          rankLevel,
          rankPiece,
          { isCurrentTaxon, hasCommonName: commonName }
        )}
      </Pressable>
    );
  }, [navigation] );

  const displayTaxonomy = useCallback(
    ( ) => (
      <>
        {currentTaxon?.ancestors?.map( ancestor => renderTaxon( ancestor ) )}
        {renderTaxon( currentTaxon, { isCurrentTaxon: true } )}
        {currentTaxon?.children?.map( child => renderTaxon( child, { isChild: true } ) )}
      </>
    ),
    [currentTaxon, renderTaxon]
  );

  return (
    <View className="mb-5">
      <Heading4 className="my-3">
        {t( "TAXONOMY-header" )}
      </Heading4>
      {displayTaxonomy( )}
    </View>
  );
};

export default Taxonomy;
