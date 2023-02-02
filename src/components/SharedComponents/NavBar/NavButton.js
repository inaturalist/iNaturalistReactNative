// @flow
import UserIcon from "components/SharedComponents/UserIcon";
import { Pressable } from "components/styledComponents";
import { t } from "i18next";
import * as React from "react";
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
        <UserIcon uri={userIconUri} active={active} />
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
