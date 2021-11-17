// @flow

import React, { useState, useContext } from "react";
import { Text, View, Image, Pressable } from "react-native";
import type { Node } from "react";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/core";

import { viewStyles, textStyles } from "../../styles/obsDetails";
// import useFetchObsDetails from "./hooks/fetchObsDetails";
import useFetchObsDetailsFromRealm from "./hooks/fetchObsFromRealm";
import ActivityTab from "./ActivityTab";
import UserIcon from "../SharedComponents/UserIcon";
import PhotoScroll from "./PhotoScroll";
import DataTab from "./DataTab";
import { ObservationContext } from "../../providers/contexts";

const ObsDetails = ( ): Node => {
  const { observationId } = useContext( ObservationContext );
  const [tab, setTab] = useState( 0 );
  const navigation = useNavigation( );

  const uuid = observationId;
  const observation = useFetchObsDetailsFromRealm( uuid );

  const navToUserProfile = ( ) => navigation.navigate( "UserProfile" );

  const ids = observation && observation.identifications;
  const photos = observation && observation.photos;

  const showActivityTab = ( ) => setTab( 0 );
  const showDataTab = ( ) => setTab( 1 );

  if ( !observation ) { return null; }

  return (
    <ViewWithFooter>
      <ScrollView>
      <View style={viewStyles.userProfileRow}>
        <Pressable style={viewStyles.userProfileRow} onPress={navToUserProfile}>
          <UserIcon uri={observation.userProfilePhoto} />
          <Text>{`@${observation.userLogin}`}</Text>
        </Pressable>
        <Text>{observation.createdAt}</Text>
      </View>
      <View style={viewStyles.photoContainer}>
        <PhotoScroll photos={photos} />
      </View>
      <View style={viewStyles.row}>
        <Image source={{ uri: observation.userPhoto }} style={viewStyles.imageBackground} />
        <View style={viewStyles.obsDetailsColumn}>
          <Text style={textStyles.text}>{observation.taxonRank}</Text>
          <Text style={textStyles.commonNameText}>{observation.commonName}</Text>
          <Text style={textStyles.scientificNameText}>scientific name</Text>
        </View>
        <View>
          <Text style={textStyles.text}>{observation.identificationCount}</Text>
          <Text style={textStyles.text}>{observation.commentCount}</Text>
          <Text style={textStyles.text}>{observation.qualityGrade}</Text>
        </View>
      </View>
      <Text style={textStyles.locationText}>{observation.placeGuess}</Text>
      <View style={viewStyles.userProfileRow}>
        <Pressable
          onPress={showActivityTab}
        >
          <Text style={textStyles.greenButtonText}>ACTIVITY</Text>
        </Pressable>
        <Pressable
          onPress={showDataTab}
        >
          <Text style={textStyles.greenButtonText}>DATA</Text>
        </Pressable>
      </View>
      {tab === 0 ? <ActivityTab ids={ids} /> : <DataTab observation={observation} />}
      </ScrollView>
    </ViewWithFooter>
  );
};

export default ObsDetails;
