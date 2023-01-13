// @flow

import Map from "components/SharedComponents/Map";
import { Text, View } from "components/styledComponents";
import { format, parseISO } from "date-fns";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import useIsConnected from "sharedHooks/useIsConnected";
import colors from "styles/tailwindColors";

import Attribution from "./Attribution";
import checkCamelAndSnakeCase from "./helpers/checkCamelAndSnakeCase";

type Props = {
  observation: Object
}

const DataTab = ( { observation }: Props ): Node => {
  const isOnline = useIsConnected( );
  const application = observation?.application?.name;

  const displayTime = datetime => {
    const time = checkCamelAndSnakeCase( observation, datetime );
    return time ? format( parseISO( time ), "M/d/yy HH:mm a" ) : "";
  };

  return (
    <View>
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
            <IconMaterial name="network-check" size={30} accessibilityRole="image" />
          </View>
        )}
      <View className="px-5">
        <View className="flex-row my-3">
          <IconMaterial name="location-pin" size={15} color={colors.logInGray} />
          <Text className="ml-2">
            {checkCamelAndSnakeCase( observation, "placeGuess" )}
          </Text>
        </View>
        <Text className="text-lg my-3">{t( "Date" )}</Text>
        <View className="flex-row">
          <IconMaterial name="schedule" size={15} color={colors.logInGray} />
          <Text className="ml-2">
            {`${t( "Date-observed-colon" )} ${displayTime( "timeObservedAt" )}`}
          </Text>
        </View>
        <View className="flex-row">
          <IconMaterial name="schedule" size={15} color={colors.logInGray} />
          <Text className="ml-2">
            {`${t( "Date-uploaded-colon" )} ${displayTime( "createdAt" )}`}
          </Text>
        </View>
        <Text className="text-lg my-3">{t( "Other-Data" )}</Text>
        <Attribution observation={observation} />
        {application && (
        <>
          <Text className="mt-5">{t( "This-observation-was-created-using" )}</Text>
          <Text>{application}</Text>
        </>
        )}
      </View>
    </View>
  );
};

export default DataTab;
