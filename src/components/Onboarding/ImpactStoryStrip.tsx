import type { ImpactStory } from "components/Onboarding/ImpactStoryCard";
import ImpactStoryCard from "components/Onboarding/ImpactStoryCard";
import { ScrollView, View } from "components/styledComponents";
import React from "react";
import { useWindowDimensions } from "react-native";

// Distance from the screen edge to the current card
const EDGE_INSET = 29;
const CARD_GAP = 14;
// How much of the next card shows at the screen edge
const PEEK = 15;

interface Props {
  stories: ImpactStory[];
}

// Horizontally swiping strip of story cards
const ImpactStoryStrip = ( { stories }: Props ) => {
  const { width: windowWidth } = useWindowDimensions( );
  const cardWidth = windowWidth - EDGE_INSET - CARD_GAP - PEEK;

  return (
    // Cancels OnboardingStepLayout's horizontal content padding so the strip can span the screen
    <View className="-mx-[22px]">
      <ScrollView
        horizontal
        snapToInterval={cardWidth + CARD_GAP}
        decelerationRate="fast"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: EDGE_INSET, gap: CARD_GAP }}
        testID="ImpactStoryStrip"
      >
        {stories.map( story => (
          <View key={story.id} style={{ width: cardWidth }}>
            <ImpactStoryCard story={story} />
          </View>
        ) )}
      </ScrollView>
    </View>
  );
};

export default ImpactStoryStrip;
