// @flow

import _ from "lodash";
import React, {useState, useContext, useEffect, useRef} from "react";
import type { Node } from "react";
import { formatISO } from "date-fns";
import {
  Text,
  View,
  Image,
  Pressable,
  ScrollView,
  LogBox,
  Alert,
  TextInput as NativeTextInput,
  TouchableOpacity, Platform
} from "react-native";
import { useTranslation } from "react-i18next";

import ActivityTab from "./ActivityTab";
import checkCamelAndSnakeCase from "./helpers/checkCamelAndSnakeCase";
import createComment from "./helpers/createComment";
import createIdentification from "../Identify/helpers/createIdentification";
import DataTab from "./DataTab";
import faveObservation from "./helpers/faveObservation";
import ObsDetailsHeader from "./ObsDetailsHeader";
import PhotoScroll from "../SharedComponents/PhotoScroll";
import Taxon from "../../models/Taxon";
import TranslatedText from "../SharedComponents/TranslatedText";
import User from "../../models/User";
import UserIcon from "../SharedComponents/UserIcon";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { ObsEditContext } from "../../providers/contexts";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useRemoteObservation } from "./hooks/useRemoteObservation";
import { viewStyles, textStyles } from "../../styles/obsDetails/obsDetails";
import { formatObsListTime } from "../../sharedHelpers/dateAndTime";
import { getUser } from "../LoginSignUp/AuthenticationService";
import RoundGrayButton from "../SharedComponents/Buttons/RoundGrayButton";
import {BottomSheetModal, BottomSheetModalProvider, BottomSheetTextInput} from "@gorhom/bottom-sheet";
import {ActivityIndicator, TextInput} from "react-native-paper";
import {colors} from "../../styles/global";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// this is getting triggered by passing dates, like _created_at, through
// react navigation via the observation object. it doesn't seem to
// actually be breaking anything, for the moment (May 2, 2022)
LogBox.ignoreLogs( [
  "Non-serializable values were found in the navigation state"
] );

