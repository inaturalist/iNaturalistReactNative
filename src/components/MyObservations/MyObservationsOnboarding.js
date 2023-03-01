// @flow
import { Body3 } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";

type Props = {
  numOfObservations: number
}

const MyObservationsOnboarding = ( { numOfObservations }: Props ): Node => {
  const { t } = useTranslation( );

  const getOnboardingText = ( ) => {
    if ( numOfObservations <= 10 ) {
      return t( "As-you-upload-more-observations" );
    } if ( numOfObservations <= 50 ) {
      return t( "Observations-you-upload-to-iNaturalist" );
    }
    return t( "You-can-search-observations-of-any-plant-or-animal" );
  };

  return numOfObservations <= 100 && numOfObservations > 0
    ? <Body3 className="pt-5">{getOnboardingText( ) }</Body3>
    : null;
};

export default MyObservationsOnboarding;
