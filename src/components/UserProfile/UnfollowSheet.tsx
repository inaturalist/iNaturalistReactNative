import { updateRelationships } from "api/relationships";
import WarningSheet from "components/SharedComponents/Sheets/WarningSheet";
import React from "react";
import { Alert } from "react-native";
import { useAuthenticatedMutation, useTranslation } from "sharedHooks";

interface Props {
  relationship: {
    id: number;
  };
  refetchRelationship: () => void;
  setShowUnfollowSheet: ( show: boolean ) => void;
}

const UnfollowSheet = ( {
  relationship,
  setShowUnfollowSheet,
  refetchRelationship,
}: Props ) => {
  const { t } = useTranslation( );

  const { mutate: updateRelationshipsMutate } = useAuthenticatedMutation(
    ( id, optsWithAuth ) => updateRelationships( id, optsWithAuth ),
    {
      onSuccess: () => {
        setShowUnfollowSheet( false );
        refetchRelationship();
      },
      onError: error => {
        Alert.alert( "Error Following/Unfollowing", error );
      },
    },
  );

  const unfollowUser = ( ) => updateRelationshipsMutate( {
    id: relationship.id,
    relationship: {
      following: false,
    },
  } );

  return (
    <WarningSheet
      onPressClose={( ) => setShowUnfollowSheet( false )}
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
