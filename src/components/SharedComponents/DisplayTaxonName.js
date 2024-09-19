// @flow
import classnames from "classnames";
import {
  Body1, Body3, Body4
} from "components/SharedComponents";
import ScientificName from "components/SharedComponents/ScientificName";
import { Text, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useMemo } from "react";
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
  removeStyling?: boolean,
  prefersCommonNames?: boolean,
  scientificNameFirst?: boolean,
  showOneNameOnly: boolean,
  selectable?: boolean,
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
  removeStyling = false,
  prefersCommonNames = true,
  scientificNameFirst = false,
  showOneNameOnly = false,
  selectable,
  small = false,
  taxon,
  topTextComponent: TopTextComponentProp,
  withdrawn
}: Props ): Node => {
  const { t } = useTranslation( );

  const textClassName = useMemo( ( ) => {
    const textColorClass = color || "text-darkGray";
    if ( withdrawn ) {
      return "text-darkGray opacity-50 line-through";
    }
    return textColorClass;
  }, [color, withdrawn] );

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
  console.log( commonName, "common name" );
  const isHorizontal = layout === "horizontal";
  const getSpaceChar = showSpace => ( showSpace && isHorizontal
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
    if ( scientificNameFirst ) {
      return 1;
    }
    if ( ellipsizeCommonName || showOneNameOnly ) {
      return 2;
    }
    return 3;
  };

  const topTextComponent = (
    <TopTextComponent
      className={textClassName}
      numberOfLines={setNumberOfLines( )}
      ellipsizeMode="tail"
      selectable={selectable}
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
          />
        )}
    </BottomTextComponent>
  );

  // styling using a View component results in two components being out of
  // alignment when passing components into <Trans />, like in DisagreementText,
  // so in these cases we want to return text only
  if ( removeStyling ) {
    return (
      <Text testID="display-taxon-name-no-styling">
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
      testID="display-taxon-name"
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
