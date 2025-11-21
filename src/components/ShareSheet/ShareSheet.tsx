// Fellow developers: This is the component that is rendered when the share extension is opened.
// It uses a separate React instance and entry point that is registered in index.share.js
// It is not set up to use anything from the main app, like nativewind or styled components.
import React, { useEffect, useState } from "react";
import {
  Pressable, StyleSheet, Text, View
} from "react-native";
import { ShareMenuReactView } from "react-native-share-menu";

interface ButtonProps {
  onPress: () => void;
  title: string;
  style?: object;
}

const styles = StyleSheet.create( {
  button: {
    fontSize: 16,
    margin: 16
  },
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  text: {
    fontSize: 20,
    textAlign: "center",
    margin: 16
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  },
  destructive: {
    color: "red"
  }
} );

const Button = ( { onPress, title, style }: ButtonProps ) => (
  <Pressable accessibilityRole="button" onPress={onPress}>
    <Text style={[styles.button, style]}>{title}</Text>
  </Pressable>
);

const ShareSheet = () => {
  const [sharedData, setSharedData] = useState( [] );

  useEffect( () => {
    // @ts-expect-error data has any type here, but the actual type should come from the library
    ShareMenuReactView.data().then( ( { data } ) => {
      setSharedData( data );
    } );
  }, [] );

  const {
    container, text, buttonGroup, destructive
  } = styles;

  return (
    <View style={container}>
      <Text style={text}>
        {`Share ${sharedData.length} photos with iNaturalist?`}
      </Text>
      <View style={buttonGroup}>
        <Button
          title="Yes"
          onPress={( ) => {
            ShareMenuReactView.continueInApp( );
          }}
        />
        <Button
          title="No"
          onPress={( ) => {
            ShareMenuReactView.dismissExtension( );
          }}
          style={destructive}
        />
      </View>
    </View>
  );
};

export default ShareSheet;
