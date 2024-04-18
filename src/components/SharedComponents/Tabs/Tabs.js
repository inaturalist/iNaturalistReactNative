// @flow

import Divider from "components/SharedComponents/Divider/Divider";
import Heading4 from "components/SharedComponents/Typography/Heading4";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { TouchableOpacity } from "react-native";
import useTranslation from "sharedHooks/useTranslation";

type Tab = {
  id: string,
  text: string,
  testID?: string,
  onPress: ( ) => void
}

type Props = {
  tabs: Tab[],
  activeId: string,
}

const DEFAULT_TABS = [];
const Tabs = ( { tabs = DEFAULT_TABS, activeId }: Props ): Node => {
  const { t } = useTranslation();
  return (
    <>
      <View className="flex flex-row" accessibilityRole="tablist">
        {tabs.map( ( {
          id, text, onPress, testID
        } ) => {
          const active = activeId === id;
          return (
            <View key={id} className="flex-1">
              <TouchableOpacity
                onPress={( ...args ) => {
                  if ( !active ) {
                    onPress( ...args );
                  }
                }}
                testID={testID || `${id}-tab`}
                accessibilityRole="tab"
                accessibilityLabel={text}
                accessibilityHint={t( "Switches-to-tab", { tab: text } )}
                accessibilityState={{
                  selected: active,
                  expanded: active
                }}
              >
                <Heading4 className="self-center pt-4 pb-3">{text}</Heading4>
                { active && <View className="h-[4px] rounded-t bg-darkGray" /> }
              </TouchableOpacity>
            </View>
          );
        } )}
      </View>
      <Divider />
    </>
  );
};

export default Tabs;
