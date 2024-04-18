// @flow

import {
  ActivityIndicator, Body2, Heading5, INatIcon
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import { t } from "i18next";
import * as React from "react";
import colors from "styles/tailwindColors";

type Props = {
  counts: object,
  onObservationPressed: ( ) => void,
  onSpeciesPressed: ( ) => void
}

type CountProps = {
  count: number,
  icon: string,
  label: string
}

type CountPressableProps = {
  accessibilityLabel: string,
  count: number,
  icon: string,
  label: string,
  onPress?: ( ) => void
}

const Count = ( {
  count, label, icon
}: CountProps ) => (
  <View
    className="w-1/4 items-center"
  >
    <View className="w-[32px] h-[32px] rounded-lg items-center justify-center">
      <INatIcon
        name={icon}
        size={18}
        color={colors.darkGray}
      />
    </View>
    {typeof count === "number"
      ? <Body2 className="mt-2">{t( "Intl-number", { val: count } )}</Body2>
      : <ActivityIndicator size={25} />}
    <Heading5 className="mt-2 text-center">{label}</Heading5>
  </View>
);

const CountPressable = ( {
  accessibilityLabel,
  count,
  icon,
  label,
  onPress
}: CountPressableProps ) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel || label}
    className="w-1/4 items-center"
  >
    <View className="bg-inatGreen w-[32px] h-[32px] rounded-lg items-center justify-center">
      <INatIcon
        name={icon}
        size={18}
        color={colors.white}
      />
    </View>
    {typeof count === "number"
      ? <Body2 className="mt-2">{t( "Intl-number", { val: count } )}</Body2>
      : <ActivityIndicator size={25} />}
    <Heading5 className="mt-2 text-center">{label}</Heading5>
  </Pressable>
);

const OverviewCounts = ( {
  counts, onObservationPressed, onSpeciesPressed
}: Props ): React.Node => (
  <View className="flex-row mt-6">
    <CountPressable
      accessibilityLabel={t( "See-observations-by-this-user-in-Explore" )}
      count={counts.observations_count}
      label={t( "OBSERVATIONS-WITHOUT-NUMBER", { count: counts.observations_count } )}
      icon="binoculars"
      onPress={onObservationPressed}
    />
    <CountPressable
      accessibilityLabel={t( "See-species-observed-by-this-user-in-Explore" )}
      count={counts.species_count}
      label={t( "SPECIES-WITHOUT-NUMBER", { count: counts.species_count } )}
      icon="leaf"
      onPress={onSpeciesPressed}
    />
    {typeof ( counts.identifications_count ) === "number" && (
      <Count
        count={counts.identifications_count}
        label={t( "IDENTIFICATIONS-WITHOUT-NUMBER", { count: counts.identifications_count } )}
        icon="label"
      />
    )}
    {typeof ( counts.members_count ) === "number" && (
      <Count
        count={counts.members_count}
        label={t( "MEMBERS-WITHOUT-NUMBER", { count: counts.members_count } )}
        icon="person"
      />
    )}
    <Count
      count={counts.journal_posts_count}
      label={t( "JOURNAL-POSTS-WITHOUT-NUMBER", { count: counts.journal_posts_count } )}
      icon="book"
    />
  </View>
);

export default OverviewCounts;
