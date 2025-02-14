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

export {
  AccountCreationCard,
  NotificationOnboarding,
};
