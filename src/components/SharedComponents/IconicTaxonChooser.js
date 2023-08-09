// @flow
import classnames from "classnames";
import { INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { FlatList } from "react-native";
import colors from "styles/tailwindColors";

type Props = {
  taxon: Object,
  before: any,
  onTaxonChosen: Function
};

const IconicTaxonChooser = ( { taxon, before, onTaxonChosen }: Props ): Node => {
  const [selectedIcon, setSelectedIcon] = useState( null );

  const isIconic = taxon.iconic_taxon_name;

  const iconicTaxonIcons = [
    "plantae",
    "insecta",
    "aves",
    "animalia",
    "fungi",
    "arachnida",
    "mollusica",
    "mammalia",
    "reptilia",
    "amphibia",
    "actinopterygii",
    "chromista",
    "protozoa",
    "unknown"
  ];

  useEffect( ( ) => {
    if ( !isIconic ) { return; }
    setSelectedIcon( isIconic.toLowerCase( ) );
  }, [isIconic] );

  const renderIcon = ( { item } ) => {
    const isSelected = selectedIcon === item;
    return (
      <View
        className={
          classnames(
            "border-darkGray rounded-full border border-[2px] mr-4 justify-center",
            {
              "bg-darkGray": isSelected
            }
          )
        }
        accessibilityRole="radio"
        accessibilityState={{
          selected: isSelected
        }}
        testID={`IconicTaxonButton.${item}`}
      >
        <INatIconButton
          icon={`iconic-${item}`}
          size={25}
          onPress={( ) => {
            setSelectedIcon( item );
            onTaxonChosen( item );
          }}
          color={isSelected && colors.white}
        />
      </View>
    );
  };

  const renderHeader = ( ) => {
    if ( before ) {
      return (
        <View className="mr-4">
          {before}
        </View>
      );
    }
    return null;
  };

  return (
    <View className="flex-row mt-[11px]">
      <FlatList
        data={iconicTaxonIcons}
        horizontal
        renderItem={renderIcon}
        showsHorizontalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        accessibilityRole="radiogroup"
      />
    </View>
  );
};

export default IconicTaxonChooser;
