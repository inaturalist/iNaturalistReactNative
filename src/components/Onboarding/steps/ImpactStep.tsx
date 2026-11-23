import type { ImpactStory } from "components/Onboarding/ImpactStoryCard";
import ImpactStoryStrip from "components/Onboarding/ImpactStoryStrip";
import OnboardingStepLayout from "components/Onboarding/OnboardingStepLayout";
import {
  BOLD_SPANS, ITALIC_SPANS, UNDERLINED_SPANS,
} from "components/Onboarding/onboardingTransSpans";
import useOnboardingFlow from "components/Onboarding/useOnboardingFlow";
import useOnboardingScreenView from "components/Onboarding/useOnboardingScreenView";
import Button from "components/SharedComponents/Buttons/Button";
import Body1 from "components/SharedComponents/Typography/Body1";
import Heading1 from "components/SharedComponents/Typography/Heading1";
import { View } from "components/styledComponents";
import type { TFunction } from "i18next";
import React from "react";
import { Trans } from "react-i18next";
import useTranslation from "sharedHooks/useTranslation";

// Stories, photos and photo credits are bundled so we can show them offline.
// Attributions are copied from each photo on iNaturalist and, like the media
// viewer's, are not translated
const getImpactStories = ( t: TFunction ): ImpactStory[] => [
  {
    id: "moth_new_zealand",
    // https://www.inaturalist.org/observations/202565126
    photo: require( "images/onboarding/impact_moth.jpg" ),
    attribution: "(c) Pav Johnsson, some rights reserved (CC BY)",
    licenseCode: "cc-by",
    title: t( "Moth-presumed-extinct-for-decades-rediscovered-by-tourist" ),
    body: t( "The-Frosted-Phoenix-hadnt-been-spotted-in-decades" ),
    place: t( "New-Zealand" ),
  },
  {
    id: "mantis_australia",
    // https://www.inaturalist.org/observations/147015177
    photo: require( "images/onboarding/impact_mantis.jpg" ),
    attribution: "(c) Glenda Walter, some rights reserved (CC BY-NC)",
    licenseCode: "cc-by-nc",
    title: t( "New-praying-mantis-species-discovered-by-woman-walking-in-her-neighborhood" ),
    body: (
      <Trans
        i18nKey="A-woman-walking-in-her-neighborhood-photographed-a-mantis"
        components={ITALIC_SPANS}
      />
    ),
    place: t( "Australia" ),
  },
  {
    id: "lace_bug_uk",
    // https://www.inaturalist.org/observations/231643910
    photo: require( "images/onboarding/impact_lace_bug.jpg" ),
    attribution: "(c) giulsinclair, some rights reserved (CC BY-NC)",
    licenseCode: "cc-by-nc",
    title: t( "Invasive-lace-bug-species-spotted-in-a-new-location-by-London-bus-commuter" ),
    body: t( "A-London-commuter-noticed-a-tiny-insect" ),
    place: t( "United-Kingdom" ),
  },
  {
    id: "newt_brigade_us",
    // https://www.inaturalist.org/observations/78316386
    photo: require( "images/onboarding/impact_newt.jpg" ),
    attribution: "(c) tcuriel, all rights reserved",
    title: t( "Local-volunteers-form-newt-brigade-to-protect-amphibians" ),
    body: t( "Local-volunteers-in-California-used-iNaturalist" ),
    place: t( "United-States" ),
  },
];

const ImpactStep = ( ) => {
  const { t } = useTranslation( );
  const { stepId, proceedToNext } = useOnboardingFlow( );
  useOnboardingScreenView( stepId );
  const stories = getImpactStories( t );

  return (
    <OnboardingStepLayout
      footer={(
        <Button
          level="focus"
          text={t( "CONTINUE" )}
          onPress={proceedToNext}
          testID={`Onboarding.${stepId}.next`}
        />
      )}
    >
      <Heading1 accessibilityRole="header">
        <Trans i18nKey="Your-observations-make-a-difference" components={UNDERLINED_SPANS} />
      </Heading1>
      <Body1 className="mt-[19px]">
        <Trans
          i18nKey="More-than-8000-scientific-studies-have-relied-on-iNaturalist"
          components={BOLD_SPANS}
        />
      </Body1>
      <View className="mt-[50px] mb-[20px]">
        <ImpactStoryStrip stories={stories} />
      </View>
    </OnboardingStepLayout>
  );
};

export default ImpactStep;
