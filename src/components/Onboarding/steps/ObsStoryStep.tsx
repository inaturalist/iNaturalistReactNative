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
import Trans from "components/SharedComponents/Typography/Trans";
import { Image, View } from "components/styledComponents";
import type { PropsWithChildren } from "react";
import React, { useState } from "react";
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

// The figma design's width for the label column, which fits the English labels at
// the default text size
const LABEL_COLUMN_WIDTH = 52;
const COMPACT_LABEL_COLUMN_WIDTH = 46;

type StoryCardLabel = "who" | "what" | "where" | "when";

interface StoryCardRowProps extends PropsWithChildren {
  label: string;
  // Top-align the label, for rows taller than one line
  alignTop?: boolean;
  labelColumnWidth: number;
  onLabelWidth: ( width: number ) => void;
}

const StoryCardRow = ( {
  label, alignTop, labelColumnWidth, onLabelWidth, children,
}: StoryCardRowProps ) => {
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
      <View
        className={compact
          ? "mr-[10px]"
          : "mr-[19px]"}
        style={{ minWidth: labelColumnWidth }}
      >
        <Label
          className={classnames( tailwindFontBold, "self-start" )}
          onLayout={event => onLabelWidth( event.nativeEvent.layout.width )}
        >
          {label}
        </Label>
      </View>
      <View className="flex-1">{children}</View>
    </View>
  );
};

// The label column starts at the design's width and widens to the widest
// label, so a long translation or a large text size never breaks a label
// mid-word, and the values stay lined up
const useLabelColumnWidth = ( compact: boolean ) => {
  const [labelWidths, setLabelWidths] = useState<Partial<Record<StoryCardLabel, number>>>( {} );
  const labelColumnWidth = Math.max(
    compact
      ? COMPACT_LABEL_COLUMN_WIDTH
      : LABEL_COLUMN_WIDTH,
    ...Object.values( labelWidths ),
  );
  const onLabelWidth = ( label: StoryCardLabel ) => ( width: number ) => {
    // Rounded up so a fractional width can't wrap the label's last letter
    const rounded = Math.ceil( width );
    setLabelWidths( widths => ( widths[label] === rounded
      ? widths
      : { ...widths, [label]: rounded } ) );
  };
  return { labelColumnWidth, onLabelWidth };
};

const StoryCard = ( ) => {
  const { t, i18n } = useTranslation( );
  const currentUser = useCurrentUser( );
  const compact = useOnboardingCompact( );
  const { labelColumnWidth, onLabelWidth } = useLabelColumnWidth( compact );
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
      <StoryCardRow
        label={t( "Who" )}
        labelColumnWidth={labelColumnWidth}
        onLabelWidth={onLabelWidth( "who" )}
      >
        <View className="flex-row items-center">
          <Image
            source={require( "images/onboarding/avatar_tiwane.png" )}
            className="h-[22px] w-[22px] rounded-full"
            accessibilityIgnoresInvertColors
          />
          <Body3 className="ml-[7px]">{STORY_OBSERVATION.userLogin}</Body3>
        </View>
      </StoryCardRow>
      <StoryCardRow
        label={t( "What" )}
        alignTop
        labelColumnWidth={labelColumnWidth}
        onLabelWidth={onLabelWidth( "what" )}
      >
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
      <StoryCardRow
        label={t( "Where" )}
        labelColumnWidth={labelColumnWidth}
        onLabelWidth={onLabelWidth( "where" )}
      >
        <ObservationLocation observation={{ place_guess: STORY_OBSERVATION.placeGuess }} />
      </StoryCardRow>
      <StoryCardRow
        label={t( "When" )}
        labelColumnWidth={labelColumnWidth}
        onLabelWidth={onLabelWidth( "when" )}
      >
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
