import {
  Body3, Button, Heading2, Heading3, INatIconButton, Modal,
  UnderlinedLink
} from "components/SharedComponents";
import { Image, Pressable, View } from "components/styledComponents";
import * as React from "react";
import { ImageSourcePropType, ImageStyle } from "react-native";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

import OnboardingModalBase from "./OnboardingModalBase";

interface Slide {
  title: string;
  imageSource?: ImageSourcePropType;
  description: string;
  description2?: string;
  imageComponentOptions?: {
    imageComponent: React.ReactNode;
    onImageComponentPress: ( ) => void;
    accessibilityHint: string;
  };
}

interface Props {
  showKey: string;
  triggerCondition: boolean;
  slides: Slide[];
  altActionButton?: {
    text: string;
    onPress: () => void;
  };
  altCloseButton?: {
    text: string;
  };
}

const OnboardingModal = ( {
  showKey, triggerCondition, slides, altActionButton, altCloseButton
}: Props ) => {
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

  const renderAltActionButton = ( ) => {
    if ( currentSlideIndex !== slides.length - 1 ) { return null; }
    if ( !altActionButton ) { return null; }
    return (
      <Button
        className="mt-5"
        level="focus"
        text={altActionButton.text}
        onPress={() => {
          altActionButton.onPress( );
          closeModal( );
        }}
      />
    );
  };

  const renderCloseButton = ( ) => {
    if ( currentSlideIndex !== slides.length - 1 ) { return null; }
    if ( altCloseButton ) {
      return (
        <UnderlinedLink
          className="mt-5 self-center"
          onPress={closeModal}
        >
          {altCloseButton.text}
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
      {/* OneObservationCard shows the user's grid observation component */}
      {currentSlide?.imageComponentOptions?.imageComponent && (
        <Pressable
          className="self-center mt-5"
          onPress={( ) => {
            currentSlide?.imageComponentOptions?.onImageComponentPress( );
            closeModal( );
          }}
          accessibilityRole="link"
          accessibilityHint={currentSlide?.imageComponentOptions?.accessibilityHint}
        >
          {currentSlide.imageComponentOptions.imageComponent}
        </Pressable>
      )}
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
      {currentSlide.description && <Body3 className="mt-5">{currentSlide.description}</Body3>}
      {currentSlide.description2 && <Body3 className="mt-2">{currentSlide.description2}</Body3>}
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
      {renderAltActionButton()}
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
      fullScreen
    />
  );
};

export default OnboardingModal;
