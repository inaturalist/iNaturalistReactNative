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
  confidence?: number
};

const TaxonResult = ( {
  taxon, handleCheckmarkPress, testID, clearBackground, confidence
}: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const theme = useTheme( );
  const taxonImage = { uri: taxon?.default_photo?.url };

  return (
    <View
      className={
        classnames(
          "flex-row items-center justify-between pl-3 py-1",
          {
            "border-[0.5px] border-lightGray": !clearBackground,
            "mx-4": clearBackground
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
        />
        {confidence && (
          <View className="absolute -bottom-5 w-[62px]">
            <ConfidenceInterval confidence={confidence} />
          </View>
        )}
        <View className="shrink ml-3">
          <DisplayTaxonName
            taxon={taxon}
            layout="horizontal"
            color={clearBackground && "text-white"}
          />
        </View>
      </Pressable>
      <View className="flex-row items-center">
        <INatIconButton
          icon="info-circle-outline"
          size={22}
          onPress={() => navigation.navigate( "TaxonDetails", { id: taxon.id } )}
          color={clearBackground && theme.colors.onSecondary}
          accessibilityRole="link"
          accessibilityLabel={t( "Navigate-to-taxon-details" )}
          accessibilityState={{ disabled: false }}
        />
        <INatIconButton
          className="mx-2"
          icon={clearBackground
            ? "checkmark-circle-outline"
            : "checkmark-circle"}
          size={40}
          color={clearBackground
            ? theme.colors.onSecondary
            : theme.colors.secondary}
          onPress={handleCheckmarkPress}
          accessibilityRole="button"
          accessibilityLabel={t( "Add-this-ID" )}
          accessibilityState={{ disabled: false }}
        />
      </View>
    </View>
  );
};

export default TaxonResult;
