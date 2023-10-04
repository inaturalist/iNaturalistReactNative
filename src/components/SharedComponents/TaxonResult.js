// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import { DisplayTaxonName, INatIconButton } from "components/SharedComponents";
import ObsImagePreview from "components/SharedComponents/ObservationsFlashList/ObsImagePreview";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";

import ConfidenceInterval from "./ConfidenceInterval";

type Props = {
  taxon: Object,
  handleCheckmarkPress: Function,
  testID: string,
  clearBackground?: boolean,
  confidence?: number,
  activeColor?: string,
  confidencePosition?: string,
  first?: boolean
};

const TaxonResult = ( {
  taxon,
  handleCheckmarkPress,
  testID,
  clearBackground,
  confidence,
  activeColor,
  confidencePosition = "photo",
  first = false
}: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const theme = useTheme( );
  const taxonImage = { uri: taxon?.default_photo?.url };

  return (
    <View
      className={
        classnames(
          "flex-row items-center justify-between px-4 py-3",
          {
            "border-b-[1px] border-lightGray": !clearBackground,
            "mx-4": clearBackground,
            "border-t-[1px]": first
          }
        )
      }
      testID={testID}
    >
      <Pressable
        className="flex-row items-center w-16 grow"
        onPress={() => navigation.navigate( "TaxonDetails", { id: taxon.id } )}
        accessible
        accessibilityRole="link"
        accessibilityLabel={t( "Navigate-to-taxon-details" )}
        accessibilityValue={{ text: taxon.name }}
        accessibilityState={{ disabled: false }}
      >
        <ObsImagePreview
          source={taxonImage}
          testID={`${testID}.photo`}
          iconicTaxonName={taxon?.iconic_taxon_name}
          className="rounded-xl"
        />
        {( confidence && confidencePosition === "photo" ) && (
          <View className="absolute -bottom-5 w-[62px]">
            <ConfidenceInterval
              confidence={confidence}
              activeColor={activeColor}
            />
          </View>
        )}
        <View className="shrink ml-3">
          <DisplayTaxonName
            taxon={taxon}
            layout="horizontal"
            color={clearBackground && "text-white"}
          />
          {( confidence && confidencePosition === "text" ) && (
            <View className="absolute -bottom-3 w-[62px]">
              <ConfidenceInterval
                confidence={confidence}
                activeColor={activeColor}
              />
            </View>
          )}
        </View>
      </Pressable>
      <View className="flex-row items-center">
        <INatIconButton
          icon="info-circle-outline"
          size={22}
          onPress={( ) => navigation.navigate( "TabNavigator", {
            screen: "ObservationsStackNavigator",
            params: {
              screen: "TaxonDetails",
              params: {
                id: taxon.id,
                lastScreen: "Suggestions"
              }
            }
          } )}
          color={clearBackground && theme.colors.onSecondary}
          accessibilityLabel={t( "Information" )}
          accessibilityHint={t( "Navigate-to-taxon-details" )}
        />
        <INatIconButton
          className="ml-2"
          icon={clearBackground
            ? "checkmark-circle-outline"
            : "checkmark-circle"}
          size={40}
          color={clearBackground
            ? theme.colors.onSecondary
            : theme.colors.secondary}
          onPress={handleCheckmarkPress}
          accessibilityLabel={t( "Checkmark" )}
          accessibilityHint={t( "Add-this-ID" )}
        />
      </View>
    </View>
  );
};

export default TaxonResult;
