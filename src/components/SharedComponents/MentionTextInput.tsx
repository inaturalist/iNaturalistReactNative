import type { ApiUser } from "api/types";
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
import type {
  TextInput as RNTextInput,
  TextInputProps,
  TextInputSelectionChangeEvent,
} from "react-native";
import { ScrollView, StyleSheet } from "react-native";
import {
  getMentionAtCursor,
  insertMention,
  MENTION_SUGGESTION_LIMIT,
} from "sharedHelpers/mentions";
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
  // Users to show as soon as the user types "@", and above the search results
  // when they match what's typed, e.g. the current participants on an observation
  suggestedUsers?: ApiUser[];
}

const startsWithQuery = ( user: ApiUser, query: string ) => {
  const lowerQuery = query.toLowerCase( );
  return !!user.login?.toLowerCase( ).startsWith( lowerQuery )
    || !!user.name?.toLowerCase( ).startsWith( lowerQuery );
};

interface MentionListItemProps {
  onSelect: ( user: ApiUser ) => void;
  showDivider: boolean;
  user: ApiUser;
}

const MentionListItem = ( { onSelect, showDivider, user }: MentionListItemProps ) => {
  const { t } = useTranslation( );
  return (
    <View>
      {showDivider && <View className="border-b border-lightGray" />}
      <UserListItem
        item={{ user }}
        countText=""
        onPress={( ) => onSelect( user )}
        accessibilityLabel={t( "Select-user" )}
        iconVariant="mention"
      />
    </View>
  );
};

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
  suggestedUsers,
  testID,
}: MentionTextInputProps ) => {
  const { t } = useTranslation( );
  const Input = InputComponent ?? TextInput;

  const inputRef = useRef<RNTextInput | null>( null );
  const [debouncedQuery, setDebouncedQuery] = useState( "" );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>( null );
  // Cursor position, or null when a range of text is selected. iOS and
  // Android fire onChangeText and onSelectionChange in different orders, so
  // both handlers read the latest text and cursor from refs, and the state
  // copy of the cursor is only used for rendering
  const [cursor, setCursor] = useState<number | null>( currentValue.length );
  const cursorRef = useRef<number | null>( currentValue.length );
  const textRef = useRef( currentValue );
  // The last text JS gave the native input, as defaultValue or through
  // setNativeProps. Fabric ignores a text prop that matches this, even if
  // the user has typed since, so see handleSelectUser
  const lastPushedTextRef = useRef( defaultValue );
  // Cursor position right after the user picked from the list. When
  // punctuation follows the mention, the cursor sits at the end of a complete
  // mention, so keep the list closed until the user types or moves the cursor
  const [pickedAt, setPickedAt] = useState<number | null>( null );
  const pickedAtRef = useRef<number | null>( null );
  const clearPickedAt = useCallback( ( ) => {
    pickedAtRef.current = null;
    setPickedAt( null );
  }, [] );

  useImperativeHandle( ref, ( ) => ( {
    clear: ( ) => inputRef.current?.clear( ),
  } ) );

  // Always debounced, including clearing the query, so the brief mismatch
  // between text and cursor while the two native events arrive never
  // reaches the search
  const updateQuery = useCallback( ( text: string, position: number | null ) => {
    if ( debounceRef.current ) {
      clearTimeout( debounceRef.current );
    }
    const query = position === null || pickedAtRef.current !== null
      ? ""
      : getMentionAtCursor( text, position )?.query ?? "";
    debounceRef.current = setTimeout( ( ) => {
      setDebouncedQuery( query );
      debounceRef.current = null;
    }, DEBOUNCE_MS );
  }, [] );

  const handleChangeText = useCallback( ( text: string ) => {
    onChangeText( text );
    textRef.current = text;
    clearPickedAt( );
    updateQuery( text, cursorRef.current );
  }, [clearPickedAt, onChangeText, updateQuery] );

  const handleSelectionChange = useCallback(
    ( event: TextInputSelectionChangeEvent ) => {
      const { start, end } = event.nativeEvent.selection;
      const position = start === end
        ? end
        : null;
      cursorRef.current = position;
      setCursor( position );
      // Android reports the cursor move from setSelection after a pick
      if ( position !== pickedAtRef.current ) {
        clearPickedAt( );
      }
      updateQuery( textRef.current, position );
    },
    [clearPickedAt, updateQuery],
  );

  const { users, isLoading } = useUserSearch( debouncedQuery );

  const handleSelectUser = useCallback(
    ( item: { login?: string } ) => {
      const username = item?.login;
      const position = cursorRef.current;
      const mention = position === null
        ? null
        : getMentionAtCursor( textRef.current, position );
      if ( !username || !mention ) return;
      const { text: newValue, cursor: newCursor } = insertMention(
        textRef.current,
        mention,
        username,
      );
      if ( newValue === lastPushedTextRef.current ) {
        // Change the text prop first so the native side applies the new
        // text, e.g. when the user removes a mention and picks the same
        // user again
        inputRef.current?.setNativeProps( { text: textRef.current } );
      }
      inputRef.current?.setNativeProps( { text: newValue } );
      lastPushedTextRef.current = newValue;
      inputRef.current?.setSelection( newCursor, newCursor );
      textRef.current = newValue;
      cursorRef.current = newCursor;
      setCursor( newCursor );
      pickedAtRef.current = newCursor;
      setPickedAt( newCursor );
      if ( debounceRef.current ) {
        clearTimeout( debounceRef.current );
        debounceRef.current = null;
      }
      setDebouncedQuery( "" );
      onChangeText( newValue );
    },
    [onChangeText],
  );

  const mention = cursor === null || pickedAt !== null
    ? null
    : getMentionAtCursor( currentValue, cursor );
  const query = mention?.query ?? "";

  const listedUsers = useMemo( ( ) => {
    const matchingSuggestions = ( suggestedUsers ?? [] )
      .filter( user => startsWithQuery( user, query ) );
    const searchResults = query === ""
      ? []
      : users.filter( user => !matchingSuggestions.some( match => match.id === user.id ) );
    return [...matchingSuggestions, ...searchResults].slice( 0, MENTION_SUGGESTION_LIMIT );
  }, [query, suggestedUsers, users] );

  const showList = !!mention && ( query !== "" || listedUsers.length > 0 );
  // The search hasn't caught up with what's typed yet
  const isSearchPending = query !== "" && ( debouncedQuery !== query || isLoading );

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

  const emptyListContent = isSearchPending
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
        onSelectionChange={handleSelectionChange}
        placeholder={placeholder}
        style={inputStyle}
        testID={testID}
      />
      {showList && (
        <View
          className="bg-white border border-lightGray rounded-lg overflow-hidden max-h-[200px]"
        >
          <ScrollView keyboardShouldPersistTaps="handled">
            {listedUsers.length === 0
              ? emptyListContent
              : listedUsers.map( ( user, index ) => (
                <MentionListItem
                  key={user.id}
                  onSelect={handleSelectUser}
                  showDivider={index > 0}
                  user={user}
                />
              ) )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default MentionTextInput;
