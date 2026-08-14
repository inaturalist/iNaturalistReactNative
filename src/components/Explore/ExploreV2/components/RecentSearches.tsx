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
import type { ExploreRecentSearchesSlice } from "stores/createExploreRecentSearchesSlice";
import { subjectKey } from "stores/createExploreRecentSearchesSlice";
import useStore from "stores/useStore";

interface Props {
  onSelectSubject: ( _subject: ExploreV2Subject ) => void;
}

interface RecentRow {
  subject: ExploreV2Subject;
  result: UniversalSearchResultItem;
}

const RecentSearches = ( { onSelectSubject }: Props ) => {
  const currentUser = useCurrentUser( );
  const subjects = useStore(
    ( state: ExploreRecentSearchesSlice ) => state.exploreRecentSearches.subjects,
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
