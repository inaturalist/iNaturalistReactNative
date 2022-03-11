// @flow

import React, { useState, useContext } from "react";
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
import { ObsEditContext } from "../../providers/contexts";
import InputField from "../SharedComponents/InputField";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import createComment from "./helpers/createComment";
import faveObservation from "./helpers/faveObservation";

const ObsDetails = ( ): Node => {
  const [showCommentBox, setShowCommentBox] = useState( false );
  const [comment, setComment] = useState( "" );
  const { addObservations, setPrevScreen } = useContext( ObsEditContext );
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
  const navToCVSuggestions = ( ) => {
    setPrevScreen( "ObsDetails" );
    addObservations( [observation] );
    navigation.navigate( "camera", { screen: "Suggestions" } );
  };
  const openCommentBox = ( ) => setShowCommentBox( true );
  const submitComment = ( ) => createComment( comment );

  const showTaxon = ( ) => {
    if ( !taxon ) { return <Text>unknown organism</Text>; }
    return (
      <>
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
      </>
    );
  };

  return (
    <ViewWithFooter>
      <ScrollView
        testID={`ObsDetails.${uuid}`}
        contentContainerStyle={viewStyles.scrollView}
      >
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
        <Pressable onPress={( ) => faveObservation( uuid )}>
          <Text style={textStyles.whiteText}>fave observation</Text>
        </Pressable>
        <PhotoScroll photos={photos} />
      </View>
      <View style={viewStyles.row}>
        {showTaxon( )}
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
        ? (
          <ActivityTab
            ids={ids}
            navToTaxonDetails={navToTaxonDetails}
            navToUserProfile={navToUserProfile}
          />
        )
        : <DataTab observation={observation} />}
        <View style={viewStyles.row}>
          <View style={viewStyles.button}>
            {/* TODO: get this button working. Not sure why createIdentification isn't working here
            but it doesn't appear to be working on staging either (Mar 11, 2022) */}
            <RoundGreenButton
              buttonText="Suggest an ID"
              handlePress={navToCVSuggestions}
              testID="ObsDetail.cvSuggestionsButton"
            />
          </View>
          <View style={viewStyles.button}>
            <RoundGreenButton
              buttonText="Comment"
              handlePress={openCommentBox}
              testID="ObsDetail.commentButton"
            />
          </View>
        </View>
        {showCommentBox && (
          <View style={viewStyles.hoverCommentBox}>
            <InputField
              handleTextChange={setComment}
              placeholder="Add a comment"
              text={comment}
              type="none"
            />
            <RoundGreenButton
              buttonText="Submit comment"
              handlePress={submitComment}
              testID="ObsDetail.commentSubmitButton"
            />
          </View>
        )}
      </ScrollView>
    </ViewWithFooter>
  );
};

export default ObsDetails;
