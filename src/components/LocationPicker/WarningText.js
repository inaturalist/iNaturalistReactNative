// @flow

import classnames from "classnames";
import {
  Body3
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  accuracyTest: string
};

const WarningText = ( { accuracyTest }: Props ): Node => {
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
    <View className="justify-center items-center">
      <View
        className={classnames( "p-4 rounded-xl bottom-[180px] max-w-[316px]", {
          "bg-transparent": accuracyTest === "pass",
          "bg-white": accuracyTest === "acceptable",
          "bg-warningRed": accuracyTest === "fail"
        } )}
      >
        <Body3
          className={classnames( "text-black", {
            "text-white": accuracyTest === "fail"
          } )}
        >
          {displayWarningText( )}
        </Body3>
      </View>
    </View>
  );
};

export default WarningText;
