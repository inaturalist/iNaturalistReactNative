import { tailwindFontBold } from "appConstants/fontFamilies";
import classnames from "classnames";
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
import DisplayTaxonName from "components/SharedComponents/DisplayTaxonName";
import INatIcon from "components/SharedComponents/INatIcon";
import ObservationLocation from "components/SharedComponents/ObservationLocation";
import Body1 from "components/SharedComponents/Typography/Body1";
import Body2 from "components/SharedComponents/Typography/Body2";
import Body3 from "components/SharedComponents/Typography/Body3";
import Body4 from "components/SharedComponents/Typography/Body4";
import List2 from "components/SharedComponents/Typography/List2";
import { Image, View } from "components/styledComponents";
import type { PropsWithChildren } from "react";
import React from "react";
import { Trans } from "react-i18next";
import { formatDateString } from "sharedHelpers/dateAndTime";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useTranslation from "sharedHooks/useTranslation";

// Hardcoded sample obsservtion for the story card
const STORY_OBSERVATION = {
  userLogin: "tiwane",
  placeGuess: "Heredia, Sarapiquí, Costa Rica",
  observedOn: "2023-03-25T20:38:00-06:00",
  timeZone: "America/Costa_Rica",
};

const STORY_PHOTO_ASPECT_RATIO = 221 / 154;

interface StoryCardRowProps extends PropsWithChildren {
  label: string;
  // Top-align the label, for rows taller than one line
  alignTop?: boolean;
}

const StoryCardRow = ( { label, alignTop, children }: StoryCardRowProps ) => {
  const compact = useOnboardingCompact( );
  const Label = compact
    ? Body2
    : Body1;
  return (
    <View
      className={classnames( "flex-row", {
        "items-start": alignTop,
        "items-center": !alignTop,
      } )}
    >
      <Label
        className={classnames( tailwindFontBold, compact
          ? "w-[46px] mr-[10px]"
          : "w-[52px] mr-[19px]" )}
      >
        {label}
      </Label>
      <View className="flex-1">{children}</View>
    </View>
  );
};

const StoryCard = ( ) => {
  const { t, i18n } = useTranslation( );
  const currentUser = useCurrentUser( );
  const compact = useOnboardingCompact( );
  const taxon = {
    id: 134933,
    name: "Espadarana prosoblepon",
    preferred_common_name: t( "Emerald-Glass-Frog" ),
    rank_level: 10,
  };

  return (
    <View
      className={classnames(
        "rounded-[30px] border-4 border-inatGreen bg-lightGreen",
        compact
          ? "-mx-[12px] gap-2 p-4"
          : "mx-[3px] gap-[11px] p-5",
      )}
    >
      <StoryCardRow label={t( "Who" )}>
        <View className="flex-row items-center">
          <Image
            source={require( "images/onboarding/avatar_tiwane.png" )}
            className="h-[22px] w-[22px] rounded-full"
            accessibilityIgnoresInvertColors
          />
          <Body3 className="ml-[7px]">{STORY_OBSERVATION.userLogin}</Body3>
        </View>
      </StoryCardRow>
      <StoryCardRow label={t( "What" )} alignTop>
        <View className={compact
          ? "gap-[10px]"
          : "gap-[15px]"}
        >
          <View
            className="w-full overflow-hidden rounded-[4px]"
            style={{ aspectRatio: STORY_PHOTO_ASPECT_RATIO }}
          >
            <Image
              source={require( "images/onboarding/story_glass_frog.jpg" )}
              className="h-full w-full"
              accessibilityIgnoresInvertColors
            />
          </View>
          <View className="flex-row items-center">
            <Image
              source={require( "images/onboarding/taxon_emerald_glass_frog.jpg" )}
              className="h-[42px] w-[42px] rounded-[8px]"
              accessibilityIgnoresInvertColors
            />
            <View className="ml-[10px] flex-1">
              <DisplayTaxonName
                taxon={taxon}
                bottomTextComponent={List2}
                scientificNameFirst={currentUser?.prefers_scientific_name_first}
                prefersCommonNames={currentUser?.prefers_common_names}
              />
            </View>
          </View>
        </View>
      </StoryCardRow>
      <StoryCardRow label={t( "Where" )}>
        <ObservationLocation observation={{ place_guess: STORY_OBSERVATION.placeGuess }} />
      </StoryCardRow>
      <StoryCardRow label={t( "When" )}>
        <View className="flex-row items-center">
          <INatIcon name="date" size={13} />
          <Body4 className="ml-[5px]">
            {formatDateString(
              STORY_OBSERVATION.observedOn,
              t( "datetime-format-medium-with-zone" ),
              i18n,
              { timeZone: STORY_OBSERVATION.timeZone },
            )}
          </Body4>
        </View>
      </StoryCardRow>
    </View>
  );
};

const ObsStoryContent = ( ) => {
  const { t } = useTranslation( );
  const compact = useOnboardingCompact( );

  return (
    <>
      <OnboardingHeadline>
        <Trans
          i18nKey="Every-observation-tells-a-story"
          components={UNDERLINED_SPANS}
        />
      </OnboardingHeadline>
      <OnboardingFlexGap min={6} max={12} />
      <Body2>{t( "An-observation-is" )}</Body2>
      <OnboardingFlexGap min={6} max={12} />
      <View className={classnames( "px-[10px]", compact
        ? "gap-2"
        : "gap-3" )}
      >
        <OnboardingChecklistItem>
          <Trans i18nKey="a-photo-or-sound-recording" components={BOLD_SPANS} />
        </OnboardingChecklistItem>
        <OnboardingChecklistItem>
          <Trans i18nKey="of-one-living-thing" components={BOLD_SPANS} />
        </OnboardingChecklistItem>
        <OnboardingChecklistItem>
          <Trans i18nKey="at-the-time-and-place-you-saw-it" components={BOLD_SPANS} />
        </OnboardingChecklistItem>
      </View>
      <OnboardingFlexGap min={12} max={47} />
      <StoryCard />
    </>
  );
};

const ObsStoryStep = ( ) => {
  const { t } = useTranslation( );
  const { stepId, proceedToNext } = useOnboardingFlow( );
  useOnboardingScreenView( stepId );

  return (
    <OnboardingStepLayout
      fitsToScreen
      footer={(
        <>
          <OnboardingFooterNote>
            {t( "Even-a-photo-of-something-commonly-seen-in-your-area-can-help-science" )}
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
      <ObsStoryContent />
    </OnboardingStepLayout>
  );
};

export default ObsStoryStep;
