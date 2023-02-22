import { Body1, Body2, Button } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "react-i18next";

const MyObservationsEmpty = ( { isLoading } ) => {
  const { t } = useTranslation( );
  if ( !isLoading ) {
    return (
      <View className="mx-5">
        <Body1 className="mb-3 mt-10">
          {t( "Welcome-to-iNaturalist" )}
        </Body1>
        <Body2 className="mb-5">
          {t( "iNaturalist-is-a-community-of-naturalists" )}
        </Body2>
        <Body2 className="mb-5">
          {t( "Observations-created-on-iNaturalist" )}
        </Body2>
        <Button className="mb-2" text={t( "CREATE-AN-OBSERVATION" )} level="focus" />
      </View>
    );
  }
  return null;
};

export default MyObservationsEmpty;
