import {
  ActivityIndicator,
  Body3,
} from "components/SharedComponents";
import { TextInput, View } from "components/styledComponents";
import UserListItem from "components/UserList/UserListItem";
import React, {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { TextInput as RNTextInput, TextInputProps } from "react-native";
import { ScrollView, StyleSheet } from "react-native";
import { getMentionAtCursor, insertMention } from "sharedHelpers/mentions";
import { useTranslation } from "sharedHooks";
import useUserSearch from "sharedHooks/useUserSearch";

const DEBOUNCE_MS = 400;
const MENTION_LIST_MAX_HEIGHT = 200;
const MIN_INPUT_HEIGHT = 80;

interface MentionTextInputHandle {
  clear: () => void;
}

interface MentionTextInputProps extends Omit<TextInputProps, "value" | "onChangeText"> {
  // This is the current text, owned by the parent and used only for mention computation,
  // not passed as `value` to the native input (which needs to be uncontrolled so
  // autocorrect and other default typing behaviors work).
  currentValue: string;
  ref?: React.Ref<MentionTextInputHandle>;
  onChangeText: ( text: string ) => void;
  InputComponent?: React.ComponentType<TextInputProps>;
}

const MentionTextInput = ( {
  accessibilityLabel,
  autoFocus,
  currentValue,
  defaultValue = "",
  InputComponent,
  keyboardType,
  maxFontSizeMultiplier,
  maxLength,
  multiline,
  onChangeText,
  placeholder,
  ref,
  style,
  testID,
}: MentionTextInputProps ) => {
  const { t } = useTranslation( );
  const Input = InputComponent ?? TextInput;

  const inputRef = useRef<RNTextInput | null>( null );
  const [debouncedQuery, setDebouncedQuery] = useState( "" );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>( null );

  useImperativeHandle( ref, ( ) => ( {
    clear: ( ) => inputRef.current?.clear( ),
  } ) );

  const handleChangeText = useCallback( ( text: string ) => {
    onChangeText( text );

    if ( debounceRef.current ) {
      clearTimeout( debounceRef.current );
    }

    // Mentions currently only trigger when typing at the end of the text
    const query = getMentionAtCursor( text, text.length )?.query ?? "";
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
      const mention = getMentionAtCursor( currentValue, currentValue.length );
      if ( !username || !mention ) return;
      const { text: newValue } = insertMention( currentValue, mention, username );
      inputRef.current?.setNativeProps( { text: newValue } );
      if ( debounceRef.current ) {
        clearTimeout( debounceRef.current );
        debounceRef.current = null;
      }
      setDebouncedQuery( "" );
      onChangeText( newValue );
    },
    [currentValue, onChangeText],
  );

  const showList = !!getMentionAtCursor( currentValue, currentValue.length )?.query;

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
        ref={inputRef}
        accessibilityLabel={accessibilityLabel}
        autoFocus={autoFocus}
        defaultValue={defaultValue}
        keyboardType={keyboardType}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        maxLength={maxLength}
        multiline={multiline}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        style={inputStyle}
        testID={testID}
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
                    iconVariant="mention"
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
