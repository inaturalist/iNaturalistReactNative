// @flow

import Map from "components/SharedComponents/Map";
import { format, parseISO } from "date-fns";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Text, View } from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import { textStyles, viewStyles } from "styles/obsDetails/obsDetails";
import colors from "styles/tailwindColors";

import checkCamelAndSnakeCase from "./helpers/checkCamelAndSnakeCase";

type Props = {
  observation: Object
}

const DataTab = ( { observation }: Props ): Node => {
  const application = observation?.application?.name;
  const attribution = observation?.taxon?.default_photo?.attribution;

  const displayTimeObserved = ( ) => {
    const timeObservedAt = checkCamelAndSnakeCase( observation, "timeObservedAt" );
    if ( timeObservedAt ) {
      return format( parseISO( timeObservedAt ), "M/d/yy HH:mm a" );
    }
    if ( observation.observed_on_string ) {
      return observation.observed_on_string;
    }
    return "";
  };

  return (
    <View>
      <Text style={textStyles.dataTabHeader}>{t( "Notes" )}</Text>
      <Text style={textStyles.dataTabText}>{observation.description || "no description"}</Text>
      <Text style={textStyles.dataTabHeader}>{t( "Location" )}</Text>
      <Map
        obsLatitude={observation.latitude}
        obsLongitude={observation.longitude}
        mapHeight={150}
      />
      <View style={[viewStyles.rowWithIcon, viewStyles.locationContainer]}>
        <IconMaterial name="location-pin" size={15} color={colors.logInGray} />
        <Text style={textStyles.dataTabText}>
          {checkCamelAndSnakeCase( observation, "placeGuess" )}
        </Text>
      </View>

      <Text style={[textStyles.dataTabHeader, textStyles.dataTabDateHeader]}>{t( "Date" )}</Text>
      <View style={[viewStyles.rowWithIcon, viewStyles.dataTabSub]}>
        <IconMaterial name="schedule" size={15} color={colors.logInGray} />
        <Text
          style={textStyles.dataTabText}
        >
          {`${t( "Date-observed-colon" )} ${displayTimeObserved( )}`}
        </Text>
      </View>
      { observation._synced_at && (
      <View style={[viewStyles.rowWithIcon, viewStyles.dataTabView, viewStyles.dataTabSub]}>
        <IconMaterial name="schedule" size={15} color={colors.logInGray} />
        <Text
          style={textStyles.dataTabText}
        >
          {`${t( "Date-uploaded-colon" )} ${format( observation._synced_at, "M/d/yy HH:mm a" )}`}
        </Text>
      </View>
      ) }
      <Text style={textStyles.dataTabHeader}>{t( "Projects" )}</Text>
      <Text style={textStyles.dataTabHeader}>{t( "Other-Data" )}</Text>
      {attribution && <Text style={textStyles.dataTabText}>{attribution}</Text>}
      {application && (
        <>
          <Text style={textStyles.dataTabText}>{t( "This-observation-was-created-using" )}</Text>
          <Text style={textStyles.dataTabText}>{application}</Text>
        </>
      )}
    </View>
  );
};

export default DataTab;
