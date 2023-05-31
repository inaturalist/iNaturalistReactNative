// @flow

import {
  Body3,
  INatIconButton
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";
import { ActivityIndicator, useTheme } from "react-native-paper";

type Props = {
  metric: string,
  qualityMetrics: Object,
  loadingAgree: boolean,
  loadingDisagree: boolean,
  loadingMetric: ?string,
  setVote: Function,
  removeVote: Function
}

// rename
const checkTest = ( metric, qualityMetrics ) => {
  if ( qualityMetrics ) {
    const match = qualityMetrics.find( element => (
      element.metric === metric && element.user_id ) );
    if ( match && match.agree === true ) { return true; }
    if ( match && match.agree === false ) { return false; }
  }
  return null;
};

const renderVoteCount = ( status, metric, qualityMetrics ) => {
  if ( qualityMetrics ) {
    const count = qualityMetrics.filter(
      element => ( element.agree === status && element.metric === metric )
    ).length;

    return ( count > 0 ) && <Body3>{count}</Body3>;
  }
  return null;
};

const DQAVoteButtons = ( {
  metric, qualityMetrics, loadingAgree, loadingDisagree, loadingMetric, setVote, removeVote
}: Props ): React.Node => {
  const theme = useTheme( );
  const ifAgree = checkTest( metric, qualityMetrics );

  const renderAgree = () => {
    if ( ifAgree === null ) {
      return (
        <INatIconButton
          icon="arrow-up-bold-circle-outline"
          size={33}
          onPress={() => setVote( metric, true )}
        />
      );
    }
    if ( loadingAgree && loadingMetric === metric ) {
      return ( <ActivityIndicator /> );
    }
    if ( ifAgree ) {
      return (
        <INatIconButton
          icon="arrow-up-bold-circle"
          size={33}
          color={theme.colors.secondary}
          onPress={() => removeVote( metric, true )}
        />
      );
    }
    return (
      <INatIconButton
        icon="arrow-up-bold-circle-outline"
        size={33}
        onPress={() => setVote( metric, true )}
      />
    );
  };

  const renderDisagree = () => {
    if ( ifAgree === null ) {
      return (
        <INatIconButton
          icon="arrow-down-bold-circle-outline"
          size={33}
          onPress={() => setVote( metric, true )}
        />
      );
    }
    if ( loadingDisagree && loadingMetric === metric ) {
      return ( <ActivityIndicator /> );
    }
    if ( !ifAgree ) {
      return (
        <INatIconButton
          icon="arrow-down-bold-circle"
          size={33}
          color={theme.colors.error}
          onPress={() => removeVote( metric, false )}
        />
      );
    }
    return (
      <INatIconButton
        icon="arrow-down-bold-circle-outline"
        size={33}
        onPress={() => setVote( metric, false )}
      />
    );
  };

  return (
    <View className="flex-row items-center">
      {renderAgree()}
      {renderVoteCount( true, metric, qualityMetrics )}
      {renderDisagree()}
      {renderVoteCount( false, metric, qualityMetrics )}
    </View>
  );
};

export default DQAVoteButtons;
