// @flow
import { fontRegular } from "appConstants/fontFamilies.ts";
import { INatIcon, INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { TextInput, useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";
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
  autoFocus?: boolean,
  clearSearch?: Function,
  containerClass?: string,
  handleTextChange: Function,
  hasShadow?: boolean,
  input?: any,
  placeholder?: string,
  testID?: string,
  value: string,
}

// Ensure this component is placed outside of scroll views

const SearchBar = ( {
  autoFocus = false,
  clearSearch,
  containerClass,
  handleTextChange,
  hasShadow,
  input,
  placeholder,
  testID,
  value
}: Props ): Node => {
  const theme = useTheme( );
  const { t } = useTranslation( );

  const outlineStyle = {
    borderColor: "lightgray",
    borderRadius: 8,
    borderWidth: 1
  };

  const style = {
    ...( hasShadow
      ? getShadow( theme.colors.primary )
      : {} ),
    fontSize: 16,
    lineHeight: 18,
    paddingRight: 28
  };

  // kind of tricky to change the font here:
  // https://github.com/callstack/react-native-paper/issues/3615#issuecomment-1402025033
  const fontTheme = {
    fonts: {
      bodyLarge:
        {
          ...theme.fonts.bodyLarge,
          fontFamily: fontRegular
        }
    }
  };

  return (
    <View className={containerClass}>
      <TextInput
        ref={input}
        accessibilityLabel={t( "Search-for-a-taxon" )}
        activeUnderlineColor={theme.colors.primary}
        autoFocus={autoFocus}
        dense
        keyboardType="default"
        mode="outlined"
        onChangeText={handleTextChange}
        outlineStyle={outlineStyle}
        placeholder={placeholder}
        style={style}
        testID={testID}
        theme={fontTheme}
        underlineColor={theme.colors.primary}
        value={value}
      />
      {value?.length > 0 && clearSearch
        ? (
          <View className="absolute right-0 top-[10px]">
            <INatIconButton
              icon="close"
              accessibilityLabel={t( "Close-search" )}
              size={18}
              onPress={clearSearch}
            />
          </View>
        )
        : (
          <View className="absolute right-4 top-[15px]">
            <INatIcon name="magnifying-glass" size={18} />
          </View>
        )}
    </View>
  );
};

export default SearchBar;
