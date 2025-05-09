import Divider from "components/SharedComponents/Divider/Divider";
import Heading4 from "components/SharedComponents/Typography/Heading4.tsx";
import Heading5 from "components/SharedComponents/Typography/Heading5.tsx";
import { View } from "components/styledComponents";
import React from "react";
import { GestureResponderEvent, TouchableOpacity } from "react-native";
import useTranslation from "sharedHooks/useTranslation.ts";
import colors from "styles/tailwindColors";

export interface Tab {
  id: string;
  text: string;
  testID?: string;
  onPress: ( _event: GestureResponderEvent ) => void;
}

export interface TabComponentProps {
  id: string;
  text: string;
}

interface Props {
  activeColor?: string;
  activeId: string;
  tabs: Tab[];
  TabComponent?: React.FC<TabComponentProps>;
  TextComponent?: typeof Heading4 | typeof Heading5;
}

const Tabs = ( {
  activeId,
  activeColor = String( colors?.darkGray ),
  tabs = [],
  TabComponent,
  TextComponent = Heading4
}: Props ) => {
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
                {
                  TabComponent
                    ? <TabComponent id={id} text={text} />
                    : (
                      <TextComponent
                        className="self-center pt-4 pb-3"
                        maxFontSizeMultiplier={1.5}
                        numberOfLines={1}
                      >
                        {text}
                      </TextComponent>
                    )
                }
                { active && (
                  <View
                    className="h-[4px] rounded-t"
                    style={{ backgroundColor: activeColor }}
                  />
                ) }
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
