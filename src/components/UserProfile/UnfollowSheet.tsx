import { updateRelationships } from "api/relationships";
import type { ApiRelationship } from "api/types";
import WarningSheet from "components/SharedComponents/Sheets/WarningSheet";
import React from "react";
import { Alert } from "react-native";
import { useAuthenticatedMutation, useTranslation } from "sharedHooks";
import useInvalidateUserLists from "sharedHooks/useInvalidateUserLists";

interface Props {
  relationship?: ApiRelationship;
  refetchRelationship: ( ) => void;
  setShowUnfollowSheet: ( show: boolean ) => void;
}

const UnfollowSheet = ( {
  relationship,
  setShowUnfollowSheet,
  refetchRelationship,
}: Props ) => {
  const { t } = useTranslation( );
  const invalidateUserLists = useInvalidateUserLists( );

  const { mutate: updateRelationshipsMutate } = useAuthenticatedMutation(
    ( params, optsWithAuth ) => updateRelationships( params, optsWithAuth ),
    {
      onSuccess: () => {
        setShowUnfollowSheet( false );
        refetchRelationship();
        invalidateUserLists();
      },
      onError: error => {
        Alert.alert( "Error Following/Unfollowing", error );
      },
    },
  );

  return (
    <WarningSheet
      onPressClose={( ) => setShowUnfollowSheet( false )}
      secondButtonText={t( "CANCEL" )}
      buttonType="warning"
      headerText={t( "UNFOLLOW-USER" )}
      buttonText={t( "UNFOLLOW" )}
      handleSecondButtonPress={( ) => setShowUnfollowSheet( false )}
      confirm={( ) => {
        if ( relationship ) {
          updateRelationshipsMutate( {
            id: relationship.id,
            relationship: {
              following: false,
            },
          } );
        }
      }}
    />
  );
};

export default UnfollowSheet;
