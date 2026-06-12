import { useNavigation } from "@react-navigation/native";
import {
  Body3,
  Heading4,
  INatIcon,
} from "components/SharedComponents";
import ContainedSquareButton from "components/SharedComponents/Buttons/ContainedSquareButton";
import { View } from "components/styledComponents";
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

function subjectLabel( subject: ExploreV2Subject | null, t: TFunction ): string {
  if ( !subject ) { return t( "All-organisms" ); }
  switch ( subject.type ) {
    case "taxon":
      return subject.taxon.name;
    case "user":
      return subject.user.login;
    case "project":
      return subject.project.title;
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

const ExploreV2Header = ( ) => {
  const { t } = useTranslation( );
  const { state } = useExploreV2( );
  const navigation = useNavigation<ExploreStackScreenProps<"ExploreResults">["navigation"]>( );

  const subject = subjectLabel( state.subject, t );
  const place = locationLabel( state.location, t );

  return (
    <View className="bg-white p-4 flex-row justify-between items-center">
      <View className="flex-1 mr-5">
        <Heading4 numberOfLines={1} ellipsizeMode="tail">
          {subject}
        </Heading4>
        {place
          ? (
            <View className="flex-row items-center pt-2">
              <INatIcon name="location" size={15} />
              <Body3
                maxFontSizeMultiplier={1.5}
                className="ml-3"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {place}
              </Body3>
            </View>
          )
          : null}
      </View>
      <ContainedSquareButton
        accessibilityHint={t( "Opens-search-interface" )}
        accessibilityLabel={t( "Search" )}
        backgroundColor={colors.inatGreen}
        icon="magnifying-glass"
        onPress={() => navigation.navigate( "UniversalSearch" )}
        testID="ExploreV2Header.searchButton"
      />
    </View>
  );
};

export default ExploreV2Header;