const ObsDetails = ( ): Node => {
  const { t } = useTranslation( );
  const [refetch, setRefetch] = useState( false );
  const [showCommentBox, setShowCommentBox] = useState( false );
  const [comment, setComment] = useState( "" );
  const { addObservations } = useContext( ObsEditContext );
  const { params } = useRoute( );
  let observation = params.observation;
  const [tab, setTab] = useState( 0 );
  const navigation = useNavigation( );
  const [ids, setIds] = useState( [] );
  const bottomSheetModalRef = useRef( null );
  const [addingComment, setAddingComment] = useState( false );

  const onBackdropPress = () => {
    Alert.alert(
      t( "Discard-Comment" ),
      t( "Are-you-sure-discard-comment" ),
      [{ text: t( "Yes" ), onPress: () => {
        setComment( "" );
        setShowCommentBox( false );
        } }, { text: t( "No" ) }],
      {
        cancelable: false
      }
    );
  };

  const renderHandle = ( props ) => (
      <View style={viewStyles.handleContainer} />
  );

  const renderBackdrop = ( props ) => (
    <TouchableOpacity activeOpacity={1} style={viewStyles.background} onPress={onBackdropPress}>
      <View   />
    </TouchableOpacity>
  );


  // TODO: we'll probably need to redo this logic a bit now that we're
  // passing an observation via navigation instead of reopening realm
  const { remoteObservation, currentUserFaved } = useRemoteObservation( observation, refetch );

  /* TODO - removed this since otherwise refreshing new comments will not work (will always use old local copy that
  *   doesn't include new comments) */
  if ( remoteObservation ) {
    observation = remoteObservation;
  }
  const showActivityTab = ( ) => setTab( 0 );
  const showDataTab = ( ) => setTab( 1 );

  const toggleRefetch = ( ) => setRefetch( !refetch );

  useEffect( () => {
    if ( observation ) {setIds( observation.identifications.map( i => i ) );}
  }, [observation] );

  useEffect( () => {
    if ( showCommentBox ) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [showCommentBox] );

  if ( !observation ) { return null; }


  const comments = observation.comments.map( c => c );
  const photos = _.compact( observation.observationPhotos?.map( op => op.photo ) );
  const user = observation.user;
  const taxon = observation.taxon;
  const uuid = observation.uuid;

  const onIDAdded = async ( identification ) => {
    console.log( "onIDAdded", identification );

    // Add temporary ID to observation.identifications ("ghosted" ID, while we're trying to add it)
    const currentUser = await getUser();
    const newId = {
      body: identification.body,
      taxon: identification.taxon,
      user: {
        id: currentUser?.id,
        login: currentUser?.login,
        signedIn: true
      },
      created_at: formatISO( Date.now() ),
      uuid: identification.uuid,
      vision: false,
      // This tells us to render is ghosted (since it's temporarily visible until getting a response from the server)
      temporary: true
    };
    setIds( [ ...ids, newId ] );

    let error = null;

    try {
      const results = await createIdentification( { observation_id: observation.uuid, taxon_id: newId.taxon.id, body: newId.body } );

      if ( results === 1 ) {
        // Remove ghosted highlighting
        newId.temporary = false;
        setIds( [ ...ids, newId ] );
      } else {
        // Couldn't create ID
        error = t( "Couldnt-create-identification", { error: t( "Unknown-error" ) } );
      }
    } catch ( e ) {
      error = t( "Couldnt-create-identification", { error: e.message } );
    }

    if ( error ) {
      // Remove temporary ID and show error
      setIds( [...ids] );

      Alert.alert(
        "Error",
        error,
        [{ text: t( "OK" ) }],
        {
          cancelable: true
        }
      );
    }
  };

  const navToUserProfile = userId => navigation.navigate( "UserProfile", { userId } );
  const navToTaxonDetails = ( ) => navigation.navigate( "TaxonDetails", { id: taxon.id } );
  const navToAddID = ( ) => {
    addObservations( [observation] );
    navigation.push( "AddID", { onIDAdded: onIDAdded, goBackOnSave: true } );
  };
  const openCommentBox = ( ) => setShowCommentBox( true );
  const submitComment = async ( ) => {
    setAddingComment( true );
    setComment( "" );
    setShowCommentBox( false );
    const response = await createComment( comment, uuid );
    setAddingComment( false );
    if ( response ) {
      setRefetch( !refetch );
    }
  };

  const showTaxon = ( ) => {
    if ( !taxon ) { return <Text>{t( "Unknown-organism" )}</Text>; }
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
          <Text style={textStyles.commonNameText}>
            {checkCamelAndSnakeCase( taxon, "preferredCommonName" )}
          </Text>
          <Text style={textStyles.scientificNameText}>{taxon.name}</Text>
        </Pressable>
      </>
    );
  };

  const renderBottomSheetTextView = () => {
    if ( Platform.OS === "ios" ) {
      return <BottomSheetTextInput
        keyboardType="default"
        style={[viewStyles.commentInput, viewStyles.commentInputText]}
        value={comment}
        selectionColor={colors.black}
        activeUnderlineColor={colors.transparent}
        placeholder={t( "Add-a-comment" )}
        autoFocus
        multiline
        onChangeText={setComment}
      />;
    } else {
      return <TextInput
        keyboardType="default"
        style={[viewStyles.commentInput]}
        value={comment}
        selectionColor={colors.black}
        activeUnderlineColor={colors.transparent}
        placeholder={t( "Add-a-comment" )}
        autoFocus
        multiline
        onChangeText={setComment}
        render={( innerProps ) => (
          <NativeTextInput
            {...innerProps}
            style={[
              innerProps.style,
              viewStyles.commentInputText
            ]}
          />
        )}
      />;
    }
  };

  const faveOrUnfave = async ( ) => {
    if ( currentUserFaved ) {
      await faveObservation( uuid, "unfave" );
      setRefetch( !refetch );
    } else {
      await faveObservation( uuid, "fave" );
      setRefetch( !refetch );
    }
  };

  const displayCreatedAt = ( ) => observation.createdAt
    ? observation.createdAt
    : formatObsListTime( observation._created_at );

  return (
    <BottomSheetModalProvider>
      <ViewWithFooter>
        <ObsDetailsHeader observationUUID={uuid} />
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
            <Text>{displayCreatedAt( )}</Text>
          </View>
          <View style={viewStyles.photoContainer}>
            <Pressable onPress={faveOrUnfave} style={viewStyles.pressableButton}>
              <Text style={textStyles.whiteText}>{currentUserFaved ? "faved!" : "tap to fave"}</Text>
            </Pressable>
            <PhotoScroll photos={photos} />
          </View>
          <View style={viewStyles.row}>
            {showTaxon( )}
            <View>
              <Text style={textStyles.text}>{observation.identifications.length}</Text>
              <Text style={textStyles.text}>{observation.comments.length}</Text>
              <Text style={textStyles.text}>{checkCamelAndSnakeCase( observation, "qualityGrade" )}</Text>
            </View>
          </View>
          <Text style={textStyles.locationText}>
            {checkCamelAndSnakeCase( observation, "placeGuess" )}
          </Text>
          <View style={viewStyles.userProfileRow}>
            <Pressable
              onPress={showActivityTab}
              accessibilityRole="button"
            >
              <TranslatedText style={textStyles.greenButtonText} text="ACTIVITY" />
            </Pressable>
            <Pressable
              onPress={showDataTab}
              testID="ObsDetails.DataTab"
              accessibilityRole="button"
            >
              <TranslatedText style={textStyles.greenButtonText} text="DATA" />
            </Pressable>
          </View>
          {tab === 0
            ? (
              <ActivityTab
                ids={ids}
                comments={comments}
                navToTaxonDetails={navToTaxonDetails}
                navToUserProfile={navToUserProfile}
                toggleRefetch={toggleRefetch}
              />
            )
            : <DataTab observation={observation} />}
          {addingComment && <View style={[viewStyles.row, viewStyles.centerRow]}>
            <ActivityIndicator size="large" />
          </View>}
          <View style={viewStyles.row}>
            <View style={viewStyles.button}>
              {/* TODO: get this button working. Not sure why createIdentification isn't working here
            but it doesn't appear to be working on staging either (Mar 11, 2022) */}
              <RoundGrayButton
                buttonText={t( "Suggest-an-ID" )}
                handlePress={navToAddID}
                testID="ObsDetail.cvSuggestionsButton"
              />
            </View>
            <View style={viewStyles.button}>
              <RoundGrayButton
                buttonText={t( "Add-Comment" )}
                handlePress={openCommentBox}
                testID="ObsDetail.commentButton"
                disabled={showCommentBox}
              />
            </View>
          </View>
        </ScrollView>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          enableOverDrag={false}
          enablePanDownToClose={true}
          snapPoints={["30%"]}
          backdropComponent={renderBackdrop}
          handleComponent={renderHandle}
          style={viewStyles.bottomModal}
        >
          <View style={viewStyles.commentInputContainer}>
            {renderBottomSheetTextView()}
            <TouchableOpacity
              style={viewStyles.sendComment}
              onPress={() => submitComment(  )}>
              <Icon name="send" size={35} color={colors.inatGreen} />
            </TouchableOpacity>
          </View>
        </BottomSheetModal>
      </ViewWithFooter>
    </BottomSheetModalProvider>
  );
};

export default ObsDetails;
