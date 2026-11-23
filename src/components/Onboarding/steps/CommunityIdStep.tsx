import { tailwindFontBold } from "appConstants/fontFamilies";
import classnames from "classnames";
import CARD_SHADOW from "components/Onboarding/onboardingCardShadow";
import { useOnboardingCompact } from "components/Onboarding/onboardingCompact";
import OnboardingFlexGap from "components/Onboarding/OnboardingFlexGap";
import OnboardingHeadline from "components/Onboarding/OnboardingHeadline";
import OnboardingStepLayout from "components/Onboarding/OnboardingStepLayout";
import { BOLD_SPANS, UNDERLINED_SPANS } from "components/Onboarding/onboardingTransSpans";
import useOnboardingFlow from "components/Onboarding/useOnboardingFlow";
import useOnboardingScreenView from "components/Onboarding/useOnboardingScreenView";
import Button from "components/SharedComponents/Buttons/Button";
import TaxonResult from "components/SharedComponents/TaxonResult";
import Body2 from "components/SharedComponents/Typography/Body2";
import Body3 from "components/SharedComponents/Typography/Body3";
import { Image, View } from "components/styledComponents";
import type { PropsWithChildren, ReactNode } from "react";
import React from "react";
import { Trans } from "react-i18next";
import type { ImageSourcePropType } from "react-native";
import bundledImageUrl from "sharedHelpers/bundledImageUrl";
import useTranslation from "sharedHooks/useTranslation";

interface DemoFeedItemProps extends PropsWithChildren {
  avatar: ImageSourcePropType;
  // A description of what happened, e.g. "you created an observation with an identification"
  header: ReactNode;
  highlighted?: boolean;
}

const DemoFeedItem = ( {
  avatar, header, highlighted, children,
}: DemoFeedItemProps ) => {
  const compact = useOnboardingCompact( );
  return (
    <View className={compact
      ? "gap-1"
      : "gap-[6px]"}
    >
      <View className="flex-row items-center px-[15px]">
        <Image
          source={avatar}
          className="h-[22px] w-[22px] rounded-full"
          accessibilityIgnoresInvertColors
        />
        <Body3 className="ml-[7px] flex-1">{header}</Body3>
      </View>
      <View
        className={classnames( "rounded-[10px] border border-lightGray px-[15px]", {
          "py-[6px]": compact,
          "py-[11px]": !compact,
          "bg-lightGreen": highlighted,
          "bg-white": !highlighted,
        } )}
        style={CARD_SHADOW}
      >
        {children}
      </View>
    </View>
  );
};

const CommunityIdContent = ( ) => {
  const { t } = useTranslation( );
  const compact = useOnboardingCompact( );
  const leafBeetles = {
    id: 51146,
    name: "Chrysomelidae",
    preferred_common_name: t( "Leaf-Beetles" ),
    rank: "family",
    rank_level: 30,
    default_photo: {
      url: bundledImageUrl( require( "images/onboarding/taxon_leaf_beetles.jpg" ) ),
    },
  };
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
    <>
      <OnboardingHeadline>
        <Trans
          i18nKey="Real-people-will-identify-your-observation"
          components={UNDERLINED_SPANS}
        />
      </OnboardingHeadline>
      <OnboardingFlexGap min={8} max={19} />
      <Body2>
        {t( "Our-global-community-works-together-to-help-identify-the-species-youre-looking-at" )}
      </Body2>
      <OnboardingFlexGap min={8} max={29} />
      <DemoFeedItem
        avatar={require( "images/onboarding/avatar_you.png" )}
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
      <OnboardingFlexGap min={4} max={24} />
      <DemoFeedItem
        avatar={require( "images/onboarding/avatar_3eetlefan.png" )}
        highlighted
        header={(
          <Trans
            i18nKey="user-identified-your-observation"
            values={{ userName: "3eetlefan" }}
            components={BOLD_SPANS}
          />
        )}
      >
        <TaxonResult
          taxon={spottedCucumberBeetle}
          unpressable
          fromLocal={false}
          fetchRemote={false}
          asListItem={false}
        />
        <Body2 className={classnames( tailwindFontBold, compact
          ? "mt-[6px]"
          : "mt-[10px]" )}
        >
          {t( "You-can-tell-because-of-the-spots" )}
        </Body2>
      </DemoFeedItem>
      <OnboardingFlexGap min={4} max={24} />
      <DemoFeedItem
        avatar={require( "images/onboarding/avatar_5amfieldwork.png" )}
        header={(
          <Trans
            i18nKey="user-added-a-comment"
            values={{ userName: "5amfieldwork" }}
            components={BOLD_SPANS}
          />
        )}
      >
        <Body2 className={tailwindFontBold}>{t( "Nice-shot" )}</Body2>
      </DemoFeedItem>
      <OnboardingFlexGap min={4} max={24} />
      <DemoFeedItem
        avatar={require( "images/onboarding/avatar_2manycoleopteraaa.png" )}
        highlighted
        header={(
          <Trans
            i18nKey="user-identified-your-observation"
            values={{ userName: "2manycoleopteraaa" }}
            components={BOLD_SPANS}
          />
        )}
      >
        <TaxonResult
          taxon={spottedCucumberBeetle}
          unpressable
          fromLocal={false}
          fetchRemote={false}
          asListItem={false}
        />
      </DemoFeedItem>
    </>
  );
};

const CommunityIdStep = ( ) => {
  const { t } = useTranslation( );
  const { stepId, proceedToNext } = useOnboardingFlow( );
  useOnboardingScreenView( stepId );

  return (
    <OnboardingStepLayout
      fitsToScreen
      footer={(
        <Button
          level="focus"
          text={t( "CONTINUE" )}
          onPress={proceedToNext}
          testID={`Onboarding.${stepId}.next`}
        />
      )}
    >
      <CommunityIdContent />
    </OnboardingStepLayout>
  );
};

export default CommunityIdStep;
