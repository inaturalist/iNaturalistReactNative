// @flow
import { Body3, INatIconButton, UserIcon } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import NotificationsIconContainer from "navigation/BottomTabNavigator/NotificationsIconContainer";
import * as React from "react";
import colors from "styles/tailwindColors";

type Props = {
  testID: string,
  icon: string,
  onPress: Function,
  userIconUri?: string,
  accessibilityLabel: string,
  accessibilityRole?: string,
  accessibilityHint?: string,
  active: boolean,
  size: number,
  width?: number,
  height?: number
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
  accessibilityRole = "tab",
  width = 44,
  height = 44
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
    },
    width,
    height
  };

  const notificationProps = {
    testID,
    onPress,
    accessibilityRole,
    accessibilityLabel,
    accessibilityHint,
    width,
    height
  };

  let iconComponent;
  if ( userIconUri ) {
    iconComponent = (
      <Pressable
        className="flex items-center justify-center"
        {...sharedProps}
      >
        <UserIcon uri={userIconUri} active={active} />
      </Pressable>
    );
  } else if ( icon === "notifications-bell" ) {
    iconComponent = (
      <NotificationsIconContainer
        icon={icon}
        size={size}
        active={active}
        {...notificationProps}
      />
    );
  } else {
    iconComponent = (
      <INatIconButton
        icon={icon}
        color={active
          ? colors.inatGreen
          : colors.darkGray}
        size={size}
        {...sharedProps}
      />
    );
  }

  return (
    <View className="flex-column items-center w-[20%]">
      {iconComponent}
      <Body3
        numberOfLines={1}
        className={active
          ? "text-inatGreen"
          : "text-darkGray"}
        maxFontSizeMultiplier={1.2}
      >
        { accessibilityLabel }
      </Body3>
    </View>
  );
};

export default NavButton;
