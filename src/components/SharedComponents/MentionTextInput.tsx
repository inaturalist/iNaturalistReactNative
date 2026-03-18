import {
  ActivityIndicator,
  Body3,
} from "components/SharedComponents";
import { TextInput, View } from "components/styledComponents";
import UserListItem from "components/UserList/UserListItem";
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import type { TextInputProps } from "react-native";
import { ScrollView, StyleSheet } from "react-native";
import { useTranslation } from "sharedHooks";
import useUserSearch from "sharedHooks/useUserSearch";

// Matches @username at the end of the input string.
// \B ensures @ doesn't follow a word char (prevents matching emails)
// Username must start with a letter
// $ anchor means mentions only trigger when typing at the end of the text;
// editing mid-text won't show the dropdown (would require cursor tracking)
const MENTION_MATCH = /\B@([A-Za-z][\w-]*)$/;
const DEBOUNCE_MS = 400;
const MENTION_LIST_MAX_HEIGHT = 200;
const MIN_INPUT_HEIGHT = 80;

interface MentionTextInputProps extends Omit<TextInputProps, "value" | "onChangeText"> {
  value: string;
  onChangeText: ( text: string ) => void;
  InputComponent?: React.ComponentType<TextInputProps>;
}

function getMentionQuery( value: string ): string {
  const match = value.match( MENTION_MATCH );
  return match
    ? match[1]
    : "";
}

function getLastAtIndex( value: string ): number {
  const match = value.match( MENTION_MATCH );
  if ( !match || match.index === undefined ) return -1;
  return match.index;
}

const MentionTextInput = ( {
  accessibilityLabel,
  autoFocus,
  InputComponent,
  keyboardType,
  maxFontSizeMultiplier,
  maxLength,
  multiline,
  onChangeText,
  placeholder,
  style,
  testID,
  value,
}: MentionTextInputProps ) => {
  const { t } = useTranslation( );
  const Input = InputComponent ?? TextInput;

  const [debouncedQuery, setDebouncedQuery] = useState( "" );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>( null );

  const handleChangeText = useCallback( ( text: string ) => {
    onChangeText( text );

    if ( debounceRef.current ) {
      clearTimeout( debounceRef.current );
    }

    const query = getMentionQuery( text );
    if ( query === "" ) {
      setDebouncedQuery( "" );
      return;
    }

    debounceRef.current = setTimeout( ( ) => {
      setDebouncedQuery( query );
      debounceRef.current = null;
    }, DEBOUNCE_MS );
  }, [onChangeText] );

  const { users, isLoading } = useUserSearch( debouncedQuery );

  const handleSelectUser = useCallback(
    ( item: { login?: string } ) => {
      const username = item?.login;
      const lastAt = getLastAtIndex( value );
      const newValue = `${value.slice( 0, lastAt )}@${username} `;
      onChangeText( newValue );
    },
    [value, onChangeText],
  );

  const showList = getMentionQuery( value ).length > 0;

  const inputStyle = useMemo( ( ) => {
    if ( !showList ) return style;
    const flattenedStyles = StyleSheet.flatten( style );
    if ( typeof flattenedStyles?.height === "number" ) {
      return [
        style,
        { height: Math.max( flattenedStyles.height - MENTION_LIST_MAX_HEIGHT, MIN_INPUT_HEIGHT ) },
      ];
    }
    return style;
  }, [style, showList] );

  const emptyListContent = isLoading
    ? (
      <View className="p-4 items-center justify-center min-h-[200px]">
        <ActivityIndicator size="small" />
      </View>
    )
    : (
      <View className="p-4 min-h-[200px]">
        <Body3 className="text-center text-darkGray">
          {t( "No-results-found-for-that-search" )}
        </Body3>
      </View>
    );

  return (
    <View className="flex-1">
      <Input
        accessibilityLabel={accessibilityLabel}
        autoFocus={autoFocus}
        keyboardType={keyboardType}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        maxLength={maxLength}
        multiline={multiline}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        style={inputStyle}
        testID={testID}
        value={value}
      />
      {showList && (
        <View
          className="bg-white border border-lightGray rounded-lg overflow-hidden max-h-[200px]"
        >
          <ScrollView keyboardShouldPersistTaps="handled">
            {users.length === 0
              ? emptyListContent
              : users.map( ( item, index ) => (
                <View key={item.id}>
                  {index > 0 && <View className="border-b border-lightGray" />}
                  <UserListItem
                    item={{ user: item }}
                    countText=""
                    onPress={( ) => handleSelectUser( item )}
                    accessibilityLabel={t( "Select-user" )}
                  />
                </View>
              ) )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default MentionTextInput;
