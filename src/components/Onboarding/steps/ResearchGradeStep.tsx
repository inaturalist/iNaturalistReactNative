import classnames from "classnames";
import CARD_SHADOW from "components/Onboarding/onboardingCardShadow";
import OnboardingChecklistItem from "components/Onboarding/OnboardingChecklistItem";
import { useOnboardingCompact } from "components/Onboarding/onboardingCompact";
import OnboardingFlexGap from "components/Onboarding/OnboardingFlexGap";
import OnboardingFooterNote from "components/Onboarding/OnboardingFooterNote";
import OnboardingHeadline from "components/Onboarding/OnboardingHeadline";
import OnboardingStepLayout from "components/Onboarding/OnboardingStepLayout";
import { BOLD_SPANS, UNDERLINED_SPANS } from "components/Onboarding/onboardingTransSpans";
import useOnboardingFlow from "components/Onboarding/useOnboardingFlow";
import useOnboardingScreenView from "components/Onboarding/useOnboardingScreenView";
import Button from "components/SharedComponents/Buttons/Button";
import DateDisplay from "components/SharedComponents/DateDisplay";
import ObservationLocation from "components/SharedComponents/ObservationLocation";
import TaxonResult from "components/SharedComponents/TaxonResult";
import Body2 from "components/SharedComponents/Typography/Body2";
import Body3 from "components/SharedComponents/Typography/Body3";
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
// The photo is the card's tallest part, so it gives up the most height in
// compact mode: it keeps the full width and crops to this height
const COMPACT_HERO_PHOTO_HEIGHT = 128;

const ResearchGradeCard = ( ) => {
  const { t } = useTranslation( );
  const compact = useOnboardingCompact( );
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
    <View
      className="mx-[4px] rounded-[20px] bg-white"
      style={CARD_SHADOW}
    >
      <View
        className="w-full overflow-hidden rounded-t-[20px]"
        style={compact
          ? { height: COMPACT_HERO_PHOTO_HEIGHT }
          : { aspectRatio: HERO_PHOTO_ASPECT_RATIO }}
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
        className={classnames(
          "rounded-b-[20px] border border-lightGray bg-white px-[15px]",
          compact
            ? "gap-2 py-2"
            : "gap-[11px] py-[11px]",
        )}
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

const ResearchGradeContent = ( ) => {
  const { t } = useTranslation( );
  const compact = useOnboardingCompact( );

  return (
    <>
      <OnboardingHeadline>
        <Trans
          i18nKey="Together-we-help-observations-reach-Research-Grade"
          components={UNDERLINED_SPANS}
        />
      </OnboardingHeadline>
      <OnboardingFlexGap min={8} max={19} />
      <Body2>{t( "Your-observation-can-become-Research-Grade-when" )}</Body2>
      <OnboardingFlexGap min={6} max={12} />
      <View className={classnames( "px-[10px]", compact
        ? "gap-2"
        : "gap-3" )}
      >
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
      <OnboardingFlexGap min={12} max={40} />
      <ResearchGradeCard />
    </>
  );
};

const ResearchGradeStep = ( ) => {
  const { t } = useTranslation( );
  const { stepId, proceedToNext } = useOnboardingFlow( );
  useOnboardingScreenView( stepId );

  return (
    <OnboardingStepLayout
      fitsToScreen
      footer={(
        <>
          <OnboardingFooterNote>
            <Trans
              i18nKey="Research-Grade-observations-can-more-easily-be-used-to"
              components={BOLD_SPANS}
            />
          </OnboardingFooterNote>
          <Button
            level="focus"
            text={t( "CONTINUE" )}
            onPress={proceedToNext}
            testID={`Onboarding.${stepId}.next`}
          />
        </>
      )}
    >
      <ResearchGradeContent />
    </OnboardingStepLayout>
  );
};

export default ResearchGradeStep;
