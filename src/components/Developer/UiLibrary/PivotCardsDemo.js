import {
  AccountCreationCard,
  FiftyObservationCard,
  FirstObservationCard,
  FiveObservationCard,
  NotificationOnboarding
} from "components/OnboardingModal/PivotCards.tsx";
import {
  Button,
  ScrollViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useState } from "react";
import useStore from "stores/useStore";

/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-unescaped-entities */
const Buttons = ( ) => {
  const resetShownOnce = useStore( state => state.layout.resetShownOnce );
  const [modalIndex, setModalIndex] = useState( -1 );

  const setShowingModal = index => {
    setModalIndex( index );
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
      title: "Five Observation",
      component: FiveObservationCard
    },
    {
      title: "Fifty Observation",
      component: FiftyObservationCard
    },
    {
      title: "Notification Onboarding",
      component: NotificationOnboarding
    }
  ];

  return (
    <ScrollViewWrapper>
      <Button
        className="mb-2"
        level="primary"
        text="Reset shown state"
        onPress={() => {
          resetShownOnce( );
          setModalIndex( -1 );
        }}
      />
      {pivotCards.map( ( { title, component }, index ) => (
        <View className="p-4">
          <Button
            className="mb-2"
            level="primary"
            text={title}
            onPress={() => setShowingModal( index )}
          />
          {React.createElement( component, {
            triggerCondition: modalIndex === index
          } )}
        </View>
      ) )}
    </ScrollViewWrapper>
  );
};

export default Buttons;
