import classnames from "classnames";
import { Body4 } from "components/SharedComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

interface Props {
  textClassName?: string;
  currentUser: { id: number };
  observation: object;
}

const ObscurationExplanation = ( { textClassName, currentUser, observation }: Props ) => {
  const { t } = useTranslation( );
  let obscurationExplanation;
  if ( observation.obscured ) {
    if ( !observation.privateLatitude ) {
      obscurationExplanation = t( "Observation-location-obscured-randomized-point" );
    } else if ( observation.user.id === currentUser?.id ) {
      obscurationExplanation = t( "Observation-location-obscured-you-can-see-your-own" );
    } else {
      obscurationExplanation = t( "Observation-location-obscured-you-have-permission" );
    }
  }
  return (
    <Body4 className={classnames( textClassName, "italic" )}>
      { obscurationExplanation }
    </Body4>
  );
};

export default ObscurationExplanation;
