import { INatIcon } from "components/SharedComponents";
import { FasterImageView, View } from "components/styledComponents";
import React from "react";
import type { ImageStyle } from "react-native";
import colors from "styles/tailwindColors";

interface Props {
  active?: boolean;
  large?: boolean;
  medium?: boolean;
  small?: boolean;
  // size of the icon; overrides large, medium, and small
  size?: number;
  uri?: string;
}

const UserIcon = ( {
  active,
  large,
  medium,
  size: sizeProp,
  small,
  uri
}: Props ) => {
  const getSize = ( ) => {
    if ( sizeProp ) return sizeProp;
    if ( small ) {
      return 22;
    }
    if ( large ) {
      return 134;
    }
    if ( medium ) {
      return 62;
    }
    return 40;
  };

  const size = getSize( );

  // For unknown reasons, the green border doesn't show up on Android using nativewind classNames
  // but it works with style, might warrant further investigation or an issue in nativewind
  const style: ImageStyle = {
    width: size,
    height: size,
    overflow: "hidden"
  };
  const activeStyle: ImageStyle = {
    borderColor: String( colors?.inatGreen ),
    borderWidth: 3,
    borderRadius: size / 2
  };
  return (
    uri
      ? (
        <View
          accessibilityRole="image"
          accessibilityIgnoresInvertColors
          testID="UserIcon.photo"
        >
          <FasterImageView
            style={{
              ...(
                active
                  ? activeStyle
                  : {}
              ),
              ...style
            }}
            source={{
              url: uri,
              borderRadius: size / 2,
              resizeMode: "cover"
            }}
          />
        </View>
      )
      : (
        <INatIcon
          name="person"
          size={size}
        />
      )

  );
};

export default UserIcon;
