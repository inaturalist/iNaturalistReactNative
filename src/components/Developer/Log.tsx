/* eslint-disable i18next/no-literal-string */
import {
  Heading4,
  ScrollViewWrapper,
} from "components/SharedComponents";
import {
  fontMonoClass,
  TextInput,
  View,
} from "components/styledComponents";
import React, {
  useEffect,
  useState,
} from "react";
import { Platform, Text } from "react-native";

import { getLogContents } from "./logManagementHelpers";

const Log = () => {
  const [content, setContent] = useState<{text: string; length: number} | null>( null );

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
            <Text className={`text-xs h-fit mb-5 ${fontMonoClass}`} selectable>{content.text}</Text>
          )}
      </View>
    </ScrollViewWrapper>
  );
};

export default Log;
