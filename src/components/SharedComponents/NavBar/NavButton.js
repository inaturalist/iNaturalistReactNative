// @flow
import { Image, Pressable, View } from "components/styledComponents";
import * as React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import colors from "styles/tailwindColors";

type Props = {
  id: string,
  icon: any,
  onPress: any,
  img?: string,
  accessibilityLabel: string,
  accessibilityRole?: string,
  active: bool
};

const NavButton = ( {
  id,
  icon,
  onPress,
  img,
  active,
  accessibilityLabel,
  accessibilityRole = "link"
}: Props ): React.Node => {
  const backgroundColor = {
    backgroundColor: active ? colors.primary : "transparent"
  };
  return (
    <Pressable
      className="h-9 bg"
      onPress={onPress}
      testID={id}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      disabled={active}
      accessibilityState={{
        selected: active,
        expanded: active,
        disabled: active
      }}
    >
      {img ? (
        <View className="w-9 h-9 rounded-full" style={backgroundColor}>
          <Image
            accessibilityRole="image"
            className="w-8 h-8 rounded-full m-auto"
            source={img}
          />
        </View>
      ) : (
        <IconMaterial
          accessibilityRole="image"
          name={icon}
          size={35}
          color={active ? colors.primary : colors.logInGray}
        />
      )}
    </Pressable>
  );
};

export default NavButton;
