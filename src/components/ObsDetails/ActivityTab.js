// @flow
import createIdentification from "api/identifications";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import * as React from "react";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";
import useCurrentUser from "sharedHooks/useCurrentUser";

import ActivityItem from "./ActivityItem";

type Props = {
  observation:Object,
  comments:Array<Object>,
  navToTaxonDetails: Function,
  toggleRefetch: Function,
  refetchRemoteObservation: Function,
  uuid: string
}

const ActivityTab = ( {
  observation, comments, navToTaxonDetails,
  toggleRefetch, refetchRemoteObservation, uuid
}: Props ): React.Node => {
  const currentUser = useCurrentUser( );
  const userId = currentUser?.id;
  const [ids, setIds] = useState<Array<Object>>( [] );

  const onAgreeErrorAlert = ( ) => {
    Alert.alert(
      "Cannot agree with ID at this time"
    );
  };

  const createIdentificationMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => createIdentification( params, optsWithAuth ),
    {
      onSuccess: data => {
        // TODO
        // reload activity list to update suggest id icon
        console.log( "data", data );
        if ( refetchRemoteObservation ) {
          refetchRemoteObservation( );
        }
      },
      onError: () => {
        onAgreeErrorAlert();
      }
    }
  );

  const onAgree = agreeParams => {
    createIdentificationMutation.mutate( { identification: agreeParams } );
  };

  const findUserAgreedToID = () => {
    const currentIds = observation?.identifications;
    const userAgree = currentIds.filter( id => id.user.id === userId );
    return userAgree
      ? userAgree[userAgree.length - 1].taxon.id
      : undefined;
  };

  const userAgreedToId = findUserAgreedToID();

  useEffect( ( ) => {
    // set initial ids for activity tab
    const currentIds = observation?.identifications;
    if ( currentIds
        && ids.length === 0
        && currentIds.length !== ids.length ) {
      setIds( currentIds );
    }
  }, [observation, ids] );

  if ( comments.length === 0 && ids.length === 0 ) {
    return <Text>{t( "No-comments-or-ids-to-display" )}</Text>;
  }

  const activityItems = ids.concat( [...comments] )
    .sort( ( a, b ) => ( new Date( a.created_at ) - new Date( b.created_at ) ) );

  // this should all perform similarly to the activity tab on web
  // https://github.com/inaturalist/inaturalist/blob/df6572008f60845b8ef5972a92a9afbde6f67829/app/webpack/observations/show/components/activity_item.jsx
  const activitytemsList = activityItems.map( item => (
    <ActivityItem
      userAgreedId={userAgreedToId}
      key={item.uuid}
      observationUUID={uuid}
      item={item}
      navToTaxonDetails={navToTaxonDetails}
      toggleRefetch={toggleRefetch}
      refetchRemoteObservation={refetchRemoteObservation}
      onAgree={onAgree}
      currentUserId={userId}
    />
  ) );

  return (
    <View testID="ActivityTab">
      {activitytemsList}
    </View>
  );
};

export default ActivityTab;
