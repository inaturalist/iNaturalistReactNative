import classNames from "classnames";
import { Body2 } from "components/SharedComponents";
import GradientButton from "components/SharedComponents/Buttons/GradientButton";
import React from "react";
import { Modal, View } from "react-native";
import { useTranslation } from "sharedHooks";

type Props = {
    isVisible: boolean;
    dismissTooltip: () => void;
};

const AddObsTooltip = ( { isVisible, dismissTooltip }: Props ): React.ReactNode => {
  const { t } = useTranslation();
  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent
      onRequestClose={dismissTooltip}
    >
      <View className="flex-1 bg-black/50 items-center justify-end">
        <View className="relative bottom-[24px] items-center">
          <View className="bg-white rounded-2xl px-5 py-4">
            <Body2>{t( "Press-and-hold-to-view-more-options" )}</Body2>
          </View>
          <View
            className={classNames(
              "border-l-[10px] border-r-[10px] border-x-[#00000000]",
              "border-t-[16px] border-t-white mb-2"
            )}
          />
          <GradientButton
            sizeClassName="w-[69px] h-[69px]"
            onPress={() => {}}
            onLongPress={() => dismissTooltip()}
            accessibilityLabel={t( "Add-observations" )}
            accessibilityHint={t( "Shows-observation-creation-options" )}
          />
        </View>
      </View>
    </Modal>
  );
};

export default AddObsTooltip;
