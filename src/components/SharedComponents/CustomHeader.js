// @flow

import React from "react";
import { Text, View } from "react-native";
import type { Node } from "react";
import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";

import { viewStyles, textStyles } from "../../styles/sharedComponents/customHeader";

type Props = {
  headerText: string
}

const CustomHeader = ( { headerText }: Props ): Node => {
  const navigation = useNavigation( );

  return (
    <View style={viewStyles.row}>
      <HeaderBackButton onPress={( ) => navigation.goBack( )} style={viewStyles.element}/>
      <Text style={[viewStyles.element, textStyles.text]}>{headerText}</Text>
      <View style={viewStyles.element} />
    </View>
  );
};

export default CustomHeader;
