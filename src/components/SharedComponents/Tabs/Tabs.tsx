import Divider from "components/SharedComponents/Divider/Divider";
import Heading4 from "components/SharedComponents/Typography/Heading4.tsx";
import { View } from "components/styledComponents";
import React from "react";
import { GestureResponderEvent, TouchableOpacity } from "react-native";
import useTranslation from "sharedHooks/useTranslation";

export interface Tab {
  id: string;
  text: string;
  testID?: string;
  onPress: ( _event: GestureResponderEvent ) => void
}

interface Props {
  tabs: Tab[];
  activeId: string;
}

const Tabs = ( { tabs = [], activeId }: Props ) => {
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
