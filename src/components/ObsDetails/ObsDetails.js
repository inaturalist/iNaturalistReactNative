// @flow
import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { createComment } from "api/comments";
import createIdentification from "api/identifications";
import {
  faveObservation,
  fetchRemoteObservation,
  markObservationUpdatesViewed,
  unfaveObservation
} from "api/observations";
import ObsStatus from "components/MyObservations/ObsStatus";
import ActivityHeader from "components/ObsDetails/ActivityHeader";
import {
  Button, DisplayTaxonName, ObservationLocation, PhotoCount, Tabs
} from "components/SharedComponents";
import HideView from "components/SharedComponents/HideView";
import PhotoScroll from "components/SharedComponents/PhotoScroll";
import ScrollViewWrapper from "components/SharedComponents/ScrollViewWrapper";
import {
  Image, Pressable, Text, View
} from "components/styledComponents";
import { formatISO } from "date-fns";
import _ from "lodash";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback, useEffect, useMemo, useState
} from "react";
import { Alert, LogBox } from "react-native";
import {
  ActivityIndicator,
  Button as IconButton
} from "react-native-paper";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import Observation from "realmModels/Observation";
import Taxon from "realmModels/Taxon";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useIsConnected from "sharedHooks/useIsConnected";
import useLocalObservation from "sharedHooks/useLocalObservation";
import useObservationsUpdates,
{ fetchObservationUpdatesKey } from "sharedHooks/useObservationsUpdates";
import useTranslation from "sharedHooks/useTranslation";
import { getShadowStyle } from "styles/global";
import colors from "styles/tailwindColors";

import ActivityTab from "./ActivityTab";
import AddCommentModal from "./AddCommentModal";
import DetailsTab from "./DetailsTab";

const { useRealm } = RealmContext;

// this is getting triggered by passing dates, like _created_at, through
// react navigation via the observation object. it doesn't seem to
// actually be breaking anything, for the moment (May 2, 2022)
LogBox.ignoreLogs( [
  "Non-serializable values were found in the navigation state"
] );

const ACTIVITY_TAB_ID = "ACTIVITY";
const DETAILS_TAB_ID = "DETAILS";

