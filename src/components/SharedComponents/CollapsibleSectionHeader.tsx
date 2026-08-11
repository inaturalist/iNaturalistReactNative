import { Body3, Divider, INatIcon } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

interface Props {
  count: number;
  icon: string;
  isOpen: boolean;
  onToggle: ( ) => void;
  testID?: string;
  title: string;
}

const CollapsibleSectionHeader = ( {
  count,
  icon,
  isOpen,
  onToggle,
  testID,
  title,
}: Props ) => {
  const { t } = useTranslation( );

  return (
    <View testID={testID}>
      <Divider />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${t( "X-Observations", { count } )}`}
        accessibilityHint={t( "Toggles-the-section-open-or-closed" )}
        accessibilityState={{ expanded: isOpen }}
        className="flex-row items-center justify-between px-[15px] py-[10px] bg-white"
        onPress={onToggle}
      >
        <View className="flex-row items-center">
          <INatIcon name={icon} size={18} />
          <Body3 className="ml-[8px]">{title}</Body3>
        </View>
        <View className="flex-row items-center">
          <Body3 className="mr-[10px]">{t( "Intl-number", { val: count } )}</Body3>
          <INatIcon
            name={isOpen
              ? "caret-down"
              : "caret-up"}
            size={10}
          />
        </View>
      </Pressable>
    </View>
  );
};

export default CollapsibleSectionHeader;
