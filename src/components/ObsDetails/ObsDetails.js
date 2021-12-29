// @flow

import React, { useState } from "react";
import { Text, View, Image, Pressable } from "react-native";
import type { Node } from "react";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { ScrollView } from "react-native-gesture-handler";
import { useNavigation, useRoute } from "@react-navigation/native";

import { viewStyles, textStyles } from "../../styles/obsDetails";
import ActivityTab from "./ActivityTab";
import UserIcon from "../SharedComponents/UserIcon";
import PhotoScroll from "../SharedComponents/PhotoScroll";
import DataTab from "./DataTab";
import { useObservation } from "./hooks/useObservation";
import Taxon from "../../models/Taxon";
import User from "../../models/User";

const ObsDetails = ( ): Node => {
  const { params } = useRoute( );
  const { uuid } = params;
  const [tab, setTab] = useState( 0 );
  const navigation = useNavigation( );

  const observation = useObservation( uuid );

  const showActivityTab = ( ) => setTab( 0 );
  const showDataTab = ( ) => setTab( 1 );

  if ( !observation ) { return null; }

  const ids = observation.identifications;
  const photos = observation.observationPhotos;
  const user = observation.user;
  const taxon = observation.taxon;

  const navToUserProfile = userId => navigation.navigate( "UserProfile", { userId } );
  const navToTaxonDetails = ( ) => navigation.navigate( "TaxonDetails", { id: taxon.id } );

  return (
    <ViewWithFooter>
      <ScrollView testID={`ObsDetails.${uuid}`} contentContainerStyle={viewStyles.scrollView}>
      <View style={viewStyles.userProfileRow}>
        <Pressable
          style={viewStyles.userProfileRow}
          onPress={( ) => navToUserProfile( user.id )}
          testID="ObsDetails.currentUser"
          accessibilityRole="link"
        >
          <UserIcon uri={User.uri( user )} />
          <Text>{User.userHandle( user )}</Text>
        </Pressable>
        <Text>{observation.createdAt}</Text>
      </View>
      <View style={viewStyles.photoContainer}>
        <PhotoScroll photos={photos} />
      </View>
      <View style={viewStyles.row}>
        <Image source={Taxon.uri( taxon )} style={viewStyles.imageBackground} />
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
