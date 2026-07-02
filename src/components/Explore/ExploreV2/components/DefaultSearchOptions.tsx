import type { ApiTaxon, ApiUser } from "api/types";
import UniversalSearchResult
  from "components/Explore/ExploreV2/components/UniversalSearchResult";
import { resultToSubject }
  from "components/Explore/ExploreV2/helpers/universalSearchSubject";
import IconicTaxonChooser from "components/SharedComponents/IconicTaxonChooser";
import Body1 from "components/SharedComponents/Typography/Body1";
import { Pressable, ScrollView, View } from "components/styledComponents";
import type { ExploreV2Subject } from "providers/ExploreV2Context";
import React, { useCallback, useMemo } from "react";
import Taxon from "realmModels/Taxon";
import type { RealmTaxon } from "realmModels/types";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useIconicTaxa from "sharedHooks/useIconicTaxa";
import useTranslation from "sharedHooks/useTranslation";
import type { UniversalSearchResultItem } from "sharedHooks/useUniversalSearch";

interface Props {
  onSelectSubject: ( subject: ExploreV2Subject ) => void;
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

  const currentUser = useCurrentUser( ) as unknown as ApiUser | null;
  const iconicTaxa = useIconicTaxa( );

  // Map iconic taxon name -> Realm taxon, so the shared chooser's name-based
  // callback can be resolved into a full taxon subject.
  const taxaByName = useMemo( ( ): Map<string, RealmTaxon> => {
    const map = new Map<string, RealmTaxon>( );
    const taxaList = ( iconicTaxa
      ? Array.from( iconicTaxa )
      : [] ) as unknown as RealmTaxon[];
    taxaList.forEach( taxon => {
      if ( taxon?.name ) {
        map.set( taxon.name.toLowerCase( ), taxon );
      }
    } );
    return map;
  }, [iconicTaxa] );

  const handleIconicTaxon = useCallback( ( iconicTaxonName: string ) => {
    const realmTaxon = taxaByName.get( iconicTaxonName );
    if ( !realmTaxon ) { return; }
    const taxon = Taxon.mapRealmToPojo( realmTaxon ) as ApiTaxon;
    onSelectSubject( resultToSubject( { type: "taxon", taxon } ) );
  }, [taxaByName, onSelectSubject] );

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
          accessibilityHint={t( "Searches-for-iconic-taxon" )}
          chosen={EMPTY_CHOSEN}
          contentContainerStyle={ICONIC_ROW_STYLE}
          onTaxonChosen={handleIconicTaxon}
          testID="DefaultSearchOptions.iconicTaxa"
          withoutUnknown
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
