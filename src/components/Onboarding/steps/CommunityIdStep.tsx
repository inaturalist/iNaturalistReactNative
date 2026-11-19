import OnboardingStepLayout from "components/Onboarding/OnboardingStepLayout";
import { BOLD_SPANS, UNDERLINED_SPANS } from "components/Onboarding/onboardingTransSpans";
import useOnboardingFlow from "components/Onboarding/useOnboardingFlow";
import Button from "components/SharedComponents/Buttons/Button";
import INatIcon from "components/SharedComponents/INatIcon";
import TaxonResult from "components/SharedComponents/TaxonResult";
import Body2 from "components/SharedComponents/Typography/Body2";
import Body3 from "components/SharedComponents/Typography/Body3";
import Heading1 from "components/SharedComponents/Typography/Heading1";
import { View } from "components/styledComponents";
import type { PropsWithChildren, ReactNode } from "react";
import React from "react";
import { Trans } from "react-i18next";
import useTranslation from "sharedHooks/useTranslation";

const CARD_SHADOW = {
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 4,
} as const;

interface DemoFeedItemProps extends PropsWithChildren {
  // A description of what happened, e.g. "you created an observation with an identification"
  header: ReactNode;
}

const DemoFeedItem = ( { header, children }: DemoFeedItemProps ) => (
  <View className="gap-[6px]">
    <View className="flex-row items-center px-[15px]">
      {/* placeholder until the bundled avatar is added */}
      <INatIcon name="person" size={22} />
      <Body3 className="ml-[7px] flex-1">{header}</Body3>
    </View>
    <View
      className="rounded-[10px] border border-lightGray bg-white px-[15px] py-[11px]"
      style={CARD_SHADOW}
    >
      {children}
    </View>
  </View>
);

const CommunityIdStep = ( ) => {
  const { t } = useTranslation( );
  const leafBeetles = {
    id: 51146,
    name: "Chrysomelidae",
    preferred_common_name: t( "Leaf-Beetles" ),
    rank: "family",
    rank_level: 30,
    // for the placeholder icon until the bundled taxon photo is added
    iconic_taxon_name: "Insecta",
  };
  const { stepId, proceedToNext } = useOnboardingFlow( );

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
        <Trans
          i18nKey="Real-people-will-identify-your-observation"
          components={UNDERLINED_SPANS}
        />
      </Heading1>
      <Body2 className="mt-[19px]">
        {t( "Our-global-community-works-together-to-help-identify-the-species-youre-looking-at" )}
      </Body2>
      <View className="mt-[29px] gap-[24px]">
        <DemoFeedItem
          header={(
            <Trans
              i18nKey="you-created-an-observation-with-an-identification"
              components={BOLD_SPANS}
            />
          )}
        >
          <TaxonResult
            taxon={leafBeetles}
            unpressable
            fromLocal={false}
            fetchRemote={false}
            asListItem={false}
          />
        </DemoFeedItem>
      </View>
    </OnboardingStepLayout>
  );
};

export default CommunityIdStep;
