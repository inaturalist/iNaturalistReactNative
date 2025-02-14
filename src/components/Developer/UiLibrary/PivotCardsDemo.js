import {
  AccountCreationCard,
  FirstObservationCard,
  NotificationOnboarding,
  SecondObservationCard
} from "components/OnboardingModal/PivotCards.tsx";
import {
  Button,
  ScrollViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useState } from "react";

/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-unescaped-entities */
const Buttons = ( ) => {
  const [showModal, setShowModal] = useState( false );
  const [modalIndex, setModalIndex] = useState( 0 );

  const setShowingModal = index => {
    setModalIndex( index );
    setShowModal( true );
  };

  const closeModal = () => {
    setShowModal( false );
  };

  const pivotCards = [
    {
      title: "Account Creation",
      component: AccountCreationCard
    },
    {
      title: "First Observation",
      component: FirstObservationCard
    },
    {
      title: "Second Observation",
      component: SecondObservationCard
    },
    {
      title: "Notification Onboarding",
      component: NotificationOnboarding
    }
  ];

  return (
    <ScrollViewWrapper>
      {
        pivotCards.map( ( { title, component }, index ) => (
          <View className="p-4">
            <Button
              className="mb-2"
              level="primary"
              text={title}
              onPress={() => setShowingModal( index )}
            />
            {React.createElement(
              component,
              { showModal: showModal && modalIndex === index, closeModal }
            )}
          </View>
        ) )
      }
    </ScrollViewWrapper>
  );
};

export default Buttons;
