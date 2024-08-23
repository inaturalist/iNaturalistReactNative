// @flow

import {
  ActivityIndicator,
  Body2,
  INatIcon
} from "components/SharedComponents";
import { Pressable } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";

type Props = {
  count: ?number,
  exploreView: string,
  exploreViewIcon: string,
  fetchingStatus: boolean,
  onPress: Function,
}

const ExploreHeaderCount = ( {
  count,
  exploreView,
  exploreViewIcon,
  fetchingStatus,
  onPress
}: Props ): Node => {
  const { t } = useTranslation( );
  const theme = useTheme( );

  const renderText = ( ) => {
    if ( exploreView === "observations" ) {
      return t( "X-Observations", { count } );
    }
    if ( exploreView === "species" ) {
      return t( "X-Species", { count } );
    }
    if ( exploreView === "identifiers" ) {
      return t( "X-Identifiers", { count } );
    }
    return t( "X-Observers", { count } );
  };

  const renderHeader = ( ) => {
    if ( fetchingStatus ) {
      return <ActivityIndicator size={25} />;
    } if ( count ) {
      return (
        <>
          <INatIcon
            name={exploreViewIcon}
            size={18}
            color={theme.colors.onPrimary}
          />
          <Body2 className="text-white ml-3">{renderText( )}</Body2>
        </>
      );
    }
    return null;
  };

  return (
    <Pressable
      className="h-[40px] flex-row items-center justify-center"
      onPress={onPress}
      accessibilityRole="summary"
    >
      {renderHeader( )}
    </Pressable>
  );
};

export default ExploreHeaderCount;
