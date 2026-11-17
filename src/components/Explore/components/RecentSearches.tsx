import SearchSectionHeader
  from "components/Explore/components/SearchSectionHeader";
import UniversalSearchResult
  from "components/Explore/components/UniversalSearchResult";
import { subjectToResult }
  from "components/Explore/helpers/universalSearchSubject";
import type { UniversalSearchResultItem }
  from "components/Explore/hooks/useUniversalSearch";
import { View } from "components/styledComponents";
import type { ExploreSubject } from "providers/ExploreContext";
import React from "react";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useTranslation from "sharedHooks/useTranslation";
import { subjectKey } from "stores/createExploreSearchesSlice";
import useStore from "stores/useStore";

interface Props {
  onSelectSubject: ( _subject: ExploreSubject ) => void;
}

interface RecentRow {
  subject: ExploreSubject;
  result: UniversalSearchResultItem;
}

const RecentSearches = ( { onSelectSubject }: Props ) => {
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );
  const subjects = useStore( state => state.exploreRecentSearches.subjects );

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
