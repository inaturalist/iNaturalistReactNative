// @flow
import { useNavigation } from "@react-navigation/native";
import { createComment } from "api/comments";
import createIdentification from "api/identifications";
import Button from "components/SharedComponents/Buttons/Button";
import { Text, View } from "components/styledComponents";
import { formatISO } from "date-fns";
import { t } from "i18next";
import * as React from "react";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import createUUID from "react-native-uuid";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";
import useCurrentUser from "sharedHooks/useCurrentUser";

import ActivityItem from "./ActivityItem";
import AddCommentModal from "./AddCommentModal";

type Props = {
  uuid:string,
  observation:Object,
  navToTaxonDetails: Function,
  navToUserProfile: number => { },
  toggleRefetch: Function,
  refetchRemoteObservation: Function
}

const ActivityTab = ( {
  uuid, observation, navToTaxonDetails, navToUserProfile, toggleRefetch, refetchRemoteObservation
}: Props ): React.Node => {
  // ????? maybe get current user from props of obsdetails insead ??????
  const currentUser = useCurrentUser( );
  const userId = currentUser?.id;
  const [addingComment, setAddingComment] = useState( false );
  const [showCommentBox, setShowCommentBox] = useState( false );
  const [ids, setIds] = useState<Array<Object>>( [] );
  const [comments, setComments] = useState<Array<Object>>( [] );
  const navigation = useNavigation( );

  const showErrorAlert = error => Alert.alert(
    "Error",
    error,
    [{ text: t( "OK" ) }],
    {
      cancelable: true
    }
  );

  const createIdentificationMutation = useAuthenticatedMutation(
    ( idParams, optsWithAuth ) => createIdentification( idParams, optsWithAuth ),
    {
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
        showErrorAlert( error );
      }
    }
  );

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

  useEffect( ( ) => {
    // set initial ids for activity tab
    const currentIds = observation?.identifications;
    if ( currentIds
        && ids.length === 0
        && currentIds.length !== ids.length ) {
      setIds( currentIds );
    }
  }, [observation, ids] );

  useEffect( ( ) => {
    // set initial comments for activity tab
    const currentComments = observation?.comments;
    if ( currentComments
        && comments.length === 0
        && currentComments.length !== comments.length ) {
      setComments( currentComments );
    }
  }, [observation, comments] );

  if ( comments.length === 0 && ids.length === 0 ) {
    return <Text>{t( "No-comments-or-ids-to-display" )}</Text>;
  }

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
    navigation.push( "AddID", { onIDAdded, goBackOnSave: true } );
  };
  const openCommentBox = ( ) => setShowCommentBox( true );

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

  const activityItems = ids.concat( [...comments] )
    .sort( ( a, b ) => ( new Date( a.created_at ) - new Date( b.created_at ) ) );

  const activitytemsList = activityItems.map( item => {
    const handlePress = ( ) => navToUserProfile( item?.user?.id );
    // this should all perform similarly to the activity tab on web
    // https://github.com/inaturalist/inaturalist/blob/df6572008f60845b8ef5972a92a9afbde6f67829/app/webpack/observations/show/components/activity_item.jsx
    return (
      <ActivityItem
        key={item.uuid}
        item={item}
        handlePress={handlePress}
        navToTaxonDetails={navToTaxonDetails}
        toggleRefetch={toggleRefetch}
        refetchRemoteObservation={refetchRemoteObservation}
      />
    );
  } );

  return (
    <View>
      {activitytemsList}
      {addingComment && (
      <View className="flex-row items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
      )}
      <View className="flex-row my-10 justify-evenly">
        <Button
          text={t( "Suggest-an-ID" )}
          onPress={navToAddID}
          className="mx-3"
          testID="ObsDetail.cvSuggestionsButton"
        />
        <Button
          text={t( "Add-Comment" )}
          onPress={openCommentBox}
          className="mx-3"
          testID="ObsDetail.commentButton"
          disabled={showCommentBox}
        />
      </View>
      <AddCommentModal
        onCommentAdded={onCommentAdded}
        showCommentBox={showCommentBox}
        setShowCommentBox={setShowCommentBox}
        setAddingComment={setAddingComment}
      />
    </View>
  );
};

export default ActivityTab;
