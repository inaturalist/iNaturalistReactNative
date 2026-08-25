import type { ParamListBase } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import EmptySearchResults from "components/Explore/SearchScreens/EmptySearchResults";
import {
  Body2,
  INatIcon,
  SearchBar,
} from "components/SharedComponents";
import { ScreenShell } from "components/SharedComponents/ViewWrapper";
import { View } from "components/styledComponents";
import { useStackHost } from "navigation/StackHostContext";
import React, {
  useEffect, useEffectEvent, useMemo, useRef,
} from "react";
import type { ListRenderItem, TextInput } from "react-native";
import { FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { RealmTaxon } from "realmModels/types";
import { useKeyboardInfo, useTranslation } from "sharedHooks";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( {
  offsetHeight: 4,
} );

const EMPTY_TAXA: RealmTaxon[] = [];

interface Props {
  query?: string;
  setQuery: ( newQuery: string ) => void;
  // Delay focusing (and thus showing the keyboard for) the search input
  // until the screen's push/fade transition finishes, instead of focusing
  // on mount, which makes the transition janky. Only meaningful when this
  // component is rendered as its own navigation screen.
  focusAfterTransition?: boolean;
  isLoading?: boolean;
  isLocal?: boolean;
  renderItem: ListRenderItem<RealmTaxon>;
  taxa: RealmTaxon[];
}

const TaxonSearch = ( {
  focusAfterTransition = false,
  isLoading = false,
  isLocal = false,
  query = "",
  renderItem,
  setQuery,
  taxa = EMPTY_TAXA,
}: Props ) => {
  const { hasBottomTabBar } = useStackHost( );
  const { bottom } = useSafeAreaInsets( );
  const paddingBottom = !hasBottomTabBar
    ? bottom
    : 0;
  const { t } = useTranslation( );
  const { keyboardHeight, keyboardShown } = useKeyboardInfo( );
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>( );
  const searchInputRef = useRef<TextInput>( null );

  // onTransitionEnd here is defined as an effectEvent so that the listener
  // is not redefined when `query` changes which would otherwise be an effect dep
  // https://react.dev/reference/react/useEffectEvent#using-an-event-in-an-effect
  const onTransitionEnd = useEffectEvent( ( e: { data: { closing: boolean } } ) => {
    // the "closing" data is signaling this _is_ basically closing, i.e., "we're done"
    if ( !e.data?.closing && query === "" ) {
      searchInputRef.current?.focus( );
    }
  } );

  useEffect( ( ) => {
    if ( !focusAfterTransition ) {
      return ( ) => {};
    }
    const unsubscribeTransitionEnd = navigation.addListener(
      "transitionEnd",
      onTransitionEnd,
    );
    return unsubscribeTransitionEnd;
  }, [focusAfterTransition, navigation] );

  const emptyListComponent = useMemo( ( ) => (
    query.length > 0
      ? (
        <EmptySearchResults
          isLoading={isLoading}
          searchQuery="does it matter?"
          skipOfflineNotice
        />
      )
      : null
  ), [query.length, isLoading] );

  // Make sure all of the results can be scrolled to even with the keyboard
  // up
  const footerComponent = ( ) => (
    keyboardShown
      ? <View style={{ paddingBottom: paddingBottom + keyboardHeight }} />
      : <View style={{ paddingBottom }} />
  );

  return (
    <ScreenShell>
      <View
        className="bg-white px-6 pt-2 pb-[21px]"
        style={DROP_SHADOW}
      >
        <SearchBar
          handleTextChange={setQuery}
          value={query}
          testID="SearchTaxon"
          autoFocus={!focusAfterTransition && query === ""}
          input={searchInputRef}
        />
        { isLocal && (
          <View className="flex-row items-center gap-x-[19px] mt-[21px]">
            <View accessibilityElementsHidden importantForAccessibility="no" aria-hidden>
              <INatIcon name="offline" size={34} />
            </View>
            <Body2 className="flex-1">
              { t( "Showing-offline-search-results--taxa" )}
            </Body2>
          </View>
        ) }
      </View>
      <FlatList
        keyboardShouldPersistTaps="always"
        data={taxa}
        renderItem={renderItem}
        keyExtractor={taxon => String( taxon.id )}
        ListEmptyComponent={emptyListComponent}
        ListFooterComponent={footerComponent}
      />
    </ScreenShell>
  );
};

export default TaxonSearch;
