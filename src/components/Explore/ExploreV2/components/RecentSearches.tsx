import SearchSectionHeader
  from "components/Explore/ExploreV2/components/SearchSectionHeader";
import UniversalSearchResult
  from "components/Explore/ExploreV2/components/UniversalSearchResult";
import { subjectToResult }
  from "components/Explore/ExploreV2/helpers/universalSearchSubject";
import type { UniversalSearchResultItem }
  from "components/Explore/ExploreV2/hooks/useUniversalSearch";
import { View } from "components/styledComponents";
import type { ExploreV2Subject } from "providers/ExploreV2Context";
import React from "react";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useTranslation from "sharedHooks/useTranslation";
import type { ExploreV2SearchesSlice } from "stores/createExploreV2SearchesSlice";
import { subjectKey } from "stores/createExploreV2SearchesSlice";
import useStore from "stores/useStore";

interface Props {
  onSelectSubject: ( _subject: ExploreV2Subject ) => void;
}

interface RecentRow {
  subject: ExploreV2Subject;
  result: UniversalSearchResultItem;
}

const RecentSearches = ( { onSelectSubject }: Props ) => {
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );
  const subjects = useStore(
    ( state: ExploreV2SearchesSlice ) => state.exploreRecentSearches.subjects,
  );

  const rows = subjects
    .map( subject => ( { subject, result: subjectToResult( subject ) } ) )
    // Only subjects that have a search-result form get a row (no "unknown" or "unobserved")
    .filter( ( row ): row is RecentRow => row.result !== null )
    .filter( ( { subject } ) => !(
      subject.type === "user" && subject.user.id === currentUser?.id
    ) );

  if ( rows.length === 0 ) { return null; }

  return (
    <View testID="RecentSearches">
      <SearchSectionHeader
        icon="clock-outline"
        testID="RecentSearches.header"
        title={t( "Recent-searches" )}
      />
      {rows.map( ( { subject, result } ) => (
        <UniversalSearchResult
          key={subjectKey( subject )}
          onPress={( ) => onSelectSubject( subject )}
          result={result}
        />
      ) )}
    </View>
  );
};

export default React.memo( RecentSearches );
