// @flow
import UserIcon from "components/SharedComponents/UserIcon";
import { Pressable } from "components/styledComponents";
import { t } from "i18next";
import * as React from "react";
import { IconButton } from "react-native-paper";
import colors from "styles/tailwindColors";

type Props = {
  testID: string,
  icon: any,
  onPress: any,
  userIconUri?: string,
  accessibilityLabel: string,
  accessibilityRole?: string,
  active: boolean,
  size: number,
};

const NavButton = ( {
  testID,
  icon,
  onPress,
  userIconUri,
  active,
  accessibilityLabel,
  accessibilityRole = "link",
  size
}: Props ): React.Node => {
  /* eslint-disable react/jsx-props-no-spreading */
  const sharedProps = {
    onPress,
    testID,
    accessibilityRole,
    accessibilityLabel: t( accessibilityLabel ),
    accessibilityState: {
      selected: active,
      expanded: active,
      disabled: false
    }
  };

  if ( userIconUri ) {
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
