// @flow

import { useNavigation } from "@react-navigation/native";
import {
  INatIconButton,
  TextInputSheet
} from "components/SharedComponents";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { useLocalObservation, useTranslation } from "sharedHooks";

type Props = {
  setComment: Function,
  currentObservation: Object
}

const AddCommentPrompt = ( {
  setComment,
  currentObservation
}: Props ): Node => {
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
      confirm={textInput => setComment( textInput )}
    />
  );
};

export default AddCommentPrompt;
