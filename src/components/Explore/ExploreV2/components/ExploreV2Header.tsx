import { useNavigation } from "@react-navigation/native";
import ProjectListItem from "components/ProjectList/ProjectListItem";
import BackButton from "components/SharedComponents/Buttons/BackButton";
import ContainedSquareButton from "components/SharedComponents/Buttons/ContainedSquareButton";
import CompositeListItem from "components/SharedComponents/CompositeListItem/CompositeListItem";
import TaxonResult from "components/SharedComponents/TaxonResult";
import Heading2 from "components/SharedComponents/Typography/Heading2";
import { View } from "components/styledComponents";
import UserListItem from "components/UserList/UserListItem";
import type { TFunction } from "i18next";
import type { ExploreStackScreenProps } from "navigation/types";
import type { ExploreV2LocationState, ExploreV2Subject } from "providers/ExploreV2Context";
import {
  EXPLORE_V2_PLACE_MODE,
  useExploreV2,
} from "providers/ExploreV2Context";
import React from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

// TaxonResult requires a checkmark handler, but the header renders it
// unpressable with no checkmark, so this is never called.
const NOOP = ( ) => {};

// Shared layout for the subject's text column: a name line plus an optional
// location line as the second line.
const SUBJECT_TEXT_CLASS = "flex-1 ml-[10px]";
const SUBJECT_ROW_CLASS = "flex-1 mr-5";

function locationLabel( location: ExploreV2LocationState, t: TFunction ): string {
  switch ( location.placeMode ) {
    case EXPLORE_V2_PLACE_MODE.WORLDWIDE:
      return t( "Worldwide" );
    case EXPLORE_V2_PLACE_MODE.NEARBY:
      return t( "Nearby" );
    case EXPLORE_V2_PLACE_MODE.PLACE:
      return location.place.display_name || "";
    default:
      return "";
  }
}

const LocationLine = ( { place }: { place: string } ) => (
  place
    ? <CompositeListItem.LocationLine place={place} />
    : null
);

// Renders the active subject (taxon/user/project) by composing the existing
// list-item components and swapping their second line for the location.
const SubjectRow = ( { subject, place }: { subject: ExploreV2Subject; place: string } ) => {
  switch ( subject.type ) {
    case "user":
      return (
        <UserListItem
          item={{ user: subject.user }}
          pressable={false}
          className={SUBJECT_ROW_CLASS}
        >
          <UserListItem.UserIcon />
          <View className={SUBJECT_TEXT_CLASS}>
            <UserListItem.UserName />
            <LocationLine place={place} />
          </View>
        </UserListItem>
      );
    case "project":
      return (
        <ProjectListItem
          item={subject.project}
          isHeader
          className={SUBJECT_ROW_CLASS}
        >
          <ProjectListItem.Icon />
          <View className={SUBJECT_TEXT_CLASS}>
            <ProjectListItem.Title />
            <LocationLine place={place} />
          </View>
        </ProjectListItem>
      );
    case "taxon":
      return (
        <CompositeListItem pressable={false} className={SUBJECT_ROW_CLASS}>
          <TaxonResult
            taxon={subject.taxon}
            testID="ExploreV2Header.taxon"
            fetchRemote={false}
            fromLocal={false}
            unpressable
            showOneNameOnly
            accessibilityLabel=""
            handleCheckmarkPress={NOOP}
          >
            <TaxonResult.Photo />
            <View className={SUBJECT_TEXT_CLASS}>
              <TaxonResult.Name />
              <LocationLine place={place} />
            </View>
          </TaxonResult>
        </CompositeListItem>
      );
    default:
      return null;
  }
};

const ExploreV2Header = ( ) => {
  const { t } = useTranslation( );
  const { state } = useExploreV2( );
  const navigation = useNavigation<ExploreStackScreenProps<"ExploreResults">["navigation"]>( );

  const place = locationLabel( state.location, t );

  return (
    <View className="bg-white" testID="ExploreV2Header">
      <View className="p-4 flex-row items-center">
        <BackButton />
        {state.subject
          ? <SubjectRow subject={state.subject} place={place} />
          : (
            <View className="flex-1 mr-5 pl-2">
              <Heading2 numberOfLines={1} ellipsizeMode="tail">
                {place}
              </Heading2>
            </View>
          )}
        <ContainedSquareButton
          accessibilityHint={t( "Opens-search-interface" )}
          accessibilityLabel={t( "Search" )}
          backgroundColor={colors.inatGreen}
          icon="magnifying-glass"
          onPress={() => navigation.navigate( "UniversalSearch" )}
          testID="ExploreV2Header.searchButton"
        />
      </View>
    </View>
  );
};

export default ExploreV2Header;
