// @flow
import { UserIcon } from "components/SharedComponents";
import { Pressable } from "components/styledComponents";
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
  accessibilityHint?: string,
  active: boolean,
  size: number,
};

const NavButton = ( {
  testID,
  size,
  icon,
  onPress,
  userIconUri,
  active,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = "tab"
}: Props ): React.Node => {
  /* eslint-disable react/jsx-props-no-spreading */
  const sharedProps = {
    testID,
    onPress,
    accessibilityRole,
    accessibilityLabel,
    accessibilityHint,
    accessibilityState: {
      selected: active,
      expanded: active,
      disabled: false
    }
  };

  if ( userIconUri ) {
    return (
      <Pressable
        className="flex items-center justify-center"
        {...sharedProps}
      >
        <UserIcon uri={userIconUri} active={active} />
      </Pressable>
    );
  }

  return (
    <IconButton
      icon={icon}
      iconColor={active
        ? colors.inatGreen
        : colors.darkGray}
      size={size}
      {...sharedProps}
    />
  );
};

export default NavButton;
