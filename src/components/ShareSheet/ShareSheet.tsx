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

const Button = ( { onPress, title, style }: ButtonProps ) => (
  <Pressable accessibilityRole="button" onPress={onPress}>
    {/* eslint-disable-next-line no-use-before-define */}
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
  // eslint-disable-next-line no-use-before-define
  } = styles;

  return (
    <View style={container}>
      <Text style={text}>
        {`Share ${sharedData.length} photos with iNaturalist`}
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

export default ShareSheet;
