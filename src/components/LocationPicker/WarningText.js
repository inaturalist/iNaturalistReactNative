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
  getShadow: Function
};

const WarningText = ( { accuracyTest, getShadow }: Props ): Node => {
  const theme = useTheme( );
  const { t } = useTranslation( );

  const displayWarningText = ( ) => {
    if ( accuracyTest === "acceptable" ) {
      return t( "Zoom-in" );
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
        "bg-transparent": accuracyTest === "pass",
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
