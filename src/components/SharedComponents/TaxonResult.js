// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import {
  ActivityIndicator,
  DisplayTaxonName,
  INatIconButton
} from "components/SharedComponents";
import ObsImagePreview from "components/SharedComponents/ObservationsFlashList/ObsImagePreview";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import { accessibleTaxonName } from "sharedHelpers/taxon";
import { useCurrentUser, useTaxon, useTranslation } from "sharedHooks";

import ConfidenceInterval from "./ConfidenceInterval";

type Props = {
  accessibilityLabel: string,
  activeColor?: string,
  asListItem?: boolean,
  clearBackground?: boolean,
  confidence?: number,
  confidencePosition?: string,
  fetchRemote?: boolean,
  first?: boolean,
  fromLocal?: boolean,
  handleCheckmarkPress: Function,
  handlePress: Function,
  showInfoButton?: boolean,
  showCheckmark?: boolean,
  showEditButton?: boolean,
  taxon: Object,
  testID: string,
  white?: boolean
};

const TaxonResult = ( {
  accessibilityLabel,
  activeColor,
  asListItem = true,
  clearBackground,
  confidence,
  confidencePosition = "photo",
  fetchRemote = true,
  first = false,
  fromLocal = true,
  handleCheckmarkPress,
  handlePress,
  hideNavButtons = false,
  showEditButton = false,
  showInfoButton = true,
  showCheckmark = true,
  taxon: taxonProp,
  testID,
  white = false
}: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const theme = useTheme( );
  const currentUser = useCurrentUser( );
  // thinking about future performance, it might make more sense to batch
  // network requests for useTaxon instead of making individual API calls.
  // right now, this fetches a single taxon at a time on AI camera &
  // a short list of taxa from offline Suggestions
  const { taxon: localTaxon, isLoading } = useTaxon( taxonProp, fetchRemote );
  const usableTaxon = fromLocal
    ? localTaxon
    : taxonProp;
  // useTaxon could return null, and it's at least remotely possible taxonProp is null
  if ( !usableTaxon ) return null;

  const taxonImage = { uri: usableTaxon?.default_photo?.url };
  const accessibleName = accessibleTaxonName( usableTaxon, currentUser, t );

  const navToTaxonDetails = () => navigation.navigate( "TaxonDetails", {
    id: usableTaxon?.id,
    hideNavButtons
  } );

  return (
    <View
      className={
        classnames(
          "flex-row items-center justify-between",
          {
            "px-4": asListItem,
            "border-b-[1px] border-lightGray": asListItem,
            "border-t-[1px]": first
          }
        )
      }
      testID={testID}
    >
      <Pressable
        className={
          classnames( "flex-row items-center shrink", {
            "py-3": asListItem
          } )
        }
        onPress={handlePress || navToTaxonDetails}
        accessible
        accessibilityRole="link"
        accessibilityLabel={accessibleName}
        accessibilityHint={t( "Navigates-to-taxon-details" )}
      >
        <View className="w-[62px] h-[62px] justify-center relative">
          {
            isLoading
              ? (
                <ActivityIndicator size={44} />
              )
              : (
                <ObsImagePreview
                  source={taxonImage}
                  testID={`${testID}.photo`}
                  iconicTaxonName={usableTaxon?.iconic_taxon_name}
                  className="rounded-xl"
                  isSmall
                  white={white}
                />
              )
          }
          {!!( confidence && confidencePosition === "photo" ) && (
            <View className="absolute -bottom-4 w-full items-center">
              <ConfidenceInterval
                confidence={confidence}
                activeColor={activeColor}
              />
            </View>
          )}
        </View>
        <View className="shrink ml-3 flex-1">
          <DisplayTaxonName
            taxon={usableTaxon}
            color={clearBackground && "text-white"}
            scientificNameFirst={currentUser?.prefers_scientific_name_first}
          />
          {!!( confidence && confidencePosition === "text" ) && (
            <View className="mt-1 w-[62px]">
              <ConfidenceInterval
                confidence={confidence}
                activeColor={activeColor}
              />
            </View>
          )}
        </View>
      </Pressable>
      <View className="flex-row items-center">
        { showInfoButton && (
          <INatIconButton
            icon="info-circle-outline"
            size={22}
            onPress={navToTaxonDetails}
            color={clearBackground && theme.colors.onSecondary}
            accessibilityLabel={t( "More-info" )}
            accessibilityHint={t( "Navigates-to-taxon-details" )}
          />
        )}
        { showCheckmark
          && (
            <INatIconButton
              className="ml-2"
              icon="checkmark-circle-outline"
              size={40}
              color={
                clearBackground
                  ? theme.colors.onSecondary
                  : theme.colors.primary
              }
              onPress={() => handleCheckmarkPress( usableTaxon )}
              accessibilityLabel={accessibilityLabel}
              testID={`${testID}.checkmark`}
            />
          )}
        { showEditButton
            && (
              <INatIconButton
                icon="edit"
                size={20}
                onPress={handlePress}
                accessibilityLabel={t( "Edit" )}
                accessibilityHint={t( "Edits-this-observations-taxon" )}
              />
            )}
      </View>
    </View>
  );
};

export default TaxonResult;
