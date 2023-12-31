// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import {
  Body2,
  Button,
  Heading4,
  INatIcon
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback, useState } from "react";
import Taxon from "realmModels/Taxon";
import { generateTaxonPieces } from "sharedHelpers/taxon";
import { useTranslation } from "sharedHooks";

type Props = {
  taxon?: Object
}

const Taxonomy = ( { taxon: currentTaxon }: Props ): Node => {
  const [viewChildren, setViewChildren] = useState( false );
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
    const underline = !isCurrentTaxon && !hasCommonName;
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
              "font-bold": underline,
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
          "-ml-1 ": !hasCommonName
        } )
      }
      >
        {hasCommonName && (
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
                "font-bold": !hasCommonName,
                "text-inatGreen": isCurrentTaxon
              } )
            }
          >
            {`${rank} `}
          </Body2>
        )}
        {scientificNameComponent}
        {hasCommonName && (
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
  };

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

    return (
      <Pressable
        accessibilityRole="button"
        className="flex-row py-2 flex-wrap"
        key={id}
        disabled={isCurrentTaxon}
        onPress={( ) => navigation.navigate( "TaxonDetails", { id } )}
        accessibilityState={{
          disabled: isCurrentTaxon
        }}
        accessibilityLabel={t( "Navigate-to-taxon-details" )}
        testID={`TaxonomyRow.${id}`}
      >
        {isChild && (
          <View className="ml-2 mr-1">
            <INatIcon name="arrow-turn-down-right" size={11} />
          </View>
        )}
        {displayCommonName( commonName, { isCurrentTaxon } )}
        {displayScientificName(
          rank,
          scientificNamePieces,
          rankLevel,
          rankPiece,
          {
            isCurrentTaxon,
            hasCommonName: commonName
          }
        )}
      </Pressable>
    );
  }, [navigation, t] );

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
