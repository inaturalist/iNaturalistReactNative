import {
  BackButton,
  Body3,
  Heading4,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

interface Props {
  closeModal: ( ) => void;
  headerText: string;
  resetFilters: ( ) => void;
  testID: string;
}

const ExploreSearchHeader = ( {
  closeModal,
  headerText,
  resetFilters,
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
      <View className="w-[50px] items-end">
        <Body3 onPress={resetFilters} maxFontSizeMultiplier={1.5}>
          {t( "Reset-verb" )}
        </Body3>
      </View>
    </View>
  );
};

export default ExploreSearchHeader;
