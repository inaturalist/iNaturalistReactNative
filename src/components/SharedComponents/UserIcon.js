// @flow

import classNames from "classnames";
import { Image } from "components/styledComponents";
import * as React from "react";
import colors from "styles/tailwindColors";

type Props = {
  uri: Object,
  small?: boolean,
  active?: boolean
}

const UserIcon = ( { uri, small, active }: Props ): React.Node => {
  const size = small ? "w-[22px] h-[22px]" : "w-[40px] h-[40px]";
  const border = "border-[3px] border-inatGreen";
  const className = classNames( "rounded-full", size, active && border );
  // For unknown reasons, the border doesn't show up on Android using nativewind classNames
  // but it works with style, might warrant further investigation or an issue in nativewind
  const style = { borderColor: colors.inatGreen, borderWidth: 3 };
  return (
    <Image
      testID="UserIcon.photo"
      className={className}
      style={active && style}
      source={uri}
      accessibilityIgnoresInvertColors
    />
  );
};

export default UserIcon;
