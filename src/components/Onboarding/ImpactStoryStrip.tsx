import { useFocusEffect } from "@react-navigation/native";
import type { ImpactStory } from "components/Onboarding/ImpactStoryCard";
import ImpactStoryCard from "components/Onboarding/ImpactStoryCard";
import { ScrollView, View } from "components/styledComponents";
import React, { useCallback, useRef } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useWindowDimensions } from "react-native";
import { logFirebaseEvent } from "sharedHelpers/tracking";

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
  const snapInterval = cardWidth + CARD_GAP;
  const currentIndex = useRef( 0 );

  const logStoryView = useCallback( ( index: number ) => {
    logFirebaseEvent( "impact_story_view", { story_id: stories[index].id } );
  }, [stories] );

  // Logs the visible story each time the step becomes visible, including when
  // the user comes back to it
  useFocusEffect(
    useCallback( ( ) => {
      logStoryView( currentIndex.current );
    }, [logStoryView] ),
  );

  // Logs a story once the strip settles on it, but not when a swipe settles
  // back on the story already showing
  const onMomentumScrollEnd = (
    { nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const index = Math.min(
      Math.max( Math.round( nativeEvent.contentOffset.x / snapInterval ), 0 ),
      stories.length - 1,
    );
    if ( index === currentIndex.current ) return;
    currentIndex.current = index;
    logStoryView( index );
  };

  return (
    // Cancels OnboardingStepLayout's horizontal content padding so the strip can span the screen
    <View className="-mx-[22px]">
      <ScrollView
        horizontal
        snapToInterval={snapInterval}
        decelerationRate="fast"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
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
