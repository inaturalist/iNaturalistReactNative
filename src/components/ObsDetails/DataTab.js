// @flow

import DropdownPicker from "components/Explore/DropdownPicker";
import Map from "components/SharedComponents/Map";
import { format, parseISO } from "date-fns";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";
import { Text, View } from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import { textStyles, viewStyles } from "styles/obsDetails/obsDetails";

import colors from "../../../tailwind-colors";
import addToProject from "./helpers/addToProject";
import checkCamelAndSnakeCase from "./helpers/checkCamelAndSnakeCase";

type Props = {
  observation: Object
}

const DataTab = ( { observation }: Props ): Node => {
  const [project, setProject] = useState( "" );
  const [projectId, setProjectId] = useState( null );

  const application = observation.application && observation.application.name;
  const attribution = observation.taxon && observation.taxon.default_photo
    && observation.taxon.default_photo.attribution;

  const selectProjectId = getValue => {
    addToProject( getValue( ), observation.uuid );
    setProjectId( getValue( ) );
  };

  const displayTimeObserved = ( ) => {
    const timeObseredAt = checkCamelAndSnakeCase( observation, "timeObservedAt" );
    if ( timeObseredAt ) {
      return format( parseISO( timeObseredAt ), "M/d/yy HH:mm a" );
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
      {/* TODO: create a custom dropdown that doesn't use FlatList */}
      <DropdownPicker
        searchQuery={project}
        setSearchQuery={setProject}
        setValue={selectProjectId}
        sources="projects"
        value={projectId}
      />
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
