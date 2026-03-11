import { useNavigation } from "@react-navigation/native";
import {
  Button,
  Heading4,
  INatIconButton,
  ScrollViewWrapper,
} from "components/SharedComponents";
import {
  fontMonoClass,
  TextInput,
  View,
} from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { Platform, Text } from "react-native";

import { emailLogFile, getLogContents, shareLogFile } from "./logManagementHelpers";

/* eslint-disable i18next/no-literal-string */
const Log = (): Node => {
  const navigation = useNavigation( );
  const headerRight = useCallback( ( ) => (
    <>
      { Platform.OS === "ios" && (
        <View className="mr-3">
          <INatIconButton
            icon="share"
            onPress={shareLogFile}
            accessibilityLabel="Email logs"
            accessibilityHint="Opens email app"
            color="white"
          />
        </View>
      ) }
      <Button
        className="p-2"
        onPress={emailLogFile}
        text="Email log"
      />
    </>
  ), [] );

  useEffect(
    ( ) => navigation.setOptions( { headerRight } ),
    [headerRight, navigation],
  );

  const [content, setContent] = useState( null );

  useEffect( ( ) => {
    getLogContents( ).then( logContents => {
      const lines = logContents.split( "\n" );
      const trimmedContent = lines
        .slice( lines.length - 1000, lines.length )
        .join( "\n" );
      setContent( { text: trimmedContent, length: lines.length } );
    } );
  }, [] );

  if ( !content ) {
    return null;
  }

  return (
    <ScrollViewWrapper>
      <View className="p-5">
        { content.length > 1000 && (
          <Heading4>Last 1000 lines of log</Heading4>
        ) }
        {Platform.OS === "ios"
          ? (
            // iOS requires a TextInput for word selections
            // https://github.com/facebook/react-native/issues/13938#issuecomment-520590673
            <TextInput
              accessibilityLabel="Text input field"
              value={content.text}
              editable={false}
              multiline
            />
          )
          : (
            // Android can do word selections just with <Text>
            <Text className={`text-xs h-fit mb-5 ${fontMonoClass}`} selectable>{content}</Text>
          )}
      </View>
    </ScrollViewWrapper>
  );
};

export default Log;
