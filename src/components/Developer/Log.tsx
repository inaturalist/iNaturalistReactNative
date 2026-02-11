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
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { Platform, Text } from "react-native";
import useLogs from "sharedHooks/useLogs";

/* eslint-disable i18next/no-literal-string */
const Log = () => {
  const navigation = useNavigation( );
  const { emailLogFile, shareLogFile, getLogContents } = useLogs( );
  const [logContents, setLogContents] = useState( "" );
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
  ), [emailLogFile, shareLogFile] );

  useEffect(
    ( ) => navigation.setOptions( { headerRight } ),
    [headerRight, navigation],
  );

  useEffect( ( ) => {
    getLogContents( ).then( stuff => setLogContents( stuff ) );
  } );

  const lines = logContents.split( "\n" );
  const content = lines.slice( lines.length - 1000, lines.length ).join( "\n" );

  return (
    <ScrollViewWrapper>
      <View className="p-5">
        { lines.length > 1000 && (
          <Heading4>Last 1000 lines of log</Heading4>
        ) }
        {Platform.OS === "ios"
          ? (
            // iOS requires a TextInput for word selections
            // https://github.com/facebook/react-native/issues/13938#issuecomment-520590673
            <TextInput
              accessibilityLabel="Text input field"
              value={content}
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
