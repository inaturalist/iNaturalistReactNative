import { Body1 } from "components/SharedComponents";
import React from "react";
import { useTranslation } from "react-i18next";

const MyObservationsEmpty = ( { currentUser, isLoading } ) => {
  const { t } = useTranslation( );
  if ( currentUser === false || !isLoading ) {
    return (
      <Body1 className="self-center">
        {t( "iNaturalist-is-a-community-of-naturalists" )}
      </Body1>
    );
  }
  return (
    <Body1 className="self-center">
      {t( "Welcome-to-iNaturalist!" )}
    </Body1>
  );
};

export default MyObservationsEmpty;
