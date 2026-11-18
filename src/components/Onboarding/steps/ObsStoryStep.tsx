import { tailwindFontBold } from "appConstants/fontFamilies";
import classnames from "classnames";
import OnboardingChecklistItem from "components/Onboarding/OnboardingChecklistItem";
import OnboardingStepLayout from "components/Onboarding/OnboardingStepLayout";
import { BOLD_SPANS, UNDERLINED_SPANS } from "components/Onboarding/onboardingTransSpans";
import useOnboardingFlow from "components/Onboarding/useOnboardingFlow";
import Button from "components/SharedComponents/Buttons/Button";
import DisplayTaxonName from "components/SharedComponents/DisplayTaxonName";
import INatIcon from "components/SharedComponents/INatIcon";
import ObservationLocation from "components/SharedComponents/ObservationLocation";
import Body1 from "components/SharedComponents/Typography/Body1";
import Body2 from "components/SharedComponents/Typography/Body2";
import Body3 from "components/SharedComponents/Typography/Body3";
import Body4 from "components/SharedComponents/Typography/Body4";
import Heading1 from "components/SharedComponents/Typography/Heading1";
import List2 from "components/SharedComponents/Typography/List2";
import { View } from "components/styledComponents";
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

const StoryCardRow = ( { label, alignTop, children }: StoryCardRowProps ) => (
  <View
    className={classnames( "flex-row", {
      "items-start": alignTop,
      "items-center": !alignTop,
    } )}
  >
    <Body1 className={`w-[52px] mr-[19px] ${tailwindFontBold}`}>{label}</Body1>
    <View className="flex-1">{children}</View>
  </View>
);

const StoryCard = ( ) => {
  const { t, i18n } = useTranslation( );
  const currentUser = useCurrentUser( );
  const taxon = {
    id: 134933,
    name: "Espadarana prosoblepon",
    preferred_common_name: t( "Emerald-Glass-Frog" ),
    rank_level: 10,
  };

  return (
    <View
      className={
        "mt-[47px] mx-[3px] gap-[11px] rounded-[30px] border-4 border-inatGreen "
        + "bg-lightGreen p-5"
      }
    >
      <StoryCardRow label={t( "Who" )}>
        <View className="flex-row items-center">
          {/* placeholder until the bundled avatar is added */}
          <INatIcon name="person" size={22} />
          <Body3 className="ml-[7px]">{STORY_OBSERVATION.userLogin}</Body3>
        </View>
      </StoryCardRow>
      <StoryCardRow label={t( "What" )} alignTop>
        <View className="gap-[15px]">
          {/* placeholder until the bundled photo is added */}
          <View
            className="w-full rounded-[4px] bg-lightGray"
            style={{ aspectRatio: STORY_PHOTO_ASPECT_RATIO }}
          />
          <View className="flex-row items-center">
            {/* placeholder until the bundled taxon photo is added */}
            <View className="w-[42px] h-[42px] rounded-[8px] bg-lightGray" />
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

const ObsStoryStep = ( ) => {
  const { t } = useTranslation( );
  const { stepId, proceedToNext } = useOnboardingFlow( );

  return (
    <OnboardingStepLayout
      footer={(
        <>
          <Body2 className="px-[6px] mb-[24px]">
            {t( "Even-a-photo-of-something-commonly-seen-in-your-area-can-help-science" )}
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
          i18nKey="Every-observation-tells-a-story"
          components={UNDERLINED_SPANS}
        />
      </Heading1>
      <Body2 className="my-3">{t( "An-observation-is" )}</Body2>
      <View className="gap-3 px-[10px]">
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
      <StoryCard />
    </OnboardingStepLayout>
  );
};

export default ObsStoryStep;
