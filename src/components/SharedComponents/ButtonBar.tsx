import classNames from "classnames";
import { View } from "components/styledComponents";
import React, { PropsWithChildren } from "react";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( {
  offsetHeight: -2
} );

interface Props extends PropsWithChildren {
  containerClass?: string,
  onLayout: () => void,
  sticky?: boolean
}

// Ensure this component is placed outside of scroll views
const ButtonBar = ( {
  containerClass,
  children,
  onLayout,
  sticky
}: Props ) => {
  const layoutClassNames = sticky
    ? "absolute bottom-0"
    : null;
  return (
    <View
      className={classNames(
        layoutClassNames,
        "bg-white p-[15px] w-full",
        containerClass
      )}
      style={DROP_SHADOW}
      onLayout={onLayout}
    >
      {children}
    </View>
  );
};

export default ButtonBar;
