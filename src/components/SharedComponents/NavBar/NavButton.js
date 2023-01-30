// @flow
import classNames from "classnames";
import { Image, Pressable } from "components/styledComponents";
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
  active: bool,
  size: number
};

const NavButton = ( {
  id,
  icon,
  onPress,
  img,
  active,
  accessibilityLabel,
  accessibilityRole = "link",
  size
}: Props ): React.Node => (
  <Pressable
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
      <Image
        accessibilityRole="image"
        className={classNames(
          "rounded-full",
          {
            "border-[3px]": active
          }
        )}
        style={{
          height: size,
          width: size,
          borderColor: colors.inatGreen
        }}
        source={img}
      />
    ) : (
      <IconMaterial
        accessibilityRole="image"
        name={icon}
        size={size}
        color={active ? colors.inatGreen : colors.darkGray}
      />
    )}
  </Pressable>
);

export default NavButton;

