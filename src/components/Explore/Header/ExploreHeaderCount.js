// @flow

import {
  ActivityIndicator,
  Body2,
  INatIcon,
} from "components/SharedComponents";
import { Pressable } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

type Props = {
  count: ?number,
  exploreView: string,
  exploreViewIcon: string,
  isFetching: boolean,
  onPress: Function,
}

const ExploreHeaderCount = ( {
  count,
  exploreView,
  exploreViewIcon,
  isFetching,
  onPress,
}: Props ): Node => {
  const { t } = useTranslation( );

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
    if ( isFetching ) {
      return <ActivityIndicator size={25} />;
    } if ( count !== null ) {
      return (
        <>
          <INatIcon
            name={exploreViewIcon}
            size={18}
            color={colors.white}
          />
          <Body2
            maxFontSizeMultiplier={1.5}
            className="text-white ml-3"
          >
            {renderText( )}
          </Body2>
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
