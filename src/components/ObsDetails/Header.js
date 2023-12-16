// @flow
import { useNavigation } from "@react-navigation/native";
import {
  Body1,
  DateDisplay, DisplayTaxon, InlineUser, ObservationLocation
} from "components/SharedComponents";
import ObsStatus from "components/SharedComponents/ObservationsFlashList/ObsStatus";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import {
  useTranslation
} from "sharedHooks";

import PhotoDisplayContainer from "./PhotoDisplayContainer";

type Props = {
  observation: Object,
  refetchRemoteObservation: Function,
  isOnline: boolean,
  belongsToCurrentUser: boolean
}

const Header = ( {
  observation,
  refetchRemoteObservation,
  isOnline,
  belongsToCurrentUser
}: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );

  const taxon = observation?.taxon;

  const showTaxon = () => {
    if ( !taxon ) {
      return (
        <View className="justify-center ml-1">
          <Body1>{t( "Unknown" )}</Body1>
        </View>
      );
    }
    return (
      <DisplayTaxon
        taxon={taxon}
        handlePress={( ) => navigation.navigate( "TaxonDetails", { id: taxon.id } )}
        testID={`ObsDetails.taxon.${taxon.id}`}
        accessibilityLabel={t( "Navigate-to-taxon-details" )}
      />
    );
  };

  return (
    <>
      <PhotoDisplayContainer
        observation={observation}
        refetchRemoteObservation={refetchRemoteObservation}
        isOnline={isOnline}
        belongsToCurrentUser={belongsToCurrentUser}
      />
      <View className="flex-row justify-between mx-[15px] mt-[13px]">
        <InlineUser user={observation?.user} isOnline={isOnline} />
        <DateDisplay
          dateString={
            observation.time_observed_at || observation.observed_on_string
          }
        />
      </View>
      <View className="flex-row my-[11px] justify-between mx-3">
        {showTaxon()}
        <ObsStatus layout="vertical" observation={observation} />
      </View>
      <ObservationLocation observation={observation} classNameMargin="ml-3 mb-2" />
    </>
  );
};

export default Header;
