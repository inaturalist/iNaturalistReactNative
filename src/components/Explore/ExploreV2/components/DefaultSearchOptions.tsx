import type { ApiTaxon, ApiUser } from "api/types";
import classnames from "classnames";
import UniversalSearchResult
  from "components/Explore/ExploreV2/components/UniversalSearchResult";
import { resultToSubject }
  from "components/Explore/ExploreV2/helpers/universalSearchSubject";
import INatIconButton from "components/SharedComponents/Buttons/INatIconButton";
import Body1 from "components/SharedComponents/Typography/Body1";
import { Pressable, ScrollView, View } from "components/styledComponents";
import type { ExploreV2Subject } from "providers/ExploreV2Context";
import React, { useCallback, useMemo } from "react";
import type { ListRenderItemInfo } from "react-native";
import { FlatList } from "react-native";
import Taxon from "realmModels/Taxon";
import type { RealmTaxon } from "realmModels/types";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useIconicTaxa from "sharedHooks/useIconicTaxa";
import useTranslation from "sharedHooks/useTranslation";
import type { UniversalSearchResultItem } from "sharedHooks/useUniversalSearch";
import colors from "styles/tailwindColors";

interface Props {
  onSelectSubject: ( subject: ExploreV2Subject ) => void;
}

// Display order for the iconic taxa row, matching the Figma "SearchDefaults"
// frame. "unknown" is intentionally omitted since it isn't a searchable taxon.
const ICONIC_TAXA_ORDER = [
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
];

const ICON_BUTTON_WRAPPER = classnames(
  "border-darkGray border border-[2px] mr-[15px] justify-center items-center",
  "h-[36px] w-[36px] rounded-full",
);

const ROW_CLASSES = "px-[15px] py-[11px] border-b border-lightGray";

const ICONIC_ROW_STYLE = {
  alignItems: "center",
  paddingHorizontal: 15,
  paddingVertical: 15,
} as const;

const DefaultSearchOptions = ( { onSelectSubject }: Props ) => {
  const { t } = useTranslation( );

  const currentUser = useCurrentUser( ) as unknown as ApiUser | null;
  const iconicTaxa = useIconicTaxa( );

  // Order the iconic taxa returned from Realm by the design's display order
  const orderedIconicTaxa = useMemo( ( ): ApiTaxon[] => {
    const taxaByName = new Map<string, RealmTaxon>( );
    const taxaList = ( iconicTaxa
      ? Array.from( iconicTaxa )
      : [] ) as unknown as RealmTaxon[];
    taxaList.forEach( taxon => {
      if ( taxon?.name ) {
        taxaByName.set( taxon.name.toLowerCase( ), taxon );
      }
    } );

    return ICONIC_TAXA_ORDER
      .map( name => taxaByName.get( name ) )
      .filter( ( taxon ): taxon is RealmTaxon => !!taxon )
      .map( taxon => Taxon.mapRealmToPojo( taxon ) as ApiTaxon );
  }, [iconicTaxa] );

  const renderIconicTaxon = useCallback(
    ( { item: taxon }: ListRenderItemInfo<ApiTaxon> ) => {
      const iconicName = ( taxon.iconic_taxon_name || taxon.name || "" ).toLowerCase( );
      return (
        <View
          className={ICON_BUTTON_WRAPPER}
          testID={`DefaultSearchOptions.iconicTaxon.${taxon.id}`}
        >
          <INatIconButton
            accessibilityLabel={taxon.preferred_common_name || taxon.name}
            color={colors.darkGray}
            icon={`iconic-${iconicName}`}
            onPress={( ) => onSelectSubject( resultToSubject( { type: "taxon", taxon } ) )}
            size={22}
            testID={`DefaultSearchOptions.iconicTaxonButton.${taxon.id}`}
          />
        </View>
      );
    },
    [onSelectSubject],
  );

  const currentUserResult: UniversalSearchResultItem | null = currentUser?.id
    ? {
      type: "user",
      user: {
        id: currentUser.id,
        login: currentUser.login,
        icon_url: currentUser.icon_url,
        observations_count: currentUser.observations_count,
      },
    }
    : null;

  return (
    <ScrollView keyboardShouldPersistTaps="handled" testID="DefaultSearchOptions">
      <View className="border-t border-b border-lightGray">
        <FlatList
          contentContainerStyle={ICONIC_ROW_STYLE}
          data={orderedIconicTaxa}
          horizontal
          keyExtractor={taxon => `iconic-${taxon.id}`}
          keyboardShouldPersistTaps="handled"
          renderItem={renderIconicTaxon}
          showsHorizontalScrollIndicator={false}
          testID="DefaultSearchOptions.iconicTaxa"
        />
      </View>
      {currentUserResult && (
        <UniversalSearchResult
          result={currentUserResult}
          onPress={( ) => onSelectSubject( resultToSubject( currentUserResult ) )}
        />
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t( "Species-I-havent-observed" )}
        className={ROW_CLASSES}
        // TODO MOB-1345
        onPress={( ) => undefined}
        testID="DefaultSearchOptions.unobserved"
      >
        <Body1>{t( "Species-I-havent-observed" )}</Body1>
      </Pressable>
    </ScrollView>
  );
};

export default DefaultSearchOptions;
