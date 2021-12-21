// @flow

import React, { useState, useContext } from "react";
import { Text, View, Image, Pressable } from "react-native";
import type { Node } from "react";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { ScrollView } from "react-native-gesture-handler";
import { useNavigation, useRoute } from "@react-navigation/native";

import { viewStyles, textStyles } from "../../styles/obsDetails";
import { useFetchObsDetailsFromRealm } from "./hooks/fetchObsFromRealm";
import ActivityTab from "./ActivityTab";
import UserIcon from "../SharedComponents/UserIcon";
import PhotoScroll from "../SharedComponents/PhotoScroll";
import DataTab from "./DataTab";
import { ObservationContext } from "../../providers/contexts";

const ObsDetails = ( ): Node => {
  const { exploreList } = useContext( ObservationContext );
  const { params } = useRoute( );
  const { uuid } = params;
  const [tab, setTab] = useState( 0 );
  const navigation = useNavigation( );

  // MyObservations
  let observation = useFetchObsDetailsFromRealm( uuid );

  // Explore
  if ( !observation && exploreList && exploreList.length > 0 ) {
    observation = exploreList.filter( obs => obs.uuid === uuid )[0];
  }

  const navToUserProfile = userId => navigation.navigate( "UserProfile", { userId } );
  const navToTaxonDetails = ( ) => navigation.navigate( "TaxonDetails", { id: taxon.id } );

  const ids = observation && observation.identifications;
  const photos = observation && observation.observationPhotos;

  const showActivityTab = ( ) => setTab( 0 );
  const showDataTab = ( ) => setTab( 1 );

  if ( !observation ) { return null; }

  const taxon = observation.taxon;

  return (
    <ViewWithFooter>
      <ScrollView testID={`ObsDetails.${uuid}`} contentContainerStyle={viewStyles.scrollView}>
      <View style={viewStyles.userProfileRow}>
        {/* TODO: add user id to this handle press event */}
        <Pressable
          style={viewStyles.userProfileRow}
          onPress={navToUserProfile}
          testID="ObsDetails.currentUser"
          accessibilityRole="link"
        >
          {/* TODO: fill user icon in with saved current user icon or icon from another user API call */}
          <UserIcon uri={null} />
          {/* TODO: fill in text with saved current user login or login from another user API call */}
          <Text>@currentUser</Text>
        </Pressable>
        <Text>{observation.createdAt}</Text>
      </View>
      <View style={viewStyles.photoContainer}>
        <PhotoScroll photos={photos} />
      </View>
      <View style={viewStyles.row}>
        <Image source={{ uri: taxon.defaultPhotoSquareUrl }} style={viewStyles.imageBackground} />
        <Pressable
          style={viewStyles.obsDetailsColumn}
          onPress={navToTaxonDetails}
          testID={`ObsDetails.taxon.${taxon.id}`}
          accessibilityRole="link"
          accessibilityLabel="go to taxon details"
        >
          <Text style={textStyles.text}>{taxon.rank}</Text>
          <Text style={textStyles.commonNameText}>{taxon.preferredCommonName}</Text>
          <Text style={textStyles.scientificNameText}>{taxon.name}</Text>
        </Pressable>
        <View>
          <Text style={textStyles.text}>{observation.identifications.length}</Text>
          <Text style={textStyles.text}>{observation.comments.length}</Text>
          <Text style={textStyles.text}>{observation.qualityGrade}</Text>
        </View>
      </View>
      <Text style={textStyles.locationText}>{observation.placeGuess}</Text>
      <View style={viewStyles.userProfileRow}>
        <Pressable
          onPress={showActivityTab}
          accessibilityRole="button"
        >
          <Text style={textStyles.greenButtonText}>ACTIVITY</Text>
        </Pressable>
        <Pressable
          onPress={showDataTab}
          testID="ObsDetails.DataTab"
          accessibilityRole="button"
        >
          <Text style={textStyles.greenButtonText}>DATA</Text>
        </Pressable>
      </View>
      {tab === 0
        ? <ActivityTab ids={ids} navToTaxonDetails={navToTaxonDetails} navToUserProfile={navToUserProfile} />
        : <DataTab observation={observation} />}
      </ScrollView>
    </ViewWithFooter>
  );
};

export default ObsDetails;
