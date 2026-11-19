import CARD_SHADOW from "components/Onboarding/onboardingCardShadow";
import OnboardingChecklistItem from "components/Onboarding/OnboardingChecklistItem";
import OnboardingStepLayout from "components/Onboarding/OnboardingStepLayout";
import { BOLD_SPANS, UNDERLINED_SPANS } from "components/Onboarding/onboardingTransSpans";
import useOnboardingFlow from "components/Onboarding/useOnboardingFlow";
import Button from "components/SharedComponents/Buttons/Button";
import DateDisplay from "components/SharedComponents/DateDisplay";
import ObservationLocation from "components/SharedComponents/ObservationLocation";
import TaxonResult from "components/SharedComponents/TaxonResult";
import Body2 from "components/SharedComponents/Typography/Body2";
import Body3 from "components/SharedComponents/Typography/Body3";
import Heading1 from "components/SharedComponents/Typography/Heading1";
import Heading5 from "components/SharedComponents/Typography/Heading5";
import { Image, View } from "components/styledComponents";
import React from "react";
import { Trans } from "react-i18next";
import bundledImageUrl from "sharedHelpers/bundledImageUrl";
import useTranslation from "sharedHooks/useTranslation";

// Hardcoded sample observation for the Research Grade card
const RESEARCH_GRADE_OBSERVATION = {
  // No time zone, so it shows the same time on every device
  observedOn: "2026-10-03T10:45:00",
  placeGuess: "334 Naturalist Way, San Francisco, CA",
};

const HERO_PHOTO_ASPECT_RATIO = 352 / 212;

const ResearchGradeCard = ( ) => {
  const { t } = useTranslation( );
  const spottedCucumberBeetle = {
    id: 55487,
    name: "Diabrotica undecimpunctata",
    preferred_common_name: t( "Spotted-Cucumber-Beetle" ),
    rank: "species",
    rank_level: 10,
    default_photo: {
      url: bundledImageUrl( require( "images/onboarding/taxon_spotted_cucumber_beetle.jpg" ) ),
    },
  };

  return (
    <View className="mt-[40px] mx-[4px] rounded-[20px] bg-white" style={CARD_SHADOW}>
      <View
        className="w-full overflow-hidden rounded-t-[20px]"
        style={{ aspectRatio: HERO_PHOTO_ASPECT_RATIO }}
      >
        <Image
          source={require( "images/onboarding/research_grade_spotted_cucumber_beetle.jpg" )}
          className="h-full w-full"
          accessibilityIgnoresInvertColors
        />
        <View
          className={
            "absolute bottom-[20px] right-[19px] rounded-[5px] border border-inatGreen "
            + "bg-white px-[7.5px] py-[5.5px]"
          }
        >
          <Heading5>{t( "RESEARCH-GRADE--quality-grade" )}</Heading5>
        </View>
      </View>
      <View
        className="gap-[11px] rounded-b-[20px] border border-lightGray bg-white px-[15px] py-[11px]"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Image
              source={require( "images/onboarding/avatar_you.png" )}
              className="h-[22px] w-[22px] rounded-full"
              accessibilityIgnoresInvertColors
            />
            <Body3 className="ml-[7px]">{t( "you--observer" )}</Body3>
          </View>
          <DateDisplay dateString={RESEARCH_GRADE_OBSERVATION.observedOn} literalTime />
        </View>
        <TaxonResult
          taxon={spottedCucumberBeetle}
          unpressable
          fromLocal={false}
          fetchRemote={false}
          asListItem={false}
        />
        <ObservationLocation
          observation={{ place_guess: RESEARCH_GRADE_OBSERVATION.placeGuess }}
        />
      </View>
    </View>
  );
};

const ResearchGradeStep = ( ) => {
  const { t } = useTranslation( );
  const { stepId, proceedToNext } = useOnboardingFlow( );

  return (
    <OnboardingStepLayout
      footer={(
        <>
          <Body2 className="px-[6px] mb-[24px]">
            <Trans
              i18nKey="Research-Grade-observations-can-more-easily-be-used-to"
              components={BOLD_SPANS}
            />
          </Body2>
          <Button
            level="focus"
            text={t( "CONTINUE" )}
            onPress={proceedToNext}
            testID={`Onboarding.${stepId}.next`}
          />
        </>
      )}
    >
      <Heading1 accessibilityRole="header">
        <Trans
          i18nKey="Together-we-help-observations-reach-Research-Grade"
          components={UNDERLINED_SPANS}
        />
      </Heading1>
      <Body2 className="mt-[19px] mb-3">
        {t( "Your-observation-can-become-Research-Grade-when" )}
      </Body2>
      <View className="gap-3 px-[10px]">
        <OnboardingChecklistItem>
          <Trans i18nKey="the-community-vets-the-identification" components={BOLD_SPANS} />
        </OnboardingChecklistItem>
        <OnboardingChecklistItem>
          <Trans i18nKey="it-has-a-photo-or-sound-date-and-location" components={BOLD_SPANS} />
        </OnboardingChecklistItem>
        <OnboardingChecklistItem>
          <Trans
            i18nKey="it-passes-iNaturalists-standards-for-good-data"
            components={BOLD_SPANS}
          />
        </OnboardingChecklistItem>
      </View>
      <ResearchGradeCard />
    </OnboardingStepLayout>
  );
};

export default ResearchGradeStep;
