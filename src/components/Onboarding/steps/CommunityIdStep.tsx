import { tailwindFontBold } from "appConstants/fontFamilies";
import classnames from "classnames";
import OnboardingStepLayout from "components/Onboarding/OnboardingStepLayout";
import { BOLD_SPANS, UNDERLINED_SPANS } from "components/Onboarding/onboardingTransSpans";
import useOnboardingFlow from "components/Onboarding/useOnboardingFlow";
import Button from "components/SharedComponents/Buttons/Button";
import TaxonResult from "components/SharedComponents/TaxonResult";
import Body2 from "components/SharedComponents/Typography/Body2";
import Body3 from "components/SharedComponents/Typography/Body3";
import Heading1 from "components/SharedComponents/Typography/Heading1";
import { Image, View } from "components/styledComponents";
import type { PropsWithChildren, ReactNode } from "react";
import React from "react";
import { Trans } from "react-i18next";
import type { ImageSourcePropType } from "react-native";
import bundledImageUrl from "sharedHelpers/bundledImageUrl";
import useTranslation from "sharedHooks/useTranslation";

const CARD_SHADOW = {
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 4,
} as const;

interface DemoFeedItemProps extends PropsWithChildren {
  avatar: ImageSourcePropType;
  // A description of what happened, e.g. "you created an observation with an identification"
  header: ReactNode;
  highlighted?: boolean;
}

const DemoFeedItem = ( {
  avatar, header, highlighted, children,
}: DemoFeedItemProps ) => (
  <View className="gap-[6px]">
    <View className="flex-row items-center px-[15px]">
      <Image
        source={avatar}
        className="h-[22px] w-[22px] rounded-full"
        accessibilityIgnoresInvertColors
      />
      <Body3 className="ml-[7px] flex-1">{header}</Body3>
    </View>
    <View
      className={classnames( "rounded-[10px] border border-lightGray px-[15px] py-[11px]", {
        "bg-lightGreen": highlighted,
        "bg-white": !highlighted,
      } )}
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
          <Body2 className={`mt-[10px] ${tailwindFontBold}`}>
            {t( "You-can-tell-because-of-the-spots" )}
          </Body2>
        </DemoFeedItem>
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
      </View>
    </OnboardingStepLayout>
  );
};

export default CommunityIdStep;
