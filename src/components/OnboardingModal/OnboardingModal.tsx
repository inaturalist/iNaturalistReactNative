import {
  Body3, Button, Heading2, Modal
} from "components/SharedComponents";
import { Image } from "components/styledComponents";
import * as React from "react";
import { ImageSourcePropType } from "react-native";
import { useTranslation } from "sharedHooks";

import OnboardingModalBase from "./OnboardingModalBase";

interface Slide {
  title: string;
  imageSource?: ImageSourcePropType;
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
      <Heading2 className="mb-5">{currentSlide.title}</Heading2>
      {
        // Image only shows when imageSource is defined
        currentSlide.imageSource && (
          <Image source={currentSlide.imageSource} className="h-[131px]" />
        )
      }
      <Body3 className="mb-5">{currentSlide.description}</Body3>
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
