import classnames from "classnames";
import {
  Body3,
  Heading2,
  INatIcon,
  INatIconButton
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React, { useState } from "react";
import { useDeviceOrientation, useTranslation } from "sharedHooks";
import { storage } from "stores/useStore";
import colors from "styles/tailwindColors";

export type ObsCreateItem = {
  text?: string,
  icon: string,
  onPress: ( ) => void,
  testID: string,
  className: string,
  accessibilityLabel: string,
  accessibilityHint: string
}

type Props = {
  obsCreateItems: {
    [addType: string]: ObsCreateItem
  }
};

const HIDE_ADD_OBS_HELP_TEXT = "hideAddObsHelpText";

const AddObsModalHelp = ( {
  obsCreateItems
}: Props ) => {
  const { t } = useTranslation( );
  const { screenHeight } = useDeviceOrientation( );
  const [hideHelpText, setHideHelpText] = useState( storage.getBoolean( HIDE_ADD_OBS_HELP_TEXT ) );

  // targeting iPhone SE, which has height of 667
  const isSmallScreen = screenHeight < 670;

  if ( hideHelpText ) return null;

  return (
    <View
      className={classnames( "bg-white rounded-3xl py-[23px] mb-20", {
        "py-[5px] mb-10": isSmallScreen
      } )}
    >
      <View className={classnames( "flex-row items-center mb-2" )}>
        <Heading2
          maxFontSizeMultiplier={1.5}
          testID="identify-text"
          className={classnames( "pl-[25px]", {
            "px-8 -mb-2 mt-2": isSmallScreen
          } )}
        >
          {t( "Identify-an-organism" )}
        </Heading2>
        <View className={classnames( "ml-auto pr-[12px]", {
          "pb-6": isSmallScreen
        } )}
        >
          <INatIconButton
            icon="close"
            color={String( colors?.darkGray )}
            size={19}
            onPress={async ( ) => {
              setHideHelpText( true );
              storage.set( HIDE_ADD_OBS_HELP_TEXT, true );
            }}
            accessibilityLabel={t( "Close" )}
            accessibilityHint={t( "Closes-new-observation-explanation" )}
          />
        </View>
      </View>
      <View className={classnames( "px-[23px]", {
        "px-[10px]": isSmallScreen
      } )}
      >
        {Object.keys( obsCreateItems )
          .filter( k => k !== "closeButton" )
          .map( k => {
            const item = obsCreateItems[k];
            return (
              <Pressable
                accessibilityRole="button"
                className={classnames( "flex-row items-center p-2 my-1", {
                  "p-1": isSmallScreen
                } )}
                key={k}
                onPress={item.onPress}
              >
                <INatIcon
                  name={item.icon}
                  size={30}
                  color={String(
                    item.icon === "green-camera-sparkle"
                      ? colors?.inatGreen
                      : colors?.darkGray
                  )}
                />
                <Body3 maxFontSizeMultiplier={1.5} className="ml-[20px] shrink">
                  {item.text}
                </Body3>
              </Pressable>
            );
          } )}
      </View>
    </View>
  );
};

export default AddObsModalHelp;
