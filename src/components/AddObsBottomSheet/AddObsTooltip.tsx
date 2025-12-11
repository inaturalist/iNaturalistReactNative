import classNames from "classnames";
import { Body2, Modal } from "components/SharedComponents";
import GradientButton from "components/SharedComponents/Buttons/GradientButton";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

interface Props {
  isVisible: boolean;
  dismissTooltip: ( ) => void;
}

const AddObsTooltip = ( { isVisible, dismissTooltip }: Props ) => {
  const { t } = useTranslation();

  const modalContent = (
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

  );

  return (
    <Modal
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropOpacity={0}
      closeModal={dismissTooltip}
      disableSwipeDirection
      fullScreen
      modal={modalContent}
      showModal={isVisible}
    />
  );
};

export default AddObsTooltip;
