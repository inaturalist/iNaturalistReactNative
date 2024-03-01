// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import { DisplayTaxonName, INatIconButton } from "components/SharedComponents";
import ObsImagePreview from "components/SharedComponents/ObservationsFlashList/ObsImagePreview";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import { useTaxon, useTranslation } from "sharedHooks";

import ConfidenceInterval from "./ConfidenceInterval";

type Props = {
  activeColor?: string,
  clearBackground?: boolean,
  confidence?: number,
  confidencePosition?: string,
  fetchRemote?: boolean,
  first?: boolean,
  fromLocal?: boolean,
  handleCheckmarkPress: Function,
  handlePress: Function,
  showCheckmark?: boolean,
  taxon: Object,
  testID: string,
  white?: boolean
};

const TaxonResult = ( {
  activeColor,
  clearBackground,
  confidence,
  confidencePosition = "photo",
  fetchRemote = true,
  first = false,
  fromLocal = true,
  handleCheckmarkPress,
  handlePress,
  showCheckmark = true,
  taxon: taxonResult,
  testID,
  white = false
}: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const theme = useTheme( );
  // thinking about future performance, it might make more sense to batch
  // network requests for useTaxon instead of making individual API calls.
  // right now, this fetches a single taxon at a time on AR camera &
  // a short list of taxa from offline Suggestions
  const localTaxon = useTaxon( taxonResult, fetchRemote );
  const taxon = fromLocal
    ? localTaxon
    : taxonResult;
  const taxonImage = { uri: taxon?.default_photo?.url };

  const navToTaxonDetails = () => navigation.navigate( "TaxonDetails", { id: taxon.id } );

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
        onPress={handlePress || navToTaxonDetails}
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
          isSmall
          white={white}
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
          onPress={navToTaxonDetails}
          color={clearBackground && theme.colors.onSecondary}
          accessibilityLabel={t( "Information" )}
          accessibilityHint={t( "Navigate-to-taxon-details" )}
        />
        { showCheckmark
          && (
            <INatIconButton
              className="ml-2"
              icon={
                clearBackground
                  ? "checkmark-circle-outline"
                  : "checkmark-circle"
              }
              size={40}
              color={
                clearBackground
                  ? theme.colors.onSecondary
                  : theme.colors.secondary
              }
              onPress={() => handleCheckmarkPress( taxon )}
              accessibilityLabel={t( "Checkmark" )}
              accessibilityHint={t( "Add-this-ID" )}
              testID={`${testID}.checkmark`}
            />
          )}
      </View>
    </View>
  );
};

export default TaxonResult;
