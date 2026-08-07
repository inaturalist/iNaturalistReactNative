import classNames from "classnames";
import {
  INatIcon,
  INatIconButton,
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React from "react";

interface Props {
  accessibilityLabel: string;
  children: React.ReactNode;
  justify?: "justify-between" | "justify-around";
  onEdit: ( ) => void;
  onRemove: ( ) => void;
  removeAccessibilityLabel: string;
}

const SelectedFilterRow = ( {
  accessibilityLabel,
  children,
  justify = "justify-between",
  onEdit,
  onRemove,
  removeAccessibilityLabel,
}: Props ) => (
  <Pressable
    className={classNames( "flex-row items-center", justify )}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    onPress={onEdit}
  >
    {children}
    <View className="flex-row items-center">
      <INatIcon name="edit" size={22} />
      <INatIconButton
        className="ml-3"
        icon="close"
        size={20}
        onPress={onRemove}
        accessibilityLabel={removeAccessibilityLabel}
      />
    </View>
  </Pressable>
);

export default SelectedFilterRow;
