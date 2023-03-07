// @flow
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { createComment } from "api/comments";
import {
  faveObservation, fetchRemoteObservation, markObservationUpdatesViewed, unfaveObservation
} from "api/observations";
import DisplayTaxonName from "components/DisplayTaxonName";
import ObsStatus from "components/MyObservations/ObsStatus";
import ActivityHeader from "components/ObsDetails/ActivityHeader";
import {
  Tabs
} from "components/SharedComponents";
import HideView from "components/SharedComponents/HideView";
import PhotoScroll from "components/SharedComponents/PhotoScroll";
import ScrollWithFooter from "components/SharedComponents/ScrollWithFooter";
import {
  Image, Pressable, Text, View
} from "components/styledComponents";
import { formatISO } from "date-fns";
import _ from "lodash";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useEffect,
  useState
} from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  LogBox
} from "react-native";
import { ActivityIndicator, Button as IconButton, useTheme } from "react-native-paper";
import createUUID from "react-native-uuid";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import Observation from "realmModels/Observation";
import Taxon from "realmModels/Taxon";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useIsConnected from "sharedHooks/useIsConnected";
import useLocalObservation from "sharedHooks/useLocalObservation";
import colors from "styles/tailwindColors";

import ActivityTab from "./ActivityTab";
import AddCommentModal from "./AddCommentModal";
import DataTab from "./DataTab";
import checkCamelAndSnakeCase from "./helpers/checkCamelAndSnakeCase";

const { useRealm } = RealmContext;

// this is getting triggered by passing dates, like _created_at, through
// react navigation via the observation object. it doesn't seem to
// actually be breaking anything, for the moment (May 2, 2022)
LogBox.ignoreLogs( [
  "Non-serializable values were found in the navigation state"
] );

const ACTIVITY_TAB_ID = "ACTIVITY";
const DATA_TAB_ID = "DATA";

