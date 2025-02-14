import {
  Body3, Button, Heading2, Modal
} from "components/SharedComponents";
import { Image } from "components/styledComponents";
import * as React from "react";
import { useTranslation } from "sharedHooks";

import OnboardingModalBase from "./OnboardingModalBase";

interface Slide {
  title: string;
  imageURI?: string;
  description: string;
}

interface Props {
  showModal: boolean;
  closeModal: ( ) => void;
  slides: Slide[];
}

const OnboardingModal = ( { showModal, closeModal, slides }: Props ) => {
  const { t } = useTranslation( );
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState( 0 );
  const currentSlide = slides[currentSlideIndex];

  const modalContent = (
    <OnboardingModalBase
      closeModal={closeModal}
    >
      <Heading2>{currentSlide.title}</Heading2>
      {
        // Image only shows when imageURI is defined
        currentSlide.imageURI && (
          <Image source={{ uri: currentSlide.imageURI }} className="h-[131px]" />
        )
      }
      <Body3>{currentSlide.description}</Body3>
      {/* Slide navigation only shows when more than one Slide */}
      {/* Continue button if we are on last slide */}
      {
        currentSlideIndex === slides.length - 1
        && (
          <Button level="focus" text={t( "CONTINUE" )} onPress={closeModal} />
        )
      }
    </OnboardingModalBase>
  );

  return (
    <Modal
      animationIn="fadeIn"
      animationOut="fadeOut"
      animationInTiming={250}
      animationOutTiming={250}
      showModal={showModal}
      closeModal={closeModal}
      modal={modalContent}
    />
  );
};

export default OnboardingModal;
