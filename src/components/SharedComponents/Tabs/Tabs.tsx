import Divider from "components/SharedComponents/Divider/Divider";
import Heading4 from "components/SharedComponents/Typography/Heading4";
import type Heading5 from "components/SharedComponents/Typography/Heading5";
import { View } from "components/styledComponents";
import React from "react";
import type { GestureResponderEvent } from "react-native";
import { TouchableOpacity } from "react-native";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

export interface Tab {
  id: string;
  text: string;
  testID?: string;
  onPress: ( _event: GestureResponderEvent ) => void;
  // Per-tab content, e.g. a stat particular to this tab. Takes precedence
  // over TabComponent, which is shared by all tabs.
  renderComponent?: ( ) => React.ReactNode;
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

const EMPTY_TABS: Tab[] = [];

const Tabs = ( {
  activeId,
  activeColor = String( colors?.darkGray ),
  tabs = EMPTY_TABS,
  TabComponent,
  TextComponent = Heading4,
}: Props ) => {
  const { t } = useTranslation();
  return (
    <>
      <View className="flex flex-row" accessibilityRole="tablist">
        {tabs.map( ( {
          id, text, onPress, testID, renderComponent,
        } ) => {
          const active = activeId === id;
          let tabContent: React.ReactNode;
          if ( renderComponent ) {
            tabContent = renderComponent( );
          } else if ( TabComponent ) {
            tabContent = <TabComponent id={id} text={text} />;
          } else {
            tabContent = (
              <TextComponent
                className="self-center pt-4 pb-3"
                maxFontSizeMultiplier={1.5}
                numberOfLines={1}
              >
                {text}
              </TextComponent>
            );
          }
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
                  expanded: active,
                }}
              >
                {tabContent}
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
