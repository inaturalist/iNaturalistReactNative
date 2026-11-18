import OnboardingStepLayout from "components/Onboarding/OnboardingStepLayout";
import useOnboardingFlow from "components/Onboarding/useOnboardingFlow";
import Button from "components/SharedComponents/Buttons/Button";
import Body2 from "components/SharedComponents/Typography/Body2";
import Heading1 from "components/SharedComponents/Typography/Heading1";
import { Text } from "components/styledComponents";
import React from "react";
import { Trans } from "react-i18next";
import useTranslation from "sharedHooks/useTranslation";

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
          components={[
            <Text key="0" />,
            <Text key="1" className="underline" />,
          ]}
        />
      </Heading1>
    </OnboardingStepLayout>
  );
};

export default ObsStoryStep;
