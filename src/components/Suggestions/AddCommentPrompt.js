// @flow

import { useNavigation } from "@react-navigation/native";
import {
  INatIconButton,
  TextInputSheet
} from "components/SharedComponents";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

const AddCommentPrompt = ( ): Node => {
  const currentObservation = useStore( state => state.currentObservation );
  const updateComment = useStore( state => state.updateComment );
  const [showAddCommentSheet, setShowAddCommentSheet] = useState( false );

  const synced = currentObservation.wasSynced !== undefined
  && currentObservation.wasSynced( );

  const { t } = useTranslation( );
  const navigation = useNavigation( );

  useEffect( ( ) => {
    const addCommentIcon = ( ) => (
      <INatIconButton
        icon="edit-comment"
        onPress={( ) => setShowAddCommentSheet( true )}
        accessibilityLabel={t( "Add-comment" )}
        size={25}
      />
    );

    if ( synced ) {
      navigation.setOptions( {
        headerRight: addCommentIcon
      } );
    }
  }, [navigation, t, synced] );

  return showAddCommentSheet && (
    <TextInputSheet
      handleClose={( ) => setShowAddCommentSheet( false )}
      headerText={t( "ADD-OPTIONAL-COMMENT" )}
      confirm={updateComment}
    />
  );
};

export default AddCommentPrompt;
