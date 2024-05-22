// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import {
  Body2,
  Button,
  Heading4,
  INatIcon
} from "components/SharedComponents";
import { Pressable, Text, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback, useState } from "react";
import Taxon from "realmModels/Taxon";
import { accessibleTaxonName, generateTaxonPieces } from "sharedHelpers/taxon";
import { useCurrentUser, useTranslation } from "sharedHooks";

type Props = {
  taxon?: Object,
  hideNavButtons: boolean
}

const Taxonomy = ( { taxon: currentTaxon, hideNavButtons }: Props ): Node => {
  const [viewChildren, setViewChildren] = useState( false );
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );
  const scientificNameFirst = currentUser?.prefers_scientific_name_first;

  const displayCommonName = useCallback( ( commonName, options ) => (
    <Body2
      className={
        classnames( {
          "font-bold mr-1": !scientificNameFirst,
          "text-inatGreen": options?.isCurrentTaxon,
          underline: !options?.isCurrentTaxon && !scientificNameFirst
        } )
      }
    >
      {scientificNameFirst && commonName && "("}
      {commonName}
      {scientificNameFirst && commonName && ")"}
    </Body2>
  ), [scientificNameFirst] );

  const displayScientificName
    = useCallback( ( rank, scientificNamePieces, rankLevel, rankPiece, options ) => {
      const isCurrentTaxon = options?.isCurrentTaxon;
      const hasCommonName = options?.hasCommonName;
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
                "text-inatGreen": isCurrentTaxon
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
            "font-bold": scientificNameFirst
          } )
        }
        >
          {hasCommonName && !scientificNameFirst && (
            <Body2 className={
              classnames( {
                "text-inatGreen": isCurrentTaxon
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
                  "text-inatGreen": isCurrentTaxon
                } )
              }
            >
              {`${rank} `}
            </Body2>
          )}
          {scientificNameComponent}
          {hasCommonName && !scientificNameFirst && (
            <Body2 className={
              classnames( {
                "text-inatGreen": isCurrentTaxon
              } )
            }
            >
              )
            </Body2>
          )}
        </Body2>
      );
    }, [scientificNameFirst] );

  const renderTaxon = useCallback( ( taxon, options ) => {
    const id = taxon?.id || "";
    const isCurrentTaxon = options?.isCurrentTaxon;
    const isChild = options?.isChild;
    const {
      commonName,
      scientificNamePieces,
      rankPiece,
      rankLevel,
      rank
    } = generateTaxonPieces( taxon );
    const accessibleName = accessibleTaxonName( taxon, currentUser, t );
    const sciNameComponent = displayScientificName(
      rank,
      scientificNamePieces,
      rankLevel,
      rankPiece,
      {
        isCurrentTaxon,
        hasCommonName: commonName
      }
    );
    const comNameComponent = displayCommonName( commonName, { isCurrentTaxon } );

    return (
      <Pressable
        accessibilityRole="link"
        className="flex-row py-2"
        key={id}
        disabled={isCurrentTaxon}
        onPress={( ) => navigation.navigate( "TaxonDetails", { id, hideNavButtons } )}
        accessibilityLabel={accessibleName}
        accessibilityState={{
          disabled: isCurrentTaxon
        }}
        testID={`TaxonomyRow.${id}`}
      >
        {isChild && (
          <View className="mt-[2px] ml-2 mr-1">
            <INatIcon name="arrow-turn-down-right" size={11} />
          </View>
        )}
        <View className="flex-row flex-wrap shrink">
          <Text>
            {
              scientificNameFirst
                ? [sciNameComponent, " ", comNameComponent]
                : [comNameComponent, " ", sciNameComponent]
            }
          </Text>
        </View>
      </Pressable>
    );
  }, [currentUser, displayCommonName, displayScientificName, navigation,
    scientificNameFirst, t, hideNavButtons] );

  const displayTaxonomy = useCallback(
    ( ) => (
      <>
        {currentTaxon?.ancestors?.map( ancestor => renderTaxon( ancestor ) )}
        {renderTaxon( currentTaxon, { isCurrentTaxon: true } )}
        {viewChildren
          && currentTaxon?.children?.map( child => renderTaxon( child, {
            isChild: true
          } ) )}
      </>
    ),
    [currentTaxon, renderTaxon, viewChildren]
  );

  return (
    <View className="mb-5">
      <Heading4 className="my-3">
        {t( "TAXONOMY-header" )}
      </Heading4>
      {displayTaxonomy( )}
      {!viewChildren && currentTaxon?.children && (
        <Button
          className="mt-3"
          onPress={( ) => setViewChildren( true )}
          text={t( "VIEW-CHILDREN-TAXA" )}
        />
      )}
    </View>
  );
};

export default Taxonomy;
