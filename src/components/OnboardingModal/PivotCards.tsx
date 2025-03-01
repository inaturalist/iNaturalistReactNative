import { useNavigation } from "@react-navigation/native";
import OnboardingModal from "components/OnboardingModal/OnboardingModal.tsx";
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
          description: t( "Once-youve-uploaded-to-iNaturalist" )
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
          title: t( "Your-observations-can-now-help-scientists" ),
          description: t( "All-observations-submitted-to-iNaturalist-need-a-date-and-location" ),
          imageSource: require( "images/background/camera-finder.png" )
        }
      ]}
    />
  );
};

const FirstObservationCard = ( { triggerCondition }: Props ) => {
  const { t } = useTranslation( );
  return (
    <OnboardingModal
      showKey="first-observation"
      triggerCondition={triggerCondition}
      slides={[
        {
          title: t( "Congrats-on-making-your-first-observation" ),
          description: t( "You-make-an-observation-every-time-you" ),
          imageSource: require( "images/background/camera-finder.png" )
        },
        {
          title: t( "Grow-your-collection" ),
          description: t( "Use-iNaturalist-to-collect-any-kind-of" ),
          imageSource: require( "images/background/iconic-taxon-photos-collage.png" )
        }
      ]}
    />
  );
};

const SecondObservationCard = ( { triggerCondition }: Props ) => {
  const { t } = useTranslation( );
  return (
    <OnboardingModal
      showKey="second-observation"
      triggerCondition={triggerCondition}
      slides={[
        {
          title: t( "Youve-made-2-observations" ),
          description: t( "How-does-it-feel-to-identify" ),
          imageSource: require( "images/background/toucans.jpg" )
        },
        {
          title: t( "Your-observations-can-help-scientists" ),
          description: t( "Scientists-use-citizen-science-data" ),
          imageSource: require( "images/background/phone-hand.jpg" )
        },
        {
          title: t( "Get-identifications-from-real-people" ),
          description: t( "Other-members-of-our-community-can-verify" ),
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
          description: t( "Weve-made-some-updates" ),
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
  FirstObservationCard,
  NotificationOnboarding,
  SecondObservationCard
};
