// @flow
import { Image, Pressable } from "components/styledComponents";
import { t } from "i18next";
import * as React from "react";
import { StyleSheet } from "react-native";
import { IconButton } from "react-native-paper";
import colors from "styles/tailwindColors";

type Props = {
  id: string,
  icon: any,
  onPress: any,
  img?: string,
  accessibilityLabel: string,
  accessibilityRole?: string,
  active: boolean,
  size: number,
};

const imgStyle = ( size, active ) => StyleSheet.create( {
  img: {
    borderWidth: active ? 3 : 0,
    height: size,
    width: size,
    borderColor: colors.inatGreen
  }
} );

const NavButton = ( {
  id,
  icon,
  onPress,
  img,
  active,
  accessibilityLabel,
  accessibilityRole = "link",
  size
}: Props ): React.Node => {
  /* eslint-disable react/jsx-props-no-spreading */
  const sharedProps = {
    onPress,
    testID: id,
    accessibilityRole,
    accessibilityLabel: t( accessibilityLabel ),
    accessibilityState: {
      selected: active,
      expanded: active,
      disabled: false
    }
  };

  if ( img ) {
    return (
      <Pressable {...sharedProps}>
        <Image
          accessibilityRole="image"
          className="rounded-full"
          style={imgStyle( size, active ).img}
          source={img}
        />
      </Pressable>
    );
  }

  return (
    <IconButton
      icon={icon}
      iconColor={active ? colors.inatGreen : colors.darkGray}
      size={size}
      {...sharedProps}
    />
  );
};

export default NavButton;
