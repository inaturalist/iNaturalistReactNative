// @flow

import classnames from "classnames";
import {
  Body3
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import useTranslation from "sharedHooks/useTranslation.ts";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( );

type Props = {
  accuracyTest: string
};

const WarningText = ( { accuracyTest }: Props ): Node => {
  const { t } = useTranslation( );

  if ( accuracyTest === "pass" ) {
    return null;
  }

  const displayWarningText = ( ) => {
    if ( accuracyTest === "acceptable" ) {
      return t( "Zoom-in-as-much-as-possible-to-improve" );
    }
    if ( accuracyTest === "fail" ) {
      return t( "Location-accuracy-is-too-imprecise" );
    }
    return null;
  };

  return (
    <View
      pointerEvents="none"
      className={classnames( "p-4 rounded-xl", {
        "bg-white": accuracyTest === "acceptable",
        "bg-warningRed": accuracyTest === "fail"
      } )}
      style={DROP_SHADOW}
    >
      <Body3
        className={classnames(
          "text-darkGray",
          "text-center",
          {
            "text-white": accuracyTest === "fail"
          }
        )}
      >
        {displayWarningText( )}
      </Body3>
    </View>
  );
};

export default WarningText;
