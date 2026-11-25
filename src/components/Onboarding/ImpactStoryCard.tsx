import { tailwindFontBold } from "appConstants/fontFamilies";
import AttributionButton from "components/MediaViewer/AttributionButton";
import { useOnboardingCompact } from "components/Onboarding/onboardingCompact";
import ObservationLocation from "components/SharedComponents/ObservationLocation";
import Body1 from "components/SharedComponents/Typography/Body1";
import Body2 from "components/SharedComponents/Typography/Body2";
import { Image, View } from "components/styledComponents";
import type { ReactNode } from "react";
import React from "react";
import type { ImageSourcePropType } from "react-native";

export interface ImpactStory {
  // Also the story_id in analytics
  id: string;
  photo: ImageSourcePropType;
  // Credit for the photo, shown the same way as in the media viewer
  attribution: string;
  licenseCode?: string;
  title: string;
  body: ReactNode;
  place: string;
}

interface Props {
  story: ImpactStory;
}

const PHOTO_ASPECT_RATIO = 344 / 309;

const COMPACT_PHOTO_HEIGHT = 225;

const ImpactStoryCard = ( { story }: Props ) => {
  const compact = useOnboardingCompact( );
  return (
    <View className="gap-[11px]" testID={`ImpactStoryCard.${story.id}`}>
      <View
        className="w-full"
        style={compact
          ? { height: COMPACT_PHOTO_HEIGHT }
          : { aspectRatio: PHOTO_ASPECT_RATIO }}
      >
        <Image
          source={story.photo}
          className="h-full w-full rounded-[20px]"
          accessibilityIgnoresInvertColors
        />
        <AttributionButton
          attribution={story.attribution}
          licenseCode={story.licenseCode}
          optionalClasses="absolute top-[4px] right-[4px]"
        />
      </View>
      <View className="gap-[9px]">
        <Body1 className={`${tailwindFontBold} tracking-[-0.25px]`}>{story.title}</Body1>
        <Body2>{story.body}</Body2>
      </View>
      <ObservationLocation observation={{ place_guess: story.place }} />
    </View>
  );
};

export default ImpactStoryCard;
