// @flow
import classnames from "classnames";
import { INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { useIconicTaxa, useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

type Props = {
  taxon: Object,
  before: any,
  onTaxonChosen: Function,
  testID?: string
};

const IconicTaxonChooser = ( {
  taxon, before, onTaxonChosen, testID
}: Props ): Node => {
  const { t } = useTranslation( );
  const [selectedIcon, setSelectedIcon] = useState( null );
  const iconicTaxa = useIconicTaxa( { reload: false } );
  const isIconic = taxon?.id && iconicTaxa.filtered( `id = ${taxon?.id}` );

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

  useEffect( ( ) => {
    if ( !isIconic ) { return; }
    setSelectedIcon( taxon.name.toLowerCase( ) );
  }, [isIconic, taxon] );

  const renderIcon = ( { item } ) => {
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
        accessibilityRole="radio"
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
          accessibilityLabel={item}
          accessibilityHint={
            t( "Selects-iconic-taxon-X-for-identification", { iconicTaxon: item } )
          }
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
    <FlatList
      data={iconicTaxonIcons}
      horizontal
      renderItem={renderIcon}
      showsHorizontalScrollIndicator={false}
      ListHeaderComponent={renderHeader}
      accessibilityRole="radiogroup"
      testID={testID}
    />
  );
};

export default IconicTaxonChooser;
