import { useNavigation } from "@react-navigation/native";
import OnboardingModal from "components/OnboardingModal/OnboardingModal";
import React from "react";
import { useTranslation } from "sharedHooks";

interface Props {
  triggerCondition: boolean;
}

const NotificationOnboarding = ( { triggerCondition }: Props ) => {
  const { t } = useTranslation( );
  return (
    <OnboardingModal
      showKey="notification-onboarding"
      triggerCondition={triggerCondition}
      slides={[
        {
          title: t( "Watch-your-notifications-for-identifications" ),
          description: t( "The-iNaturalist-community-will-help-verify-and-refine-identifications" )
        }
      ]}
    />
  );
};

const AccountCreationCard = ( { triggerCondition }: Props ) => {
  const { t } = useTranslation( );
  return (
    <OnboardingModal
      showKey="account-creation"
      triggerCondition={triggerCondition}
      slides={[
        {
          title: t( "Youre-ready-to-share-your-observations" ),
          description: t( "You-can-now-upload-your-observations-to-iNaturalist-and-contribute" ),
          description2: t( "All-observations-need-a-date-and-location-to-be-used-for-science" ),
          checkbox1: t( "Get-feedback-from-naturalists-and-experts-who-will-help-verify" ),
          checkbox2: t( "Help-create-Research-Grade-data-used-in-science-and-conservation" ),
          imageSource: require( "images/background/camera-finder.png" )
        }
      ]}
    />
  );
};

const OneObservationCard = ( { triggerCondition, imageComponentOptions }: Props ) => {
  const { t } = useTranslation( );
  return (
    <OnboardingModal
      showKey="first-observation"
      triggerCondition={triggerCondition}
      slides={[
        {
          title: t( "Congratulations-You-made-your-first-observation" ),
          imageComponentOptions
        }
      ]}
    />
  );
};

const FiveObservationCard = ( { triggerCondition }: Props ) => {
  const { t } = useTranslation( );
  return (
    <OnboardingModal
      showKey="five-observation"
      triggerCondition={triggerCondition}
      slides={[
        {
          title: t( "Your-observations-can-help-science" ),
          description: t( "Upload-your-observations-to-contribute-data-to-help-save-species" ),
          description2: t( "Learn-from-people-who-verify-and-refine-your-identifications" ),
          imageSource: require( "images/background/using-inaturalist-in-the-field.png" )
        }
      ]}
    />
  );
};

const FiftyObservationCard = ( { triggerCondition }: Props ) => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  return (
    <OnboardingModal
      showKey="fifty-observation"
      triggerCondition={triggerCondition}
      slides={[
        {
          title: t( "Welcome-back" ),
          description: t( "You-may-notice-changes-to-how-things-look-and-flow" ),
          imageSource: require( "images/background/using-inaturalist-in-the-field.png" )
        }
      ]}
      altActionButton={{
        text: t( "OPEN-SETTINGS" ),
        onPress: ( ) => {
          navigation.navigate( "Settings" );
        }
      }}
      altCloseButton={{
        text: t( "Skip-for-now" )
      }}
    />
  );
};

export {
  AccountCreationCard,
  FiftyObservationCard,
  FiveObservationCard,
  NotificationOnboarding,
  OneObservationCard
};
