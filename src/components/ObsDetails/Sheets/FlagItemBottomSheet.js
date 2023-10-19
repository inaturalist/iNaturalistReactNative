// @flow
import createFlag from "api/flags";
import {
  RadioButtonSheet,
  TextInputSheet
} from "components/SharedComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";
import {
  Alert
} from "react-native";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";

type Props = {
  id:number,
  itemType:string,
  onItemFlagged: Function,
  handleClose: Function
}

const FlagItemBottomSheet = ( {
  id, itemType, onItemFlagged, handleClose
}: Props ): Node => {
  const [showExplainBox, setShowExplainBox] = useState( false );

  const radioValues = {
    spam: {
      label: t( "Spam" ),
      text: t( "Spam-Examples" ),
      value: "spam"
    },
    offensive: {
      label: t( "Offensive-Inappropriate" ),
      text: t( "Offensive-Inappropriate-Examples" ),
      value: "inappropriate"
    },
    other: {
      label: t( "Other" ),
      text: t( "Flag-Item-Other-Description" ),
      value: "other"
    }
  };

  const showErrorAlert = error => Alert.alert(
    "Error",
    error,
    [{ text: t( "OK" ) }],
    {
      cancelable: true
    }
  );

  // const resetFlagModal = () => {
  //   setCheckBoxValue( "none" );
  //   setExplanation( "" );
  //   closeFlagItemModal();
  //   setLoading( false );
  // };

  const createFlagMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => createFlag( params, optsWithAuth ),
    {
      onSuccess: data => {
        // resetFlagModal();
        onItemFlagged( data );
      },
      onError: error => {
        showErrorAlert( error );
      }
    }
  );

  const submitFlag = ( checkBoxValue, explanation = "" ) => {
    if ( checkBoxValue !== "none" ) {
      let params = {
        flag: {
          flaggable_type: itemType,
          flaggable_id: id,
          flag: checkBoxValue

        }
      };
      if ( checkBoxValue === "other" ) {
        params = { ...params, flag_explanation: explanation };
      }
      createFlagMutation.mutate( params );
    }
  };

  const openCommentBox = () => {
    setShowExplainBox( true );
  };

  const closeCommentBox = () => {
    setShowExplainBox( false );
  };

  // FAQ LINK
  return (
    <RadioButtonSheet
      headerText={t( "FLAG-AN-ITEM" )}
      snapPoints={[400]}
      confirm={checkBoxValue => {
        if ( checkBoxValue === "other" ) {
        // show text sheet
          openCommentBox();
        } else {
          submitFlag( checkBoxValue );
        }
      }}
      handleClose={handleClose}
      radioValues={radioValues}
      selectedValue={null}
    >

      {showExplainBox && (
        <TextInputSheet
          handleClose={( ) => closeCommentBox()}
          headerText={t( "EXPLAIN-YOUR-FLAG" )}
          snapPoints={[416]}
          confirm={textInput => { console.log( "pressed button", textInput ); }}
        />
      )}

    </RadioButtonSheet>

  );
};
export default FlagItemBottomSheet;
