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
  onTaxonChosen: Function
};

const IconicTaxonChooser = ( { taxon, before, onTaxonChosen }: Props ): Node => {
  const [selectedIcon, setSelectedIcon] = useState( null );
  const iconicTaxa = useIconicTaxa( { reload: false } );
  const isIconic = taxon?.id && iconicTaxa.filtered( `id = ${taxon?.id}` );
  const { t } = useTranslation( );

  const iconicTaxonNames = iconicTaxa.map( iconicTaxon => ( {
    iconName: iconicTaxon.name.toLowerCase( ),
    commonName: iconicTaxon.preferred_common_name || iconicTaxon.name
  } ) );
  iconicTaxonNames.push( {
    iconName: "unknown",
    commonName: t( "Unknown-organism" )
  } );

  useEffect( ( ) => {
    if ( !isIconic ) { return; }
    setSelectedIcon( taxon.name.toLowerCase( ) );
  }, [isIconic, taxon] );

  const renderIcon = ( { item } ) => {
    const isSelected = selectedIcon === item.iconName;
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
        testID={`IconicTaxonButton.${item.iconName}`}
      >
        <INatIconButton
          icon={`iconic-${item.iconName}`}
          size={22}
          onPress={( ) => {
            setSelectedIcon( item.iconName );
            onTaxonChosen( item.iconName );
          }}
          color={isSelected && colors.white}
          accessibilityLabel={item.commonName}
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
      data={iconicTaxonNames}
      horizontal
      renderItem={renderIcon}
      showsHorizontalScrollIndicator={false}
      ListHeaderComponent={renderHeader}
      accessibilityRole="radiogroup"
    />
  );
};

export default IconicTaxonChooser;
