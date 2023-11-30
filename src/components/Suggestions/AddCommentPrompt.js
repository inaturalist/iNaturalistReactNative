// @flow

import { useNavigation } from "@react-navigation/native";
import {
  INatIconButton,
  TextInputSheet
} from "components/SharedComponents";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { useLocalObservation, useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

type Props = {
  currentObservation: Object
}

const AddCommentPrompt = ( {
  currentObservation
}: Props ): Node => {
  const updateComment = useStore( state => state.updateComment );
  const [showAddCommentSheet, setShowAddCommentSheet] = useState( false );
  const uuid = currentObservation?.uuid;
  const localObservation = useLocalObservation( uuid );
  const wasSynced = localObservation?.wasSynced( );

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

    if ( wasSynced ) {
      navigation.setOptions( {
        headerRight: addCommentIcon
      } );
    }
  }, [navigation, t, wasSynced] );

  return showAddCommentSheet && (
    <TextInputSheet
      handleClose={( ) => setShowAddCommentSheet( false )}
      headerText={t( "ADD-OPTIONAL-COMMENT" )}
      snapPoints={[416]}
      confirm={updateComment}
    />
  );
};

export default AddCommentPrompt;
