import classNames from "classnames";
import { Button } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { PropsWithChildren } from "react";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( {
  offsetHeight: -2
} );

export interface ButtonConfiguration {
  title: string;
  onPress: ( ) => void;
  isPrimary: boolean;
  className?: string;
  disabled?: boolean;
  level?: string;
  loading?: boolean;
}

interface Props extends PropsWithChildren {
  containerClass?: string;
  onLayout?: () => void;
  sticky?: boolean;
  buttonConfiguration?: Array<ButtonConfiguration>;
}

// Ensure this component is placed outside of scroll views
const ButtonBar = ( {
  containerClass,
  children,
  buttonConfiguration,
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
        containerClass,
        {
          "p-[15px] w-full": !buttonConfiguration,
          "flex-row": buttonConfiguration
        }
      )}
      onLayout={onLayout}
      style={DROP_SHADOW}
    >
      {buttonConfiguration && buttonConfiguration.map( button => {
        const {
          title, onPress, isPrimary, ...props
        } = button;
        return (
          <Button
            key={`ButtonBar-Button-${title}`}
            maxFontSizeMultiplier={1}
            text={title}
            onPress={onPress}
            level={
              isPrimary
                ? "primary"
                : "neutral"
            }
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
          />
        );
      } )}
      {children}
    </View>
  );
};

export default ButtonBar;
