import type { ApiTaxon } from "api/types";
import RecentSearches
  from "components/Explore/components/RecentSearches";
import SavedSearches
  from "components/Explore/components/SavedSearches";
import UniversalSearchResult
  from "components/Explore/components/UniversalSearchResult";
import { resultToSubject }
  from "components/Explore/helpers/universalSearchSubject";
import useApplySavedSearch from "components/Explore/hooks/useApplySavedSearch";
import type { UniversalSearchResultItem }
  from "components/Explore/hooks/useUniversalSearch";
import IconicTaxonChooser from "components/SharedComponents/IconicTaxonChooser";
import Body1 from "components/SharedComponents/Typography/Body1";
import { Pressable, ScrollView, View } from "components/styledComponents";
import type { ExploreSubject } from "providers/ExploreContext";
import React, { useCallback } from "react";
import Taxon from "realmModels/Taxon";
import type { RealmTaxon } from "realmModels/types";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useIconicTaxa from "sharedHooks/useIconicTaxa";
import useTranslation from "sharedHooks/useTranslation";

interface Props {
  onSelectSubject: ( subject: ExploreSubject ) => void;
}

const ROW_CLASSES = "px-[15px] py-[11px] border-b border-lightGray";

const ICONIC_ROW_STYLE = {
  alignItems: "center",
  paddingHorizontal: 15,
  paddingVertical: 15,
} as const;

const EMPTY_CHOSEN: string[] = [];

const DefaultSearchOptions = ( { onSelectSubject }: Props ) => {
  const { t } = useTranslation( );
  const applySavedSearch = useApplySavedSearch( );

  const currentUser = useCurrentUser( );
  const iconicTaxa = useIconicTaxa( );

  const handleIconicTaxon = useCallback( ( iconicTaxonName: string ) => {
    if ( iconicTaxonName === "unknown" ) {
      onSelectSubject( { type: "unknown" } );
      return;
    }
    // Resolve the chooser's name-based callback into a full taxon subject
    const taxaList = ( iconicTaxa
      ? Array.from( iconicTaxa )
      : [] ) as unknown as RealmTaxon[];
    const realmTaxon = taxaList.find(
      taxon => taxon?.name?.toLowerCase( ) === iconicTaxonName,
    );
    if ( !realmTaxon ) { return; }
    const taxon = Taxon.mapRealmToPojo( realmTaxon ) as ApiTaxon;
    onSelectSubject( resultToSubject( { type: "taxon", taxon } ) );
  }, [iconicTaxa, onSelectSubject] );

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
        <IconicTaxonChooser
          chosen={EMPTY_CHOSEN}
          contentContainerStyle={ICONIC_ROW_STYLE}
          onTaxonChosen={handleIconicTaxon}
          testID="DefaultSearchOptions.iconicTaxa"
        />
      </View>
      {currentUserResult && (
        <UniversalSearchResult
          result={currentUserResult}
          onPress={( ) => onSelectSubject( resultToSubject( currentUserResult ) )}
        />
      )}
      {currentUser?.id && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t( "Species-I-havent-observed" )}
          className={ROW_CLASSES}
          onPress={( ) => onSelectSubject( {
            type: "unobserved",
            user: {
              id: currentUser.id,
              login: currentUser.login,
              icon_url: currentUser.icon_url,
            },
          } )}
          testID="DefaultSearchOptions.unobserved"
        >
          <Body1>{t( "Species-I-havent-observed" )}</Body1>
        </Pressable>
      )}
      <SavedSearches onSelect={applySavedSearch} />
      <RecentSearches onSelectSubject={onSelectSubject} />
    </ScrollView>
  );
};

export default React.memo( DefaultSearchOptions );
