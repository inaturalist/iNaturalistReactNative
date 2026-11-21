import {
  ActivityIndicator,
  Body3,
  INatIconButton,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";
import type { UserPojo } from "realmModels/User";
import { useCurrentUser, useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

// TODO: or { agree } | { vote_flag }?
interface Vote {
  user_id: number;
  agree: boolean;
  vote_flag: boolean;
}

export type Metric =
  | "date"
  | "location"
  | "wild"
  | "evidence"
  | "recent"
  | "subject"
  | "needs_id";

interface Props {
  metric: Metric;
  votes: Vote[];
  loadingAgree: boolean;
  loadingDisagree: boolean;
  loadingMetric?: Metric | null | undefined;
  setVote: ( { metric, vote }: { metric: Metric; vote: boolean } ) => void;
  removeVote: ( { metric, vote }: { metric: Metric; vote: boolean } ) => void;
}

const getUserVote = ( currentUser: UserPojo | null, metric: Metric, votes: Vote[] ) => {
  if ( votes && votes.length > 0 ) {
    const match = votes.find( element => ( element.user_id === currentUser?.id ) );
    if ( match ) {
      if ( metric === "needs_id" ) {
        return match.vote_flag === true;
      }
      return match.agree === true;
    }
  }
  return null;
};

const renderVoteCount = ( status: boolean, metric: Metric, votes: Vote[] ) => {
  if ( !votes ) return null;

  const count = votes
    ?.filter( qualityMetric => {
      if ( metric === "needs_id" ) {
        return qualityMetric.vote_flag === status;
      }
      return qualityMetric.agree === status;
    } )
    ?.length;
  if ( !count || count === 0 ) return null;

  return <Body3 classname="ml-[5px]">{count}</Body3>;
};

const DQAVoteButtons = ( {
  metric,
  votes,
  loadingAgree,
  loadingDisagree,
  loadingMetric,
  setVote,
  removeVote,
}: Props ) => {
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );
  const userAgrees = getUserVote( currentUser, metric, votes );
  const activityIndicatorOffset = "mx-[7px]";

  const renderAgree = () => {
    if ( loadingAgree && loadingMetric === metric ) {
      return ( <ActivityIndicator size={33} className={activityIndicatorOffset} /> );
    }
    if ( userAgrees ) {
      return (
        <INatIconButton
          testID="DQAVoteButton.UserAgree"
          icon="arrow-up-bold-circle"
          size={33}
          color={colors.inatGreen}
          onPress={() => removeVote( { metric, vote: true } )}
          accessibilityLabel={t( "Add-agreement" )}
          accessibilityHint={t( "Adds-your-vote-of-agreement" )}
        />
      );
    }
    return (
      <INatIconButton
        testID="DQAVoteButton.EmptyAgree"
        icon="arrow-up-bold-circle-outline"
        size={33}
        onPress={() => setVote( { metric, vote: true } )}
        accessibilityLabel={t( "Remove-agreement" )}
        accessibilityHint={t( "Removes-your-vote-of-agreement" )}
      />
    );
  };

  const renderDisagree = () => {
    if ( loadingDisagree && loadingMetric === metric ) {
      return ( <ActivityIndicator size={30} className={activityIndicatorOffset} /> );
    }

    if ( userAgrees === false ) {
      return (
        <INatIconButton
          testID="DQAVoteButton.UserDisagree"
          icon="arrow-down-bold-circle"
          size={33}
          color={colors.warningRed}
          onPress={() => removeVote( { metric, vote: false } )}
          accessibilityLabel={t( "Remove-disagreement" )}
          accessibilityHint={t( "Removes-your-vote-of-disagreement" )}
        />
      );
    }
    return (
      <INatIconButton
        testID="DQAVoteButton.EmptyDisagree"
        icon="arrow-down-bold-circle-outline"
        size={33}
        onPress={() => setVote( { metric, vote: false } )}
        accessibilityLabel={t( "Add-disagreement" )}
        accessibilityHint={t( "Adds-your-vote-of-disagreement" )}
      />
    );
  };

  return (
    <View className="flex-row items-center justify-between w-[97px] gap-x-[11px]">
      <View className="flex-row items-center w-1/2">
        {renderAgree( )}
        {renderVoteCount( true, metric, votes )}
      </View>
      <View className="flex-row items-center w-1/2">
        {renderDisagree( )}
        {renderVoteCount( false, metric, votes )}
      </View>
    </View>
  );
};

export default DQAVoteButtons;
