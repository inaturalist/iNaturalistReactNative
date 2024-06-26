// @flow
import { updateRelationships } from "api/relationships";
import WarningSheet from "components/SharedComponents/Sheets/WarningSheet.tsx";
import type { Node } from "react";
import React from "react";
import { Alert } from "react-native";
import { useAuthenticatedMutation, useTranslation } from "sharedHooks";

type Props = {
    relationship: Object,
    refetchRelationship: Function,
    setShowUnfollowSheet: Function,
}

const UnfollowSheet = ( {
  relationship,
  setShowUnfollowSheet,
  refetchRelationship
}: Props ): Node => {
  const { t } = useTranslation( );

  const updateRelationshipsMutation = useAuthenticatedMutation(
    ( id, optsWithAuth ) => updateRelationships( id, optsWithAuth )
  );

  const unfollowUser = ( ) => updateRelationshipsMutation.mutate( {
    id: relationship.id,
    relationship: {
      following: false
    }
  }, {
    onSuccess: () => {
      setShowUnfollowSheet( false );
      refetchRelationship();
    },
    onError: error => {
      Alert.alert( "Error Following/Unfollowing", error );
    }
  } );

  return (
    <WarningSheet
      handleClose={( ) => setShowUnfollowSheet( false )}
      secondButtonText={t( "CANCEL" )}
      buttonType="warning"
      headerText={t( "UNFOLLOW-USER" )}
      buttonText={t( "UNFOLLOW" )}
      handleSecondButtonPress={( ) => setShowUnfollowSheet( false )}
      confirm={( ) => {
        if ( relationship ) unfollowUser();
      }}
    />
  );
};

export default UnfollowSheet;
