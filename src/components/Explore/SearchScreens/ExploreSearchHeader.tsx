import {
  BackButton,
  Body3,
  Heading4
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
  testID
}: Props ) => {
  const { t } = useTranslation( );

  return (
    <View className="flex-row justify-between p-5 bg-white">
      <BackButton
        testID={testID}
        onPress={closeModal}
        accessibilityLabel={headerText}
        className="w-[60px]"
      />
      <Heading4>{headerText}</Heading4>
      <Body3 onPress={resetFilters} className="w-[60px]">
        {t( "Reset-verb" )}
      </Body3>
    </View>
  );
};

export default ExploreSearchHeader;
