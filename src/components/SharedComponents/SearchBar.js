// @flow
import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";
import { Platform } from "react-native";
import { TextInput, useTheme } from "react-native-paper";
import { getShadowStyle } from "styles/global";

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 2,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 5
} );

type Props = {
  containerClass?: string,
  handleTextChange: Function,
  value: string,
  testID?: string
}

// Ensure this component is placed outside of scroll views

const SearchBar = ( {
  containerClass,
  testID,
  handleTextChange,
  value
}: Props ): React.Node => {
  const theme = useTheme( );

  return (
    <View className={containerClass}>
      <TextInput
        accessibilityLabel="Search bar"
        keyboardType="default"
        mode="flat"
        onChangeText={handleTextChange}
        placeholder={value}
        className="bg-white w-full rounded-lg h-[45px]"
        testID={testID}
        style={getShadow( theme.colors.primary )}
        underlineColor={theme.colors.primary}
        activeUnderlineColor={theme.colors.primary}
        // kind of tricky to change the font here:
        // https://github.com/callstack/react-native-paper/issues/3615#issuecomment-1402025033
        theme={{
          fonts: {
            bodyLarge:
              {
                ...theme.fonts.bodyLarge,
                fontFamily: `Whitney-Light${Platform.OS === "ios" ? "" : "-Pro"}`
              }
          }
        }}
      />
      <View className="absolute right-4 top-4">
        <INatIcon name="magnifying-glass" size={14} />
      </View>
    </View>
  );
};

export default SearchBar;
