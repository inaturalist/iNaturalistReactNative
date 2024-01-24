// @flow
import classnames from "classnames";
import { INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList } from "react-native";
import { useIconicTaxa, useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

type Props = {
  before: any,
  onTaxonChosen: Function,
  taxon: {
    id: number,
    name: string
  },
  testID?: string
};

const STYLESHEET = {
  alignItems: "center"
};

const iconicTaxonIcons = [
  "plantae",
  "insecta",
  "aves",
  "animalia",
  "fungi",
  "arachnida",
  "mollusca",
  "mammalia",
  "reptilia",
  "amphibia",
  "actinopterygii",
  "chromista",
  "protozoa",
  "unknown"
];

const IconicTaxonChooser = ( {
  before,
  onTaxonChosen,
  taxon,
  testID
}: Props ): Node => {
  const { t } = useTranslation( );
  const [selectedIcon, setSelectedIcon] = useState( null );
  const iconicTaxa = useIconicTaxa( { reload: false } );
  const isIconic = taxon?.id && iconicTaxa.filtered( `id = ${taxon?.id}` );

  useEffect( ( ) => {
    if ( !isIconic ) { return; }
    setSelectedIcon( taxon.name.toLowerCase( ) );
  }, [isIconic, taxon] );

  const renderIcon = useCallback( ( { item } ) => {
    const isSelected = selectedIcon === item;
    return (
      <View
        className={
          classnames(
            "border-darkGray border border-[2px] mr-4 justify-center items-center",
            "h-[36px] w-[36px] rounded-full",
            {
              "bg-darkGray": isSelected
            }
          )
        }
        accessibilityState={{
          selected: isSelected
        }}
        testID={`IconicTaxonButton.${item}`}
      >
        <INatIconButton
          icon={`iconic-${item}`}
          size={22}
          onPress={( ) => {
            setSelectedIcon( item );
            onTaxonChosen( item );
          }}
          color={isSelected && colors.white}
          accessibilityLabel={
            t( "Iconic-taxon-name", { iconicTaxon: item } )
          }
          accessibilityHint={
            t( "Selects-iconic-taxon-X-for-identification", { iconicTaxon: item } )
          }
        />
      </View>
    );
  }, [onTaxonChosen, t, selectedIcon] );

  const renderHeader = useCallback( ( ) => {
    if ( before ) {
      return (
        <View className="mr-4">
          {before}
        </View>
      );
    }
    return null;
  }, [before] );

  return (
    <FlatList
      data={iconicTaxonIcons}
      horizontal
      renderItem={renderIcon}
      showsHorizontalScrollIndicator={false}
      ListHeaderComponent={renderHeader}
      testID={testID}
      contentContainerStyle={STYLESHEET}
    />
  );
};

export default IconicTaxonChooser;
