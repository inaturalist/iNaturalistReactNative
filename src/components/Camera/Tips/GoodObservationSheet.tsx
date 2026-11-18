import Button from "components/SharedComponents/Buttons/Button";
import BottomSheet from "components/SharedComponents/Sheets/BottomSheet";
import Body2 from "components/SharedComponents/Typography/Body2";
import { View } from "components/styledComponents";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";

const BULLET = "•";

interface Props {
  // Called for CONTINUE and for any other dismissal (close button, backdrop
  // tap, swipe down)
  onDismiss: ( ) => void;
}

// Shown once, the first time the AI camera is opened. Copy is provisional and
// there are no images yet: both wait on design (MOB-1926)
const GoodObservationSheet = ( { onDismiss }: Props ) => {
  const { t } = useTranslation( );

  const tips = [
    t( "Photograph-one-organism-at-a-time" ),
    t( "Get-close-and-keep-your-photo-in-focus" ),
    t( "Look-for-wild-plants-animals-and-fungi" ),
  ];

  return (
    <BottomSheet
      headerText={t( "What-makes-a-good-observation" )}
      onPressClose={onDismiss}
      testID="GoodObservationSheet"
    >
      <View className="px-[30px] pt-5 pb-5">
        <View className="gap-3 mb-6">
          {tips.map( tip => (
            <View accessible accessibilityLabel={tip} className="flex-row" key={tip}>
              <Body2 className="mr-2">{BULLET}</Body2>
              <Body2 className="shrink">{tip}</Body2>
            </View>
          ) )}
        </View>
        <Button
          level="focus"
          text={t( "CONTINUE" )}
          onPress={onDismiss}
          testID="GoodObservationSheet.continue"
        />
      </View>
    </BottomSheet>
  );
};

export default GoodObservationSheet;
