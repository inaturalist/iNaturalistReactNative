import {
  ActivityIndicator, Body2, Heading6, INatIcon
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import { t } from "i18next";
import * as React from "react";
import type { PressableProps } from "react-native";
import colors from "styles/tailwindColors";

interface Counts {
  observations_count: number;
  species_count: number;
  identifications_count: number;
  members_count: number;
  journal_posts_count: number;
}

interface Props {
  counts: Counts;
  onObservationPressed: PressableProps["onPress"];
  onSpeciesPressed: PressableProps["onPress"];
  onMembersPressed: PressableProps["onPress"];
}

interface CountProps {
  count: number;
  icon: string;
  label: string;
}

interface CountPressableProps {
  accessibilityLabel: string;
  count: number;
  icon: string;
  label: string;
  onPress?: PressableProps["onPress"];
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
    <Heading6 className="mt-2 text-center">{label}</Heading6>
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
      : <ActivityIndicator className="mt-2" size={20} />}
    <Heading6 className="mt-2 text-center">{label}</Heading6>
  </Pressable>
);

const OverviewCounts = ( {
  counts, onObservationPressed, onSpeciesPressed, onMembersPressed
}: Props ) => (
  <View className="flex-row mt-[30px]">
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
    {( typeof ( counts.members_count ) === "number" || onMembersPressed !== undefined ) && (
      <CountPressable
        accessibilityLabel={t( "See-project-members" )}
        count={counts.members_count}
        label={t( "MEMBERS-WITHOUT-NUMBER", { count: counts.members_count } )}
        icon="person"
        onPress={onMembersPressed}
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
