// @flow

import classnames from "classnames";
import {
  Body3
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  accuracyTest: string,
  getShadow: any
};

const WarningText = ( { accuracyTest, getShadow }: Props ): Node => {
  const theme = useTheme( );
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
      style={getShadow( theme.colors.primary )}
    >
      <Body3
        className={classnames(
          "text-black",
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
