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

export {
  NotificationOnboarding,
};
