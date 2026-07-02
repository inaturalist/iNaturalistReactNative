import classnames from "classnames";
import { INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useCallback } from "react";
import type { ListRenderItemInfo, StyleProp, ViewStyle } from "react-native";
import { FlatList } from "react-native";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props {
  accessibilityHint?: string;
  before?: React.ReactNode;
  chosen: string[];
  contentContainerStyle?: StyleProp<ViewStyle>;
  onTaxonChosen: ( taxon: string ) => void;
  testID?: string;
  withoutUnknown?: boolean;
}

const STYLESHEET = {
  alignItems: "center",
} as const;

const ICONIC_TAXA = [
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
  "unknown",
];

const EMPTY_CHOSEN: string[] = [];

const IconicTaxonChooser = ( {
  accessibilityHint,
  before,
  chosen = EMPTY_CHOSEN,
  contentContainerStyle = STYLESHEET,
  onTaxonChosen,
  testID,
  withoutUnknown,
}: Props ) => {
  const { t } = useTranslation( );
  const iconicTaxonIcons = withoutUnknown
    ? ICONIC_TAXA.filter( taxon => taxon !== "unknown" )
    : ICONIC_TAXA;
  const renderIcon = useCallback( ( { item: iconicTaxonName }: ListRenderItemInfo<string> ) => {
    const isSelected = chosen.indexOf( iconicTaxonName ) >= 0;
    return (
      <View
        className={
          classnames(
            "border-darkGray border border-[2px] mr-4 justify-center items-center",
            "h-[36px] w-[36px] rounded-full",
            {
              "bg-darkGray": isSelected,
            },
          )
        }
        accessibilityState={{
          selected: isSelected,
        }}
        testID={`IconicTaxonButton.${iconicTaxonName}`}
      >
        <INatIconButton
          icon={`iconic-${iconicTaxonName}`}
          size={22}
          onPress={( ) => {
            onTaxonChosen( iconicTaxonName );
          }}
          color={isSelected
            ? colors.white
            : undefined}
          accessibilityLabel={
            t( "Iconic-taxon-name", { iconicTaxon: iconicTaxonName } )
          }
          accessibilityHint={
            accessibilityHint
            ?? t( "Selects-iconic-taxon-X-for-identification", { iconicTaxon: iconicTaxonName } )
          }
          testID={`INatIconButton.IconicTaxonButton.${iconicTaxonName}`}
        />
      </View>
    );
  }, [
    accessibilityHint,
    chosen,
    onTaxonChosen,
    t,
  ] );

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
      ListHeaderComponent={renderHeader}
      contentContainerStyle={contentContainerStyle}
      data={iconicTaxonIcons}
      horizontal
      keyboardShouldPersistTaps="handled"
      renderItem={renderIcon}
      showsHorizontalScrollIndicator={false}
      testID={testID}
    />
  );
};

export default IconicTaxonChooser;
