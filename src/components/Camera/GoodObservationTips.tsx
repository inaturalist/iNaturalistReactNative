import { Body1, Body2 } from "components/SharedComponents";
import { Image, View } from "components/styledComponents";
import React from "react";
import type { ImageSourcePropType } from "react-native";
import { useTranslation } from "sharedHooks";

interface TipProps {
  image: ImageSourcePropType;
  title: string;
  body: string;
}

const Tip = ( { image, title, body }: TipProps ) => (
  <View className="flex-row items-center">
    <Image
      source={image}
      className="h-[62px] w-[62px] rounded-[8px]"
      accessibilityIgnoresInvertColors
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
    <View className="ml-[10px] flex-1 gap-y-1">
      <Body1>{title}</Body1>
      <Body2>{body}</Body2>
    </View>
  </View>
);

// What makes a good observation. Shown in the one-time sheet on the AI camera
// and in the camera tips sheet
const GoodObservationTips = ( ) => {
  const { t } = useTranslation( );

  return (
    <View className="gap-y-4">
      <Tip
        image={require( "images/onboarding/photo_tips_1.jpg" )}
        title={t( "Clear-photo-of-a-single-living-thing" )}
        body={t( "common-species-are-great-just-make-sure-the-shot-is-as-sharp-as-possible" )}
      />
      <Tip
        image={require( "images/onboarding/photo_tips_2.jpg" )}
        title={t( "Wild-animals-and-plants" )}
        body={t( "not-pets-garden-plants-or-zoo-animals-only-things-living-freely" )}
      />
      <Tip
        image={require( "images/onboarding/photo_tips_3.jpg" )}
        title={t( "Evidence-is-ok" )}
        body={t( "scat-tracks-and-eggs-all-count-as-do-fallen-leaves-fruits" )}
      />
    </View>
  );
};

export default GoodObservationTips;
