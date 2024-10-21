// @flow
import { Body3 } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import { useCurrentUser, useTranslation } from "sharedHooks";

const Onboarding = ( ): Node => {
  const currentUser = useCurrentUser( );
  const numObservations = currentUser?.observations_count || 0;
  const { t } = useTranslation( );

  const getOnboardingText = ( ) => {
    if ( numObservations <= 10 ) {
      return t( "As-you-upload-more-observations" );
    }
    if ( numObservations <= 50 ) {
      return t( "Observations-you-upload-to-iNaturalist" );
    }
    return t( "You-can-search-observations-of-any-plant-or-animal" );
  };

  return numObservations <= 100 && numObservations > 0
    ? <Body3 className="pb-5">{getOnboardingText( ) }</Body3>
    : null;
};

export default Onboarding;
