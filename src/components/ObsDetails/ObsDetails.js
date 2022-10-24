// @flow

import {
  BottomSheetModal, BottomSheetModalProvider,
  BottomSheetTextInput
} from "@gorhom/bottom-sheet";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { createComments } from "api/comments";
import createIdentifications from "api/identifications";
import {
  faveObservation, fetchRemoteObservation, markObservationUpdatesViewed, unfaveObservation
} from "api/observations";
import Button from "components/SharedComponents/Buttons/Button";
import PhotoScroll from "components/SharedComponents/PhotoScroll";
import QualityBadge from "components/SharedComponents/QualityBadge";
import ScrollWithFooter from "components/SharedComponents/ScrollWithFooter";
import TranslatedText from "components/SharedComponents/TranslatedText";
import UserIcon from "components/SharedComponents/UserIcon";
import { formatISO } from "date-fns";
import _ from "lodash";
import { ObsEditContext, RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useContext, useEffect, useRef, useState
} from "react";
import { useTranslation } from "react-i18next";
import {
  Alert, Image, Keyboard,
  LogBox, Pressable, Text,
  TextInput as NativeTextInput, TouchableOpacity, View
} from "react-native";
import { ActivityIndicator, Button as IconButton } from "react-native-paper";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import { formatObsListTime } from "sharedHelpers/dateAndTime";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useCurrentUser from "sharedHooks/useCurrentUser";
import colors from "styles/colors";
import { imageStyles, textStyles, viewStyles } from "styles/obsDetails/obsDetails";

import Taxon from "../../models/Taxon";
import User from "../../models/User";
import ActivityTab from "./ActivityTab";
import DataTab from "./DataTab";
import checkCamelAndSnakeCase from "./helpers/checkCamelAndSnakeCase";
import ObsDetailsHeader from "./ObsDetailsHeader";

const { useRealm } = RealmContext;

// this is getting triggered by passing dates, like _created_at, through
// react navigation via the observation object. it doesn't seem to
// actually be breaking anything, for the moment (May 2, 2022)
LogBox.ignoreLogs( [
  "Non-serializable values were found in the navigation state"
] );

