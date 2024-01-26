// @flow

import {
  ActivityIndicator,
  Body3,
  INatIconButton
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";
import { useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";

type Props = {
  metric: string,
  qualityMetrics: Object,
  loadingAgree: boolean,
  loadingDisagree: boolean,
  loadingMetric: ?string,
  setVote: Function,
  removeVote: Function
}

const getUserVote = ( metric, qualityMetrics ) => {
  if ( qualityMetrics ) {
    const match = qualityMetrics.find( element => (
      element.metric === metric && element.user_id ) );
    if ( match ) {
      return match.agree === true;
    }
  }
  return null;
};

const renderVoteCount = ( status, metric, qualityMetrics ) => {
  if ( !qualityMetrics ) return null;

  const count = qualityMetrics
    ?.filter( qualityMetric => qualityMetric.agree === status && qualityMetric.metric === metric )
    ?.length;
  if ( !count || count === 0 ) return null;

  return <Body3 classname="ml-[5px]">{count}</Body3>;
};

const DQAVoteButtons = ( {
  metric, qualityMetrics, loadingAgree, loadingDisagree, loadingMetric, setVote, removeVote
}: Props ): React.Node => {
  const { t } = useTranslation( );
  const theme = useTheme( );
  const userAgrees = getUserVote( metric, qualityMetrics );
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
          color={theme.colors.secondary}
          onPress={() => removeVote( metric, true )}
          accessibilityLabel={t( "Arrow-up-selected" )}
        />
      );
    }
    return (
      <INatIconButton
        testID="DQAVoteButton.EmptyAgree"
        icon="arrow-up-bold-circle-outline"
        size={33}
        onPress={() => setVote( metric, true )}
        accessibilityLabel={t( "Arrow-up-unselected" )}
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
          color={theme.colors.error}
          onPress={() => removeVote( metric, false )}
          accessibilityLabel={t( "Arrow-down-selected" )}
        />
      );
    }
    return (
      <INatIconButton
        testID="DQAVoteButton.EmptyDisagree"
        icon="arrow-down-bold-circle-outline"
        size={33}
        onPress={() => setVote( metric, false )}
        accessibilityLabel={t( "Arrow-down-unselected" )}
      />
    );
  };

  return (
    <View className="flex-row items-center justify-between w-[97px] space-x-[11px]">
      <View className="flex-row items-center w-1/2">
        {renderAgree()}
        {renderVoteCount( true, metric, qualityMetrics )}
      </View>
      <View className="flex-row items-center w-1/2">
        {renderDisagree()}
        {renderVoteCount( false, metric, qualityMetrics )}
      </View>
    </View>
  );
};

export default DQAVoteButtons;
