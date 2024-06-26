import {
  INatIcon,
  List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { useTheme } from "react-native-paper";

interface Props {
  error: string;
}

const Error = ( { error }: Props ) => {
  const theme = useTheme( );

  return (
    <View className="flex-row items-center justify-center mt-5">
      <INatIcon name="triangle-exclamation" size={19} color={theme.colors.error} />
      <List2 className="color-white ml-3">
        {error}
      </List2>
    </View>
  );
};

export default Error;
