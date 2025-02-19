import {
  Body3, Button, Heading2, Heading3, INatIconButton, Modal,
  UnderlinedLink
} from "components/SharedComponents";
import { Image, View } from "components/styledComponents";
import * as React from "react";
import { ImageSourcePropType, ImageStyle } from "react-native";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

import OnboardingModalBase from "./OnboardingModalBase";

interface Slide {
  title: string;
  imageSource?: ImageSourcePropType;
  description: string;
  altActionButton?: {
    text: string;
    onPress: () => void;
  };
  altCloseButton?: {
    text: string;
  };
}

interface Props {
  showKey: string;
  triggerCondition: boolean;
  slides: Slide[];
}

const OnboardingModal = ( { showKey, triggerCondition, slides }: Props ) => {
  const { t } = useTranslation( );

  // Controls wether to show the modal, and to show it only once to the user
  const shownOnce = useStore( state => state.layout.shownOnce );
  const setShownOnce = useStore( state => state.layout.setShownOnce );
  const showModal = !shownOnce[showKey] && triggerCondition;
  const closeModal = () => {
    setShownOnce( showKey );
  };

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

  const renderAltButton = ( ) => {
    if ( currentSlide.altActionButton ) {
      return (
        <Button
          className="mt-5"
          level="focus"
          text={currentSlide.altActionButton.text}
          onPress={() => {
            currentSlide.altActionButton.onPress( );
            closeModal( );
          }}
        />
      );
    }
    return null;
  };

  const renderCloseButton = ( ) => {
    if ( currentSlideIndex !== slides.length - 1 ) { return null; }
    if ( currentSlide.altCloseButton ) {
      return (
        <UnderlinedLink
          className="mt-5 self-center"
          onPress={closeModal}
        >
          {currentSlide.altCloseButton.text}
        </UnderlinedLink>
      );
    }
    return (
      <Button className="mt-5" level="focus" text={t( "CONTINUE" )} onPress={closeModal} />
    );
  };

  const imageStyle: ImageStyle = {
    width: "100%",
    height: undefined,
    aspectRatio: 2
  };
  const modalContent = (
    <OnboardingModalBase
      closeModal={closeModal}
    >
      <Heading2>{currentSlide.title}</Heading2>
      {
        // Image only shows when imageSource is defined
        currentSlide.imageSource && (
          <View className="w-full mt-5">
            <Image
              className="self-center rounded-lg"
              source={currentSlide.imageSource}
              style={imageStyle}
              resizeMode="cover"
            />
          </View>
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
      {/* Some slides have an alternative call-to-action button */}
      {renderAltButton()}
      {/* Continue button if we are on last slide */}
      {renderCloseButton()}
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
