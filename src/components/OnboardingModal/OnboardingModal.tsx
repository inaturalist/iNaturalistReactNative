import {
  Body3, Button, Heading2, Heading3, INatIconButton, Modal
} from "components/SharedComponents";
import { Image, View } from "components/styledComponents";
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

  const handleNext = ( ) => {
    if ( currentSlideIndex < slides.length - 1 ) {
      setCurrentSlideIndex( prev => prev + 1 );
    }
  };

  const handlePrevious = ( ) => {
    if ( currentSlideIndex > 0 ) {
      setCurrentSlideIndex( prev => prev - 1 );
    }
  };

  const modalContent = (
    <OnboardingModalBase
      closeModal={closeModal}
    >
      <Heading2>{currentSlide.title}</Heading2>
      {
        // Image only shows when imageSource is defined
        currentSlide.imageSource && (
          <Image
            className="self-center h-[131px] aspect-[2/1] rounded-lg mt-5"
            source={currentSlide.imageSource}
          />
        )
      }
      <Body3 className="mt-5">{currentSlide.description}</Body3>

      {/* Slide Navigation */}
      {slides.length > 1 && (
        <View className="flex-row items-center justify-between mx-6 mt-5">
          <View className="w-16">
            {currentSlideIndex !== 0 && (
              <INatIconButton
                icon="chevron-left-circle"
                size={26}
                onPress={handlePrevious}
                accessibilityLabel={t( "Previous-slide" )}
              />
            )}
          </View>
          <View>
            <Heading3>
              {t( "X-of-Y", {
                x: currentSlideIndex + 1,
                y: slides.length
              } )}
            </Heading3>
          </View>
          <View className="w-16 flex items-end">
            {( currentSlideIndex !== slides.length - 1 )
          && (
            <INatIconButton
              icon="chevron-right-circle"
              size={26}
              onPress={handleNext}
              accessibilityLabel={t( "Next-slide" )}
            />
          )}
          </View>
        </View>
      )}

      {/* Continue button if we are on last slide */}
      {
        currentSlideIndex === slides.length - 1
        && (
          <Button className="mt-5" level="focus" text={t( "CONTINUE" )} onPress={closeModal} />
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
