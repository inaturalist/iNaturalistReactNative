import Divider from "components/SharedComponents/Divider/Divider";
import Heading4 from "components/SharedComponents/Typography/Heading4";
import type Heading5 from "components/SharedComponents/Typography/Heading5";
import { View } from "components/styledComponents";
import React, { useEffect, useRef } from "react";
import type { GestureResponderEvent } from "react-native";
import { ScrollView, TouchableOpacity, useWindowDimensions } from "react-native";
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
  scrollable?: boolean;
}

const EMPTY_TABS: Tab[] = [];

// first two tabs need to occupy less than 100% of the screen width
// so the user can be cued by a third option peeking out
const SCROLLABLE_TAB_WIDTH_RATIO = 0.42;

const SCROLL_STYLE = { flexGrow: 0 };

const Tabs = ( {
  activeId,
  activeColor = String( colors?.darkGray ),
  tabs = EMPTY_TABS,
  TabComponent,
  TextComponent = Heading4,
  scrollable = false,
}: Props ) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions( );
  const tabWidth = width * SCROLLABLE_TAB_WIDTH_RATIO;
  const scrollableTabStyle = { width: tabWidth };
  const scrollViewRef = useRef<ScrollView>( null );
  const activeIndex = tabs.findIndex( tab => tab.id === activeId );
  const lastScrolledIndex = useRef<number | null>( null );

  useEffect( ( ) => {
    if ( !scrollable || activeIndex < 0 ) return;
    const maxOffset = Math.max( tabWidth * tabs.length - width, 0 );
    // Center the active tab, or scroll as far as it'll go for the first & last
    const offset = Math.min(
      Math.max( ( activeIndex + 0.5 ) * tabWidth - width / 2, 0 ),
      maxOffset,
    );
    const animated = lastScrolledIndex.current !== null
      && lastScrolledIndex.current !== activeIndex;
    lastScrolledIndex.current = activeIndex;
    scrollViewRef.current?.scrollTo( { x: offset, animated } );
  }, [activeIndex, scrollable, tabWidth, tabs.length, width] );

  const renderedTabs = tabs.map( ( {
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
      <View
        key={id}
        className={scrollable
          ? undefined
          : "flex-1"}
        style={scrollable
          ? scrollableTabStyle
          : undefined}
      >
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
  } );

  return (
    <>
      {scrollable
        ? (
          <ScrollView
            accessibilityRole="tablist"
            horizontal
            ref={scrollViewRef}
            showsHorizontalScrollIndicator={false}
            style={SCROLL_STYLE}
          >
            {renderedTabs}
          </ScrollView>
        )
        : (
          <View className="flex flex-row" accessibilityRole="tablist">
            {renderedTabs}
          </View>
        )}
      <Divider />
    </>
  );
};

export default Tabs;
