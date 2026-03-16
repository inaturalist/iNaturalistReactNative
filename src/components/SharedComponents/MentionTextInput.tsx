import {
  ActivityIndicator,
  Body3,
} from "components/SharedComponents";
import { TextInput, View } from "components/styledComponents";
import UserListItem from "components/UserList/UserListItem";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { TextInputProps } from "react-native";
import { ScrollView, StyleSheet } from "react-native";
import { useTranslation } from "sharedHooks";
import useUserSearch from "sharedHooks/useUserSearch";

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

  const mentionQuery = useMemo( ( ) => getMentionQuery( value ), [value] );
  const [debouncedQuery, setDebouncedQuery] = useState( "" );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>( null );

  useEffect( ( ) => {
    if ( debounceRef.current ) {
      clearTimeout( debounceRef.current );
      debounceRef.current = null;
    }
    if ( mentionQuery === "" ) {
      setDebouncedQuery( "" );
      return ( ) => { };
    }
    debounceRef.current = setTimeout( ( ) => {
      setDebouncedQuery( mentionQuery );
      debounceRef.current = null;
    }, DEBOUNCE_MS );
    return ( ) => {
      if ( debounceRef.current ) clearTimeout( debounceRef.current );
    };
  }, [mentionQuery] );

  const { users, isLoading } = useUserSearch( debouncedQuery );

  const handleSelectUser = useCallback(
    ( item: { login?: string } ) => {
      const login = item?.login;
      if ( !login ) return;
      const lastAt = getLastAtIndex( value );
      if ( lastAt < 0 ) return;
      const newValue = `${value.slice( 0, lastAt )}@${login} `;
      onChangeText( newValue );
    },
    [value, onChangeText],
  );

  const showList = mentionQuery.length > 0;

  const inputStyle = useMemo( ( ) => {
    if ( !showList ) return style;
    const flat = StyleSheet.flatten( style );
    if ( typeof flat?.height === "number" ) {
      return [
        style,
        { height: Math.max( flat.height - MENTION_LIST_MAX_HEIGHT, MIN_INPUT_HEIGHT ) },
      ];
    }
    return style;
  }, [style, showList] );

  const emptyListContent = useMemo( ( ) => {
    if ( !showList ) return null;
    if ( isLoading ) {
      return (
        <View className="p-4 items-center justify-center min-h-[200px]">
          <ActivityIndicator size="small" />
        </View>
      );
    }
    return (
      <View className="p-4 min-h-[200px]">
        <Body3 className="text-center text-darkGray">
          {t( "No-results-found-for-that-search" )}
        </Body3>
      </View>
    );
  }, [showList, isLoading, t] );

  return (
    <View className="flex-1">
      <Input
        accessibilityLabel={accessibilityLabel}
        autoFocus={autoFocus}
        keyboardType={keyboardType}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        maxLength={maxLength}
        multiline={multiline}
        onChangeText={onChangeText}
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
                <View key={item?.id}>
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
