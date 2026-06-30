import classnames from "classnames";
import {
  BackButton,
  Body3,
  Heading4,
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

interface Props {
  closeModal: ( ) => void;
  headerText: string;
  resetFilters: ( ) => void;
  resetDisabled?: boolean;
  testID: string;
}

const ExploreSearchHeader = ( {
  closeModal,
  headerText,
  resetFilters,
  resetDisabled = false,
  testID,
}: Props ) => {
  const { t } = useTranslation( );

  return (
    <View className="flex-row items-center justify-between p-5 bg-white">
      <View className="w-[50px]">
        <BackButton
          testID={testID}
          onPress={closeModal}
          accessibilityLabel={headerText}
        />
      </View>
      <Heading4 className="flex-1 wrap text-center">{headerText}</Heading4>
      <Pressable
        className={classnames(
          "w-[50px] items-end",
          { "opacity-50": resetDisabled },
        )}
        onPress={resetFilters}
        disabled={resetDisabled}
        accessibilityRole="button"
        accessibilityLabel={t( "Reset-verb" )}
        testID={`${testID}.reset`}
      >
        <Body3 maxFontSizeMultiplier={1.5}>
          {t( "Reset-verb" )}
        </Body3>
      </Pressable>
    </View>
  );
};

export default ExploreSearchHeader;
