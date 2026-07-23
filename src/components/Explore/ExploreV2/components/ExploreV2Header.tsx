import { useNavigation } from "@react-navigation/native";
import { THUMBNAIL_CLASS } from "appConstants/classNames";
import {
  Body1,
  Body3,
  Heading2,
  IconicTaxonIcon,
  INatIcon,
  UserIcon,
} from "components/SharedComponents";
import BackButton from "components/SharedComponents/Buttons/BackButton";
import ContainedSquareButton from "components/SharedComponents/Buttons/ContainedSquareButton";
import DisplayTaxonName from "components/SharedComponents/DisplayTaxonName";
import { Image, View } from "components/styledComponents";
import type { TFunction } from "i18next";
import type { ExploreStackScreenProps } from "navigation/types";
import type { ExploreV2LocationState, ExploreV2Subject } from "providers/ExploreV2Context";
import {
  EXPLORE_V2_PLACE_MODE,
  useExploreV2,
} from "providers/ExploreV2Context";
import React from "react";
import { useCurrentUser, useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

function subjectLabel( subject: ExploreV2Subject | null, t: TFunction ): string {
  if ( !subject ) { return t( "All-organisms" ); }
  switch ( subject.type ) {
    case "taxon":
      return subject.taxon.name;
    case "user":
      return subject.user.login;
    case "project":
      return subject.project.title;
    case "unobserved":
      return t( "Unobserved" );
    default:
      return t( "All-organisms" );
  }
}

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

const SubjectThumbnail = ( { subject }: { subject: ExploreV2Subject } ) => {
  switch ( subject.type ) {
    case "taxon": {
      const photo = subject.taxon.default_photo?.url;
      return photo
        ? (
          <Image
            source={{ uri: photo }}
            className={THUMBNAIL_CLASS}
            accessibilityIgnoresInvertColors
            testID="ExploreV2Header.taxonImage"
          />
        )
        : (
          <IconicTaxonIcon
            imageClassName={[THUMBNAIL_CLASS]}
            iconicTaxonName={subject.taxon.iconic_taxon_name}
          />
        );
    }
    case "user":
      return <UserIcon size={62} uri={subject.user.icon_url} />;
    case "project":
      return subject.project.icon
        ? (
          <Image
            source={{ uri: subject.project.icon }}
            className={THUMBNAIL_CLASS}
            accessibilityIgnoresInvertColors
            testID="ExploreV2Header.projectImage"
          />
        )
        : (
          <View
            className={`${THUMBNAIL_CLASS} bg-lightGray items-center justify-center`}
            testID="ExploreV2Header.projectFallbackIcon"
          >
            <INatIcon name="briefcase" size={28} color={colors.darkGray} />
          </View>
        );
    default:
      return null;
  }
};

const LocationSubtitle = ( { place }: { place: string } ) => {
  if ( !place ) { return null; }
  return (
    <View className="flex-row items-center pt-[5px]">
      <INatIcon name="location" size={15} />
      <Body3
        maxFontSizeMultiplier={1.5}
        className="ml-[5px]"
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {place}
      </Body3>
    </View>
  );
};

const TitleHeader = ( {
  title,
  place,
  testID,
}: {
  title: string;
  place?: string;
  testID?: string;
} ) => (
  <View className="flex-1 mr-5 pl-2" testID={testID}>
    <Heading2 numberOfLines={1} ellipsizeMode="tail">
      {title}
    </Heading2>
    {place
      ? <LocationSubtitle place={place} />
      : null}
  </View>
);

const SubjectHeader = ( {
  subject,
  label,
  place,
  prefersCommonNames,
  scientificNameFirst,
}: {
  subject: ExploreV2Subject;
  label: string;
  place: string;
  prefersCommonNames?: boolean;
  scientificNameFirst?: boolean;
} ) => (
  <View
    className="flex-1 flex-row items-center mr-5"
    testID="ExploreV2Header.subject"
  >
    <SubjectThumbnail subject={subject} />
    <View className="flex-1 ml-[10px]">
      {subject.type === "taxon"
        ? (
          <DisplayTaxonName
            taxon={subject.taxon}
            showOneNameOnly
            prefersCommonNames={prefersCommonNames}
            scientificNameFirst={scientificNameFirst}
          />
        )
        : (
          <Body1 numberOfLines={1} ellipsizeMode="tail">
            {label}
          </Body1>
        )}
      <LocationSubtitle place={place} />
    </View>
  </View>
);

const ExploreV2Header = ( ) => {
  const { t } = useTranslation( );
  const { state } = useExploreV2( );
  const currentUser = useCurrentUser( );
  const navigation = useNavigation<ExploreStackScreenProps<"ExploreResults">["navigation"]>( );

  const { subject } = state;
  const place = locationLabel( state.location, t );

  let headerContent;
  if ( subject && subject.type !== "unobserved" ) {
    headerContent = (
      <SubjectHeader
        subject={subject}
        label={subjectLabel( subject, t )}
        place={place}
        prefersCommonNames={currentUser?.prefers_common_names}
        scientificNameFirst={currentUser?.prefers_scientific_name_first}
      />
    );
  } else if ( subject?.type === "unobserved" ) {
    headerContent = (
      <TitleHeader
        title={t( "Unobserved" )}
        place={place}
        testID="ExploreV2Header.unobserved"
      />
    );
  } else {
    headerContent = <TitleHeader title={place} />;
  }

  return (
    <View className="bg-white" testID="ExploreV2Header">
      <View className="p-4 flex-row items-center">
        <BackButton />
        {headerContent}
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
