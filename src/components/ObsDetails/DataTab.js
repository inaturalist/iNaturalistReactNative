// @flow

import {
  DateDisplay,
  ObservationLocation
} from "components/SharedComponents";
import Map from "components/SharedComponents/Map";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import useIsConnected from "sharedHooks/useIsConnected";

import Attribution from "./Attribution";
import checkCamelAndSnakeCase from "./helpers/checkCamelAndSnakeCase";

type Props = {
  observation: Object
}

const DataTab = ( { observation }: Props ): Node => {
  const isOnline = useIsConnected( );
  const application = observation?.application?.name;

  return (
    <>
      <View className="px-5">
        {observation.description && (
        <>
          <Text className="text-lg my-3">{t( "Notes" )}</Text>
          <Text>{observation.description}</Text>
        </>
        )}
        <Text className="text-lg my-3">{t( "Location" )}</Text>
      </View>
      {isOnline
        ? (
          <Map
            obsLatitude={observation.latitude}
            obsLongitude={observation.longitude}
            mapHeight={150}
          />
        ) : (
          <View className="h-16 items-center justify-center">
            <IconMaterial
              name="wifi-off"
              size={30}
              accessibilityRole="image"
              accessibilityLabel={t( "Location-map-unavailable-without-internet" )}
            />
          </View>
        )}
      <View className="px-5">
        <View className="my-3">
          <ObservationLocation observation={observation} />
        </View>
        <Text className="text-lg my-3">{t( "Date" )}</Text>
        <DateDisplay
          label={t( "Date-observed-colon" )}
          dateString={checkCamelAndSnakeCase( observation, "timeObservedAt" )}
        />
        <DateDisplay
          label={t( "Date-uploaded-colon" )}
          dateString={checkCamelAndSnakeCase( observation, "createdAt" )}
        />
        <Text className="text-lg my-3">{t( "Other-Data" )}</Text>
        <Attribution observation={observation} />
        {application && (
        <>
          <Text className="mt-5">{t( "This-observation-was-created-using" )}</Text>
          <Text>{application}</Text>
        </>
        )}
      </View>
    </>
  );
};

export default DataTab;
