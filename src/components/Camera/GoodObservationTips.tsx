import { Body1, Body2 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

// What makes a good observation. Shown in the one-time sheet on the AI camera
// and in the camera tips sheet
const GoodObservationTips = ( ) => {
  const { t } = useTranslation( );

  return (
    <View className="gap-y-4">
      <View className="gap-y-1">
        <Body1>{t( "Clear-photo-of-a-single-living-thing" )}</Body1>
        <Body2>
          {t( "common-species-are-great-just-make-sure-the-shot-is-as-sharp-as-possible" )}
        </Body2>
      </View>
      <View className="gap-y-1">
        <Body1>{t( "Wild-animals-and-plants" )}</Body1>
        <Body2>
          {t( "not-pets-garden-plants-or-zoo-animals-only-things-living-freely" )}
        </Body2>
      </View>
      <View className="gap-y-1">
        <Body1>{t( "Evidence-is-ok" )}</Body1>
        <Body2>
          {t( "scat-tracks-and-eggs-all-count-as-do-fallen-leaves-fruits" )}
        </Body2>
      </View>
    </View>
  );
};

export default GoodObservationTips;
