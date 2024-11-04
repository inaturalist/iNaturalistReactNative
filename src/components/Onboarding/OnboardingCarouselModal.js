import OnboardingCarousel from "components/Onboarding/OnboardingCarousel";
import Modal from "components/SharedComponents/Modal.tsx";
import React from "react";

const OnboardingCarouselModal = ( {
  showModal,
  closeModal
} ) => (
  <Modal
    showModal={showModal}
    fullScreen
    closeModal={closeModal}
    disableSwipeDirection
    noAnimation
    modal={(
      <OnboardingCarousel
        closeModal={closeModal}
      />
    )}
  />
);

export default OnboardingCarouselModal;