const ObsDetails = ( ): Node => {
  const isOnline = useIsConnected( );
  const currentUser = useCurrentUser( );
  const userId = currentUser?.id;
  const [refetch, setRefetch] = useState( false );
  const { params } = useRoute( );
  const { uuid } = params;
  const [currentTabId, setCurrentTabId] = useState( ACTIVITY_TAB_ID );
  const navigation = useNavigation( );
  const realm = useRealm( );
  const localObservation = useLocalObservation( uuid );
  const [showCommentBox, setShowCommentBox] = useState( false );
  const [addingComment, setAddingComment] = useState( false );
  const [comments, setComments] = useState( [] );
  const theme = useTheme();

  const queryClient = useQueryClient( );

  const { t } = useTranslation( );

  const remoteObservationParams = {
    fields: Observation.FIELDS
  };

  const {
    data: remoteObservation,
    refetch: refetchRemoteObservation
  } = useAuthenticatedQuery(
    ["fetchRemoteObservation", uuid],
    optsWithAuth => fetchRemoteObservation( uuid, remoteObservationParams, optsWithAuth )
  );

  const observation = localObservation || remoteObservation;

  const markViewedLocally = async ( ) => {
    realm?.write( ( ) => {
      localObservation.viewed = true;
    } );
  };

  const markViewedMutation = useAuthenticatedMutation(
    ( viewedParams, optsWithAuth ) => markObservationUpdatesViewed( viewedParams, optsWithAuth ),
    {
      onSuccess: ( ) => {
        markViewedLocally( );
        queryClient.invalidateQueries( ["fetchRemoteObservation", uuid] );
        refetchRemoteObservation( );
      }
    }
  );

  const taxon = observation?.taxon;
  const faves = observation?.faves;
  const observationPhotos = observation?.observationPhotos || observation?.observation_photos;
  const currentUserFaved = faves?.length > 0 ? faves.find( fave => fave.user.id === userId ) : null;

  const showErrorAlert = error => Alert.alert(
    "Error",
    error,
    [{ text: t( "OK" ) }],
    {
      cancelable: true
    }
  );

  const toggleRefetch = ( ) => setRefetch( !refetch );
  const openCommentBox = ( ) => setShowCommentBox( true );
  const createCommentMutation = useAuthenticatedMutation(
    ( commentParams, optsWithAuth ) => createComment( commentParams, optsWithAuth ),
    {
      onSuccess: data => setComments( [...comments, data[0]] ),
      onError: e => {
        let error = null;
        if ( e ) {
          error = t( "Couldnt-create-comment", { error: e.message } );
        } else {
          error = t( "Couldnt-create-comment", { error: t( "Unknown-error" ) } );
        }

        // Remove temporary comment and show error
        setComments( [...comments] );
        showErrorAlert( error );
      },
      onSettled: ( ) => setAddingComment( false )
    }
  );
  const onCommentAdded = async commentBody => {
    // Add temporary comment to observation.comments ("ghosted" comment,
    // while we're trying to add it)
    const newComment = {
      body: commentBody,
      user: {
        id: userId,
        login: currentUser?.login,
        signedIn: true
      },
      created_at: formatISO( Date.now() ),
      uuid: createUUID.v4( ),
      // This tells us to render is ghosted (since it's temporarily visible
      // until getting a response from the server)
      temporary: true
    };
    setComments( [...comments, newComment] );

    createCommentMutation.mutate( {
      comment: {
        body: commentBody,
        parent_id: uuid,
        parent_type: "Observation"
      }
    } );
  };

  // reload if change to observation
  useEffect( () => {
    if ( localObservation && remoteObservation ) {
      const remoteUpdatedAt = new Date( remoteObservation?.updated_at );
      if ( remoteUpdatedAt > localObservation?.updated_at ) {
        Observation.upsertRemoteObservations( [remoteObservation], realm );
      }
    }
  }, [localObservation, remoteObservation, realm] );

  useEffect( ( ) => {
    if ( localObservation && !localObservation.viewed && !markViewedMutation.isLoading ) {
      markViewedMutation.mutate( { id: uuid } );
    }
  }, [localObservation, markViewedMutation, uuid] );

  useEffect( ( ) => {
    const obsCreatedLocally = observation?.id === null;
    const obsOwnedByCurrentUser = observation?.user?.id === currentUser?.id;

    const navToObsEdit = ( ) => navigation.navigate( "ObsEdit", { uuid: observation?.uuid } );
    const editIcon = ( ) => ( obsCreatedLocally || obsOwnedByCurrentUser )
    && (
      <IconButton
        icon="pencil"
        onPress={navToObsEdit}
        textColor={theme.colors.primary}
        accessibilityLabel={t( "Navigate-to-edit-observation" )}
      />
    );

    navigation.setOptions( {
      headerRight: editIcon
    } );
  }, [navigation, observation, currentUser, t, theme] );

  useEffect( ( ) => {
    // set initial comments for activity currentTabId
    const currentComments = observation?.comments;
    if ( currentComments
        && comments.length === 0
        && currentComments.length !== comments.length ) {
      setComments( currentComments );
    }
  }, [observation, comments] );

  if ( !observation ) { return null; }

  const photos = _.compact( Array.from( observationPhotos ).map( op => op.photo ) );

  const navToTaxonDetails = ( ) => navigation.navigate( "TaxonDetails", { id: taxon.id } );

  const showTaxon = ( ) => {
    if ( !taxon ) { return <Text>{t( "Unknown-organism" )}</Text>; }
    return (
      <View className="flex-row">
        <Image
          source={Taxon.uri( taxon )}
          className="w-16 h-16 rounded-xl mr-3"
          accessibilityIgnoresInvertColors
        />
        <Pressable
          className="justify-center"
          onPress={navToTaxonDetails}
          testID={`ObsDetails.taxon.${taxon.id}`}
          accessibilityRole="link"
          accessibilityLabel={t( "Navigate-to-taxon-details" )}
          accessibilityValue={{ text: taxon.name }}
        >
          <DisplayTaxonName
            taxon={taxon}
            layout="vertical"
          />
        </Pressable>
      </View>
    );
  };

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

  const tabs = [
    {
      id: ACTIVITY_TAB_ID,
      testID: "ObsDetails.ActivityTab",
      onPress: ( ) => setCurrentTabId( ACTIVITY_TAB_ID ),
      text: t( "ACTIVITY" )
    },
    {
      id: DATA_TAB_ID,
      testID: "ObsDetails.DataTab",
      onPress: ( ) => setCurrentTabId( DATA_TAB_ID ),
      text: t( "DATA" )
    }
  ];

  const displayPhoto = ( ) => {
    if ( !isOnline ) {
      // TODO show photos that are available offline
      return (
        <View className="bg-white flex-row justify-center">
          <IconMaterial
            name="wifi-off"
            size={100}
            accessibilityRole="image"
            accessibilityLabel={t( "Observation-photos-unavailable-without-internet" )}
          />
        </View>
      );
    }
    if ( photos.length > 0 || observation?.observationSounds?.length > 0 ) {
      return (
        <View className="bg-black">
          <PhotoScroll photos={photos} />
          {/* TODO: a11y props are not passed down into this 3.party */}
          <IconButton
            icon={currentUserFaved ? "star-outline" : "pencil"}
            onPress={faveOrUnfave}
            textColor={colors.white}
            className="absolute top-3 right-0"
            accessible
            accessibilityRole="button"
            accessibilityLabel={
              currentUserFaved
                ? t( "Fave-button-label-unfave" )
                : t( "Fave-button-label-fave" )
            }
          />
        </View>
      );
    }
    return (
      <View
        className="bg-white flex-row justify-center"
        accessible
        accessibilityLabel={t( "Observation-has-no-photos-and-no-sounds" )}
      >
        <IconMaterial
          testID="ObsDetails.noImage"
          name="image-not-supported"
          size={100}
        />
      </View>
    );
  };

  return (
    <>
      <ScrollWithFooter testID={`ObsDetails.${uuid}`}>
        <ActivityHeader item={observation} />
        {displayPhoto()}
        <View className="flex-row my-5 justify-between mx-3">
          {showTaxon()}
          <ObsStatus
            layout="vertical"
            observation={observation}
          />
        </View>
        <View
          className="flex-row ml-3"
          accessible
          accessibilityLabel={t( "Location" )}
          accessibilityValue={{
            text: checkCamelAndSnakeCase( observation, "placeGuess" )
          }}
        >
          <IconMaterial
            name="location-pin"
            size={15}
            color={theme.colors.primary}
          />
          <Text className="color-darkGray ml-2">
            {checkCamelAndSnakeCase( observation, "placeGuess" )}
          </Text>
        </View>
        <Tabs tabs={tabs} activeId={currentTabId} />
        <HideView show={currentTabId === ACTIVITY_TAB_ID}>
          <ActivityTab
            uuid={uuid}
            observation={observation}
            comments={comments}
            navToTaxonDetails={navToTaxonDetails}
            toggleRefetch={toggleRefetch}
            refetchRemoteObservation={refetchRemoteObservation}
            openCommentBox={openCommentBox}
            showCommentBox={showCommentBox}
          />
        </HideView>
        <HideView noInitialRender show={currentTabId === DATA_TAB_ID}>
          <DataTab observation={observation} />
        </HideView>
        {addingComment && (
          <View className="flex-row items-center justify-center">
            <ActivityIndicator size="large" />
          </View>
        )}
      </ScrollWithFooter>
      <AddCommentModal
        //  potential to move this modal to ActivityTab and have it handle comments
        //  and ids but there were issues with presenting the modal in a scrollview.
        onCommentAdded={onCommentAdded}
        showCommentBox={showCommentBox}
        setShowCommentBox={setShowCommentBox}
        setAddingComment={setAddingComment}
      />
    </>
  );
};

export default ObsDetails;