const ObsDetails = (): Node => {
  const isOnline = useIsConnected();
  const currentUser = useCurrentUser();
  const [ids, setIds] = useState<Array<Object>>( [] );
  const userId = currentUser?.id;
  const [refetch, setRefetch] = useState( false );
  const { params } = useRoute();
  const { uuid } = params;
  const [currentTabId, setCurrentTabId] = useState( ACTIVITY_TAB_ID );
  const navigation = useNavigation();
  const realm = useRealm();
  const localObservation = useLocalObservation( uuid );
  const [showCommentBox, setShowCommentBox] = useState( false );
  const [addingComment, setAddingComment] = useState( false );
  const [comments, setComments] = useState( [] );

  const queryClient = useQueryClient();

  const { t } = useTranslation();

  const remoteObservationParams = {
    fields: Observation.FIELDS
  };

  const { data: remoteObservation, refetch: refetchRemoteObservation }
  = useAuthenticatedQuery(
    ["fetchRemoteObservation", uuid],
    optsWithAuth => fetchRemoteObservation( uuid, remoteObservationParams, optsWithAuth )
  );

  const observation = localObservation || remoteObservation;

  const markViewedLocally = async () => {
    if ( !localObservation ) { return; }
    realm?.write( () => {
      // Flags if all comments and identifications have been viewed
      localObservation.comments_viewed = true;
      localObservation.identifications_viewed = true;
    } );
  };

  const { refetch: refetchObservationUpdates } = useObservationsUpdates(
    !!currentUser && !!observation
  );

  const markViewedMutation = useAuthenticatedMutation(
    ( viewedParams, optsWithAuth ) => markObservationUpdatesViewed( viewedParams, optsWithAuth ),
    {
      onSuccess: () => {
        markViewedLocally();
        queryClient.invalidateQueries( ["fetchRemoteObservation", uuid] );
        queryClient.invalidateQueries( [fetchObservationUpdatesKey] );
        refetchRemoteObservation();
        refetchObservationUpdates();
      }
    }
  );

  const taxon = observation?.taxon;
  const faves = observation?.faves;
  const observationPhotos = observation?.observationPhotos || observation?.observation_photos;
  const currentUserFaved = () => {
    if ( faves?.length > 0 ) {
      const userFaved = faves.find( fave => fave.user_id === userId );
      return userFaved === true;
    }
    return null;
  };
  const [userFav, setUserFav] = useState( currentUserFaved() );

  const createUnfaveMutation = useAuthenticatedMutation(
    ( faveOrUnfaveParams, optsWithAuth ) => unfaveObservation( faveOrUnfaveParams, optsWithAuth ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries( ["fetchRemoteObservation"] );
        refetchRemoteObservation();
        refetchObservationUpdates();
        setUserFav( false );
      },
      onError: () => {
      }
    }
  );

  const createFaveMutation = useAuthenticatedMutation(
    ( faveOrUnfaveParams, optsWithAuth ) => faveObservation( faveOrUnfaveParams, optsWithAuth ),
    {
      onSuccess: () => {
        setRefetch( true );
        queryClient.invalidateQueries( ["fetchRemoteObservation"] );
        refetchRemoteObservation();
        refetchObservationUpdates();
        setUserFav( true );
      },
      onError: () => {
      }
    }
  );

  const faveOrUnfave = async () => {
    // TODO: figure out why ObsDetails doesnt update with changes after refetch
    // maybe similar to how comments work(?)
    if ( currentUserFaved() ) {
      createUnfaveMutation.mutate( { uuid } );
    } else {
      createFaveMutation.mutate( { uuid } );
    }
  };

  const showErrorAlert = error => Alert.alert( "Error", error, [{ text: t( "OK" ) }], {
    cancelable: true
  } );

  const toggleRefetch = () => setRefetch( !refetch );
  const openCommentBox = () => setShowCommentBox( true );
  const createCommentMutation = useAuthenticatedMutation(
    ( commentParams, optsWithAuth ) => createComment( commentParams, optsWithAuth ),
    {
      onSuccess: data => {
        setComments( [...comments, data[0]] );
      },
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
      onSettled: () => setAddingComment( false )
    }
  );
  const onCommentAdded = async commentBody => {
    createCommentMutation.mutate( {
      comment: {
        body: commentBody,
        parent_id: uuid,
        parent_type: "Observation"
      }
    } );
  };

  const createIdentificationMutation = useAuthenticatedMutation(
    ( idParams, optsWithAuth ) => createIdentification( idParams, optsWithAuth ),
    {
      onSuccess: data => setIds( [...ids, data[0]] ),
      onError: e => {
        let error = null;
        if ( e ) {
          error = t( "Couldnt-create-identification-error", { error: e.message } );
        } else {
          error = t( "Couldnt-create-identification-unknown-error" );
        }

        // Remove temporary ID and show error
        setIds( [...ids] );
        showErrorAlert( error );
      }
    }
  );

  // reload if change to observation
  useEffect( () => {
    if ( localObservation && remoteObservation ) {
      const remoteUpdatedAt = new Date( remoteObservation?.updated_at );
      if ( remoteUpdatedAt > localObservation?.updated_at ) {
        Observation.upsertRemoteObservations( [remoteObservation], realm );
      }
    }
  }, [localObservation, remoteObservation, realm] );

  useEffect( () => {
    if (
      localObservation
      && localObservation.unviewed()
      && !markViewedMutation.isLoading
    ) {
      markViewedMutation.mutate( { id: uuid } );
    }
  }, [localObservation, markViewedMutation, uuid] );

  const navToObsEdit = useCallback(
    ( ) => navigation.navigate( "ObsEdit", { uuid: observation?.uuid } ),
    [navigation, observation]
  );

  useEffect( () => {
    // set initial comments for activity currentTabId
    const currentComments = observation?.comments;
    if (
      currentComments
      && comments.length === 0
      && currentComments.length !== comments.length
    ) {
      setComments( currentComments );
    }
  }, [observation, comments] );

  const editButton = useMemo( ( ) => (
    <IconButton
      testID="ObsDetail.editButton"
      onPress={navToObsEdit}
      icon="pencil"
      textColor={colors.white}
      className="absolute top-3 right-3"
      accessible
      accessibilityRole="button"
      accessibilityLabel={t( "edit" )}
    />
  ), [navToObsEdit, t] );

  if ( !observation ) {
    return null;
  }

  const photos = _.compact( Array.from( observationPhotos ).map( op => op.photo ) );

  const navToTaxonDetails = () => navigation.navigate( "TaxonDetails", { id: taxon.id } );

  const showTaxon = () => {
    if ( !taxon ) {
      return <Text>{t( "Unknown-organism" )}</Text>;
    }
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
          <DisplayTaxonName taxon={taxon} layout="vertical" />
        </Pressable>
      </View>
    );
  };

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

  const navToAddID = ( ) => {
    navigation.navigate( "AddID", { onIDAdded, goBackOnSave: true } );
  };

  const tabs = [
    {
      id: ACTIVITY_TAB_ID,
      testID: "ObsDetails.ActivityTab",
      onPress: () => setCurrentTabId( ACTIVITY_TAB_ID ),
      text: t( "ACTIVITY" )
    },
    {
      id: DETAILS_TAB_ID,
      testID: "ObsDetails.DetailsTab",
      onPress: () => setCurrentTabId( DETAILS_TAB_ID ),
      text: t( "DETAILS" )
    }
  ];

  const displayPhoto = () => {
    if ( !isOnline ) {
      // TODO show photos that are available offline
      return (
        <View className="bg-black flex-row justify-center">
          <IconMaterial
            name="wifi-off"
            color={colors.white}
            size={100}
            accessibilityRole="image"
            accessibilityLabel={t(
              "Observation-photos-unavailable-without-internet"
            )}
          />
        </View>
      );
    }
    if ( photos.length > 0 || observation?.observationSounds?.length > 0 ) {
      return (
        <View className="bg-black">
          <PhotoScroll photos={photos} />
          {/* TODO: a11y props are not passed down into this 3.party */}
          { editButton }
          {userFav
            ? (
              <IconButton
                icon="star"
                size={25}
                onPress={() => faveOrUnfave()}
                textColor={colors.white}
                className="absolute bottom-3 right-3"
                accessible
                accessibilityRole="button"
                accessibilityLabel={t( "favorite" )}
              />
            )
            : (
              <IconButton
                icon="star-bold-outline"
                size={25}
                onPress={() => faveOrUnfave()}
                textColor={colors.white}
                className="absolute bottom-3 right-3"
                accessible
                accessibilityRole="button"
                accessibilityLabel={t( "favorite" )}
              />
            )}
          <View className="absolute bottom-3 left-3">
            <PhotoCount count={photos.length
              ? photos.length
              : 0}
            />
          </View>
        </View>
      );
    }
    return (
      <View
        className="bg-black flex-row justify-center"
        accessible
        accessibilityLabel={t( "Observation-has-no-photos-and-no-sounds" )}
      >
        { editButton }
        <IconMaterial
          color={colors.white}
          testID="ObsDetails.noImage"
          name="image-not-supported"
          size={100}
        />
      </View>
    );
  };

  return (
    <>
      <ScrollViewWrapper testID={`ObsDetails.${uuid}`}>
        {/*
            TODO: react-navigation supports a lot of styling options including
            a transparent header, so this custom header probably is not
            necessary ~~~kueda

            Tried using transparent react-navigation header but had issues where the header
            blocked the Edit button and the header would follow scroll
          */}
        {displayPhoto()}
        <View className="absolute top-3 left-3">
          <HeaderBackButton
            tintColor={colors.white}
            onPress={( ) => navigation.goBack( )}
          />
        </View>

        <ActivityHeader item={observation} classNameMargin="mx-[15px] mt-[13px]" />
        <View className="flex-row my-[11px] justify-between mx-3">
          {showTaxon()}
          <ObsStatus layout="vertical" observation={observation} />
        </View>
        <ObservationLocation observation={observation} classNameMargin="ml-3 mb-2" />
        <Tabs tabs={tabs} activeId={currentTabId} />
        <HideView show={currentTabId === ACTIVITY_TAB_ID}>
          <ActivityTab
            observation={observation}
            uuid={uuid}
            comments={comments}
            navToTaxonDetails={navToTaxonDetails}
            toggleRefetch={toggleRefetch}
            refetchRemoteObservation={refetchRemoteObservation}
          />
        </HideView>
        <HideView noInitialRender show={currentTabId === DETAILS_TAB_ID}>
          <DetailsTab observation={observation} uuid={uuid} />
        </HideView>
        {addingComment && (
          <View className="flex-row items-center justify-center">
            <ActivityIndicator size="large" />
          </View>
        )}
      </ScrollViewWrapper>
      { ( currentTabId === ACTIVITY_TAB_ID )
      && (
        <View
          className="flex-row justify-evenly bottom-[80px] bg-white py-3"
          style={getShadowStyle( {
            shadowColor: colors.black,
            offsetWidth: 0,
            offsetHeight: -3,
            shadowOpacity: 0.2,
            shadowRadius: 2,
            radius: 5,
            elevation: 5
          } )}
        >
          <Button
            text={t( "COMMENT" )}
            onPress={openCommentBox}
            className="mx-3 grow"
            testID="ObsDetail.commentButton"
            disabled={showCommentBox}
            accessibilityHint={t( "Opens-add-comment-modal" )}
          />
          <Button
            text={t( "SUGGEST-ID" )}
            onPress={navToAddID}
            className="mx-3 grow"
            testID="ObsDetail.cvSuggestionsButton"
            accessibilityRole="link"
            accessibilityHint={t( "Navigates-to-suggest-identification" )}
          />
        </View>
      ) }
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
