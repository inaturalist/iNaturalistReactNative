import type { ApiTaxon } from "api/types";
import classnames from "classnames";
import {
  Body1, Body3, Body4
} from "components/SharedComponents";
import ScientificName from "components/SharedComponents/ScientificName";
import { Text, View } from "components/styledComponents";
import React, { useMemo } from "react";
import type { TextProps } from "react-native";
import type { RealmTaxon } from "realmModels/types";
import { generateTaxonPieces } from "sharedHelpers/taxon";
import useTranslation from "sharedHooks/useTranslation";

const rankNames: Record<number, string> = {
  10: "species",
  20: "genus",
  30: "family",
  40: "order",
  50: "class",
  60: "phylum",
  70: "kingdom"
};

interface Props {
  bottomTextComponent?: React.ComponentType<TextProps>;
  color?: string;
  ellipsizeCommonName?: boolean;
  numberOfLinesBottomText?: number;
  keyBase?: string;
  layout?: "horizontal" | "vertical";
  removeStyling?: boolean;
  prefersCommonNames?: boolean;
  scientificNameFirst?: boolean;
  showOneNameOnly?: boolean;
  selectable?: boolean;
  small?: boolean;
  taxon: RealmTaxon | ApiTaxon;
  textCentered?: boolean;
  topTextComponent?: React.ComponentType<TextProps>;
  underlineTopText?: boolean;
  withdrawn?: boolean;
}

const DisplayTaxonName = ( {
  bottomTextComponent: BottomTextComponentProp,
  color,
  ellipsizeCommonName,
  numberOfLinesBottomText,
  keyBase = "",
  layout = "vertical",
  removeStyling = false,
  prefersCommonNames = true,
  scientificNameFirst = false,
  showOneNameOnly = false,
  selectable,
  small = false,
  taxon,
  textCentered,
  topTextComponent: TopTextComponentProp,
  underlineTopText = false,
  withdrawn
}: Props ) => {
  const { t } = useTranslation( );

  const textClassName = useMemo( ( ) => {
    const classes = [];
    if ( textCentered ) classes.push( "text-center" );
    if ( withdrawn ) {
      return `text-darkGray opacity-50 line-through ${classes.join( " " )}`;
    }
    classes.push( color || "text-darkGray" );
    return classes.join( " " );
  }, [
    color,
    textCentered,
    withdrawn
  ] );

  if ( !taxon || !taxon.id ) {
    return (
      <Body1 className={textClassName} numberOfLines={1}>
        {t( "Unknown--taxon" )}
      </Body1>
    );
  }

  const taxonPojo = typeof ( taxon.toJSON ) === "function"
    ? taxon.toJSON( )
    : taxon;

  // this is mostly for the AICamera, but might be helpful to display elsewhere
  const processedTaxon = taxonPojo?.rank_level && !taxonPojo?.rank
    ? { ...taxonPojo, rank: rankNames[taxonPojo.rank_level] }
    : taxonPojo;

  const {
    commonName,
    scientificNamePieces,
    rankPiece,
    rankLevel,
    rank
  } = generateTaxonPieces( processedTaxon );
  const isHorizontal = layout === "horizontal";
  const getSpaceChar = ( showSpace: boolean ) => ( showSpace && isHorizontal
    ? " "
    : "" );

  let TopTextComponent = TopTextComponentProp;
  if ( !TopTextComponent ) {
    TopTextComponent = small
      ? Body3
      : Body1;
  }
  let BottomTextComponent = BottomTextComponentProp;
  if ( !BottomTextComponent ) {
    BottomTextComponent = small
      ? Body4
      : Body3;
  }

  const setNumberOfLines = ( ) => {
    if ( scientificNameFirst || ellipsizeCommonName || showOneNameOnly ) {
      return 2;
    }
    return 3;
  };

  const topTextComponent = (
    <TopTextComponent
      className={classnames(
        textClassName,
        {
          underline: underlineTopText
        }
      )}
      numberOfLines={setNumberOfLines( )}
      ellipsizeMode="tail"
      selectable={selectable}
      maxFontSizeMultiplier={1.5}
    >
      {
        ( scientificNameFirst || !commonName || !prefersCommonNames )
          ? (
            <ScientificName
              scientificNamePieces={scientificNamePieces}
              rankPiece={rankPiece}
              rankLevel={rankLevel}
              rank={rank}
              fontComponent={TopTextComponent}
              isHorizontal={isHorizontal}
              textClassName={textClassName}
              taxonId={taxon.id}
              keyBase={`${keyBase}-top`}
              isTitle
              isFirst={scientificNameFirst && prefersCommonNames}
              maxFontSizeMultiplier={1.5}
            />
          )
          : `${commonName}${
            !removeStyling
              ? getSpaceChar( !scientificNameFirst )
              : ""
          }`
      }
    </TopTextComponent>
  );

  const showBottomTextComponent = commonName && prefersCommonNames && !showOneNameOnly;

  const bottomTextComponent = showBottomTextComponent && (
    <BottomTextComponent
      className={classnames( textClassName, "mt-[3px]" )}
      selectable={selectable}
      numberOfLines={numberOfLinesBottomText}
    >
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
            textClassName={textClassName}
            taxonId={taxon.id}
            keyBase={`${keyBase}-bot`}
            maxFontSizeMultiplier={1.5}
          />
        )}
    </BottomTextComponent>
  );

  // styling using a View component results in two components being out of
  // alignment when passing components into <Trans />, like in DisagreementText,
  // so in these cases we want to return text only
  if ( removeStyling ) {
    return (
      <Text testID={`display-taxon-name-no-styling.${taxon.id}`}>
        {topTextComponent}
        {bottomTextComponent && (
          <>
            {getSpaceChar( !scientificNameFirst )}
            (
            {bottomTextComponent}
            )
          </>
        )}
      </Text>
    );
  }

  return (
    <View
      testID={`display-taxon-name.${taxon.id}`}
      className={classnames( "flex", {
        "flex-row items-end flex-wrap w-11/12": isHorizontal
      } )}
    >
      {topTextComponent}
      {bottomTextComponent}
    </View>
  );
};

export default DisplayTaxonName;
