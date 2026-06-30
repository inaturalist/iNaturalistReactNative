import type { ApiUser } from "api/types";
import classnames from "classnames";
import UniversalSearchResult
  from "components/Explore/ExploreV2/components/UniversalSearchResult";
import { resultToSubject }
  from "components/Explore/ExploreV2/helpers/universalSearchSubject";
import INatIconButton from "components/SharedComponents/Buttons/INatIconButton";
import Body2 from "components/SharedComponents/Typography/Body2";
import { Pressable, View } from "components/styledComponents";
import type { ExploreV2Subject } from "providers/ExploreV2Context";
import React, { useCallback, useMemo } from "react";
import type { ListRenderItemInfo } from "react-native";
import { FlatList } from "react-native";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useIconicTaxa from "sharedHooks/useIconicTaxa";
import useTranslation from "sharedHooks/useTranslation";
import type { UniversalSearchResultItem } from "sharedHooks/useUniversalSearch";
import colors from "styles/tailwindColors";

interface Props {
  onSelectSubject: ( subject: ExploreV2Subject ) => void;
}

interface IconicTaxon {
  id: number;
  name: string;
  preferred_common_name?: string;
  iconic_taxon_name?: string;
  rank_level?: number;
  default_photo?: { url?: string };
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
  "border-darkGray border border-[2px] mr-4 justify-center items-center",
  "h-[36px] w-[36px] rounded-full",
);

const ROW_CLASSES = "px-4 py-2 border-b border-lightGray";

const ICONIC_ROW_STYLE = {
  alignItems: "center",
  paddingHorizontal: 16,
} as const;

const DefaultSearchOptions = ( { onSelectSubject }: Props ) => {
  const { t } = useTranslation( );
  // The Realm User model isn't strongly typed; treat the current user as an
  // ApiUser for the fields we read, matching how universalSearchSubject casts.
  const currentUser = useCurrentUser( ) as unknown as ApiUser | null;
  const iconicTaxa = useIconicTaxa( );

  // Order the iconic taxa returned from Realm by the design's display order. Any
  // that haven't been synced into Realm yet (see NetworkService) are skipped.
  const orderedIconicTaxa = useMemo( ( ): IconicTaxon[] => {
    const taxaByName = new Map<string, IconicTaxon>( );
    const taxaList = ( iconicTaxa
      ? Array.from( iconicTaxa )
      : [] ) as unknown as IconicTaxon[];
    taxaList.forEach( taxon => {
      if ( taxon?.name ) {
        taxaByName.set( taxon.name.toLowerCase( ), taxon );
      }
    } );
    return ICONIC_TAXA_ORDER
      .map( name => taxaByName.get( name ) )
      .filter( ( taxon ): taxon is IconicTaxon => !!taxon );
  }, [iconicTaxa] );

  const renderIconicTaxon = useCallback(
    ( { item: taxon }: ListRenderItemInfo<IconicTaxon> ) => {
      const iconicName = ( taxon.iconic_taxon_name || taxon.name ).toLowerCase( );
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

  // Renders without its own vertical scroll container: it is hosted inside the
  // UniversalSearch results FlatList (as its ListEmptyComponent), which provides
  // scrolling. The inner iconic-taxa list is horizontal, so it does not conflict
  // with the vertical parent list.
  return (
    <View testID="DefaultSearchOptions">
      <FlatList
        contentContainerStyle={ICONIC_ROW_STYLE}
        data={orderedIconicTaxa}
        horizontal
        keyExtractor={taxon => `iconic-${taxon.id}`}
        renderItem={renderIconicTaxon}
        showsHorizontalScrollIndicator={false}
        testID="DefaultSearchOptions.iconicTaxa"
      />
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
        // TODO MOB-1339 follow-up: wire to an unobserved_by_user_id filter once
        // ExploreV2 supports it (the filter does not exist yet).
        onPress={( ) => undefined}
        testID="DefaultSearchOptions.unobserved"
      >
        <Body2>{t( "Species-I-havent-observed" )}</Body2>
      </Pressable>
    </View>
  );
};

export default DefaultSearchOptions;
