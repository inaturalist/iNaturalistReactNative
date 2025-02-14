import OnboardingModal from "components/OnboardingModal/OnboardingModal.tsx";
import React from "react";
import { useTranslation } from "sharedHooks";

interface Props {
  showModal: boolean;
  closeModal: () => void;
}

const NotificationOnboarding = ( { showModal, closeModal }: Props ) => {
  const { t } = useTranslation( );
  return (
    <OnboardingModal
      showModal={showModal}
      closeModal={closeModal}
      slides={[
        {
          title: t( "Watch-your-notifications-for-identifications" ),
          description: t( "Once-youve-uploaded-to-iNaturalist" )
        }
      ]}
    />
  );
};

const AccountCreationCard = ( { showModal, closeModal }: Props ) => {
  const { t } = useTranslation( );
  return (
    <OnboardingModal
      showModal={showModal}
      closeModal={closeModal}
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

const SecondObservationCard = ( { showModal, closeModal }: Props ) => {
  const { t } = useTranslation( );
  return (
    <OnboardingModal
      showModal={showModal}
      closeModal={closeModal}
      slides={[
        {
          title: t( "Youve-made-2-observations" ),
          description: t( "How-does-it-feel-to-identify" ),
          imageSource: require( "images/background/tucans.png" )
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

export {
  AccountCreationCard,
  NotificationOnboarding,
  SecondObservationCard
};