const ObsDetails = ( ): Node => {
  const currentUser = useCurrentUser( );
  const userId = currentUser?.id;
  const { t } = useTranslation( );
  const [refetch, setRefetch] = useState( false );
  const [showCommentBox, setShowCommentBox] = useState( false );
  const [comment, setComment] = useState( "" );
  const { addObservations } = useContext( ObsEditContext );
  const { params } = useRoute( );
  const { uuid } = params;
  const [tab, setTab] = useState( 0 );
  const navigation = useNavigation( );
  const [ids, setIds] = useState( [] );
  const bottomSheetModalRef = useRef( null );
  const [addingComment, setAddingComment] = useState( false );
  const [snapPoint, setSnapPoint] = useState( 100 );
  const realm = useRealm( );
  const localObservation = realm?.objectForPrimaryKey( "Observation", uuid );

  const queryClient = useQueryClient( );

  const {
    data: remoteObservation,
    refetch: refetchRemoteObservation
  } = useAuthenticatedQuery(
    ["fetchRemoteObservation", uuid],
    optsWithAuth => fetchRemoteObservation( uuid, { }, optsWithAuth )
  );

  const observation = localObservation || remoteObservation;

  const handleSuccess = {
    onSuccess: ( ) => {
      queryClient.invalidateQueries( ["fetchRemoteObservation", uuid] );
      refetchRemoteObservation( );
    }
  };

  const createCommentMutation = useAuthenticatedMutation(
    ( body, optsWithAuth ) => createComments( {
      comment: {
        body,
        parent_id: uuid,
        parent_type: "Observation"
      }
    }, optsWithAuth ),
    handleSuccess
  );

  const handleIdentificationMutation = {
    onSuccess: data => setIds( [...ids, data[0]] ),
    onError: e => {
      let error = null;
      if ( e ) {
        error = t( "Couldnt-create-identification", { error: e.message } );
      } else {
        error = t( "Couldnt-create-identification", { error: t( "Unknown-error" ) } );
      }

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

  const createIdentificationMutation = useAuthenticatedMutation(
    ( idParams, optsWithAuth ) => createIdentifications( idParams, optsWithAuth ),
    handleIdentificationMutation
  );

  const markViewedMutation = useAuthenticatedMutation(
    ( viewedParams, optsWithAuth ) => markObservationUpdatesViewed( viewedParams, optsWithAuth ),
    handleSuccess
  );

  const taxon = observation?.taxon;
  const user = observation?.user;
  const faves = observation?.faves;
  const currentUserFaved = faves?.length > 0 ? faves.find( fave => fave.user.id === userId ) : null;

  useEffect( ( ) => {
    // set initial ids for activity tab
    if ( observation && ids.length === 0 ) {
      setIds( observation.identifications );
    }
  }, [observation, ids] );

  // Clear the comment in a timeout so it doesn't trigger a re-render of the
  // text input *after* the bottom sheet modal gets dismissed, b/c that seems
  // to re-render the bottom sheet in a presented state, making it hard to
  // actually dismiss
  const clearComment = ( ) => setTimeout( ( ) => setComment( "" ), 100 );

  const onBackdropPress = () => {
    Alert.alert(
      t( "Discard-Comment" ),
      t( "Are-you-sure-discard-comment" ),
      [{
        text: t( "Yes" ),
        onPress: () => {
          setShowCommentBox( false );
          // setComment( "" );
          Keyboard.dismiss();
          clearComment( );
        }
      }, { text: t( "No" ) }],
      {
        cancelable: false
      }
    );
  };

  // Make bottom sheet modal visibility reactive instead of imperative
  useEffect( ( ) => {
    if ( showCommentBox ) {
      bottomSheetModalRef.current?.present( );
    } else {
      bottomSheetModalRef.current?.dismiss( );
    }
  }, [showCommentBox, bottomSheetModalRef] );

  const renderHandle = () => (
    <View style={viewStyles.handleContainer} />
  );

  const renderBackdrop = () => (
    <TouchableOpacity activeOpacity={1} style={viewStyles.background} onPress={onBackdropPress}>
      <View />
    </TouchableOpacity>
  );

  const showActivityTab = ( ) => setTab( 0 );
  const showDataTab = ( ) => setTab( 1 );

  const toggleRefetch = ( ) => setRefetch( !refetch );

  useEffect( () => {
    const markViewedLocally = async ( ) => {
      if ( !localObservation ) { return; }
      realm?.write( ( ) => {
        localObservation.viewed = true;
      } );
    };

    if ( !observation?.viewed ) {
      markViewedMutation.mutate( { id: uuid } );
      markViewedLocally( );
    }
  }, [observation, localObservation, realm, markViewedMutation, uuid] );

  if ( !observation ) { return null; }

  const comments = Array.from( observation.comments );
  const photos = _.compact( Array.from( observation.observationPhotos ).map( op => op.photo ) );

  const onIDAdded = async identification => {
    // Add temporary ID to observation.identifications ("ghosted" ID, while we're trying to add it)
    const newId = {
      body: identification.body,
      taxon: identification.taxon,
      user: {
        id: userId,
        login: currentUser?.login,
        signedIn: true
      },
      created_at: formatISO( Date.now() ),
      uuid: identification.uuid,
      vision: false,
      // This tells us to render is ghosted (since it's temporarily visible
      // until getting a response from the server)
      temporary: true
    };
    setIds( [...ids, newId] );

    createIdentificationMutation.mutate( {
      identification: {
        observation_id: uuid,
        taxon_id: newId.taxon.id,
        body: newId.body
      }
    } );
  };

  const navToUserProfile = id => navigation.navigate( "UserProfile", { userId: id } );
  const navToTaxonDetails = ( ) => navigation.navigate( "TaxonDetails", { id: taxon.id } );
  const navToAddID = ( ) => {
    addObservations( [observation] );
    navigation.push( "AddID", { onIDAdded, goBackOnSave: true } );
  };
  const openCommentBox = ( ) => {
    setShowCommentBox( true );
  };
  const submitComment = async ( ) => {
    setAddingComment( true );
    clearComment( );
    setShowCommentBox( false );
    Keyboard.dismiss();
    if ( comment.length > 0 ) {
      createCommentMutation.mutate( comment );
    }
    setAddingComment( false );
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

  const renderBottomSheetTextView = () => (
    <BottomSheetTextInput
      keyboardType="default"
      style={[viewStyles.commentInput, viewStyles.commentInputText, textStyles.commentTextInput]}
      value={comment}
      selectionColor={colors.black}
      activeUnderlineColor={colors.transparent}
      placeholder={t( "Add-a-comment" )}
      autoFocus
      multiline
      onChangeText={setComment}
      render={innerProps => (
        <NativeTextInput
              /* eslint-disable react/jsx-props-no-spreading */
          {...innerProps}
          style={[
            innerProps.style,
            viewStyles.commentInputText, textStyles.commentTextInput
          ]}
        />
      )}
    />
  );

  const faveOrUnfave = async ( ) => {
    // TODO: fix fave/unfave functionality with useMutation
    if ( currentUserFaved ) {
      await unfaveObservation( { uuid } );
      setRefetch( true );
      queryClient.invalidateQueries( ["fetchRemoteObservation"] );
    } else {
      await faveObservation( { uuid } );
      setRefetch( true );
      queryClient.invalidateQueries( ["fetchRemoteObservation"] );
    }
  };

  const displayCreatedAt = ( ) => ( observation.createdAt
    ? observation.createdAt
    : formatObsListTime( observation._created_at ) );

  return (
    <BottomSheetModalProvider>
      <ScrollWithFooter testID={`ObsDetails.${uuid}`}>
        <ObsDetailsHeader observation={observation} />
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
          <Text style={textStyles.observedOn}>{displayCreatedAt( )}</Text>
        </View>
        <View style={viewStyles.photoContainer}>
          <PhotoScroll photos={photos} />
          <IconButton
            icon={currentUserFaved ? "star-outline" : "star"}
            onPress={faveOrUnfave}
            textColor={colors.white}
            labelStyle={textStyles.favText}
            style={viewStyles.favButton}
          />
        </View>
        <View style={viewStyles.row}>
          {showTaxon( )}
          <View>
            <View style={viewStyles.rowWithIcon}>
              <Image
                style={imageStyles.smallIcon}
                source={require( "images/ic_id.png" )}
              />
              <Text style={textStyles.idCommentCount}>{observation.identifications.length}</Text>
            </View>
            <View style={viewStyles.rowWithIcon}>
              <IconMaterial name="chat-bubble" size={15} color={colors.logInGray} />
              <Text style={textStyles.idCommentCount}>{observation.comments.length}</Text>
            </View>
            <QualityBadge qualityGrade={checkCamelAndSnakeCase( observation, "qualityGrade" )} />
          </View>
        </View>
        <View style={[viewStyles.rowWithIcon, viewStyles.locationContainer]}>
          <IconMaterial name="location-pin" size={15} color={colors.logInGray} />
          <Text style={textStyles.locationText}>
            {checkCamelAndSnakeCase( observation, "placeGuess" )}
          </Text>
        </View>

        <View style={viewStyles.userProfileRow}>
          <Pressable
            onPress={showActivityTab}
            accessibilityRole="button"
            style={viewStyles.tabContainer}
          >
            <TranslatedText
              style={[textStyles.tabText, tab === 0 ? textStyles.tabTextActive : null]}
              text="ACTIVITY"
            />
            { tab === 0 && <View style={viewStyles.tabContainerActive} />}
          </Pressable>
          <Pressable
            onPress={showDataTab}
            testID="ObsDetails.DataTab"
            accessibilityRole="button"
            style={viewStyles.tabContainer}
          >
            <TranslatedText
              style={[textStyles.tabText, tab === 1 ? textStyles.tabTextActive : null]}
              text="DATA"
            />
            { tab === 1 && <View style={viewStyles.tabContainerActive} />}
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
              refetchRemoteObservation={refetchRemoteObservation}
            />
          )
          : <DataTab observation={observation} />}
        {addingComment && (
        <View style={[viewStyles.row, viewStyles.centerRow]}>
          <ActivityIndicator size="large" />
        </View>
        )}
        <View style={viewStyles.row}>
          <View style={viewStyles.buttons}>
            <Button
              text={t( "Suggest-an-ID" )}
              onPress={navToAddID}
              style={viewStyles.button}
              testID="ObsDetail.cvSuggestionsButton"
            />
          </View>
          <View style={viewStyles.buttons}>
            <Button
              text={t( "Add-Comment" )}
              onPress={openCommentBox}
              style={viewStyles.button}
              testID="ObsDetail.commentButton"
              disabled={showCommentBox}
            />
          </View>
        </View>
      </ScrollWithFooter>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        enableOverDrag={false}
        enablePanDownToClose
        snapPoints={[snapPoint]}
        backdropComponent={renderBackdrop}
        handleComponent={renderHandle}
        style={viewStyles.bottomModal}
      >
        <View
          style={viewStyles.commentInputContainer}
          onLayout={( {
            nativeEvent: {
              layout: { height }
            }
          } ) => {
            setSnapPoint( height + 20 );
          }}
        >
          {renderBottomSheetTextView()}
          <TouchableOpacity
            style={viewStyles.sendComment}
            onPress={() => submitComment( )}
          >
            <IconMaterial name="send" size={35} color={colors.inatGreen} />
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

export default ObsDetails;
