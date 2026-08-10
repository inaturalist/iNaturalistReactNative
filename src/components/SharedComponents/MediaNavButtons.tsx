import classnames from "classnames";
import GreenCheckmark from "components/Camera/Buttons/GreenCheckmark";
import RotatableIconWrapper from "components/Camera/RotatableIconWrapper";
import { CloseButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { PropsWithChildren } from "react";
import React from "react";
import type { AnimatedStyle } from "react-native-reanimated";

const SIDE_BUTTON_CLASSES = [
  "w-1/3",
  "h-full",
  "bg-black",
];

// h-10/w-10 = 2.5rem = 40px. Written as the literal Tailwind scale class
// rather than an interpolated `h-[${BUTTON_DIM}px]` string: nativewind 4
// compiles classes from a static scan of source text, so a template literal
// never matches anything in the compiled stylesheet and silently produces no
// style at all.
const CHECKMARK_CLASSES = [
  "bg-inatGreen",
  "rounded-full",
  "h-10",
  "w-10",
  "justify-center",
  "items-center",
];

const CLOSE_CLASSES = [
  "bg-mediumGrayGhost",
  "rounded-full",
  "h-10",
  "w-10",
  "justify-center",
  "items-center",
];

interface Props extends PropsWithChildren {
  closeHidden?: boolean;
  confirmHidden?: boolean;
  disabled?: boolean;
  mediaCaptured?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rotatableAnimatedStyle?: AnimatedStyle;
}

const MediaNavButtons = ( {
  children,
  closeHidden,
  confirmHidden,
  disabled,
  mediaCaptured,
  onClose,
  onConfirm,
  rotatableAnimatedStyle,
}: Props ) => (
  <View
    className="h-32 flex-row justify-between items-center bg-black"
    testID="MediaNavButtons"
  >
    {closeHidden
      ? <View className="w-1/3" />
      : (
        <RotatableIconWrapper
          rotatableAnimatedStyle={rotatableAnimatedStyle}
          containerClass={classnames( CLOSE_CLASSES, SIDE_BUTTON_CLASSES )}
        >
          <CloseButton
            handleClose={onClose}
            buttonClassName={classnames( CLOSE_CLASSES, "bg-[#232323]" )}
          />
        </RotatableIconWrapper>
      )}
    {children}
    {mediaCaptured && !confirmHidden
      ? (
        // Fixed size lives on this inner View, not on containerClass: the
        // outer wrapper's className used to merge CHECKMARK_CLASSES (w-10
        // h-10) with SIDE_BUTTON_CLASSES (w-1/3 h-full) on one element, which
        // is a genuine same-property conflict nativewind 4 can't resolve the
        // way v2 did (v2 let whichever was listed last win; v4 resolves by
        // stylesheet order instead). Splitting them onto separate elements
        // avoids the conflict entirely rather than relying on either order.
        <RotatableIconWrapper
          rotatableAnimatedStyle={rotatableAnimatedStyle}
          containerClass={classnames( SIDE_BUTTON_CLASSES, "justify-center items-center" )}
        >
          <View className={classnames( CHECKMARK_CLASSES )}>
            <GreenCheckmark
              disabled={disabled}
              handleCheckmarkPress={onConfirm}
            />
          </View>
        </RotatableIconWrapper>
      )
      : (
        <View className={classnames( SIDE_BUTTON_CLASSES )} />
      )}
  </View>
);

export default MediaNavButtons;
