// @flow
import {
  BottomSheet,
  ButtonBar,
  DisplayTaxon,
  INatIcon,
  List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Text } from "react-native";

type Props = {
  editIdentBody: Function,
  hidden?: boolean,
  identification: {
    body?: string,
    taxon: { id: number },
    vision?: boolean
  },
  onAgree:Function,
  onPressClose: Function,
};

const showTaxon = taxon => {
  if ( !taxon ) {
    return <Text>{t( "Unknown-organism" )}</Text>;
  }
  return (
    <View className="flex-row mx-[15px]">
      <DisplayTaxon taxon={taxon} />
    </View>
  );
};

const AgreeWithIDSheet = ( {
  editIdentBody,
  hidden,
  identification,
  onAgree,
  onPressClose
}: Props ): Node => {
  const buttons = [
    {
      title: t( "AGREE" ),
      isPrimary: true,
      onPress: ( ) => onAgree( identification ),
      className: "mx-2 flex-1",
      testID: "ObsDetail.AgreeId.cvSuggestionsButton",
      accessibilityRole: "link",
      accessibilityHint: t( "Navigates-to-suggest-identification" ),
      level: "primary"
    }
  ];

  if ( identification.body ) {
    buttons.unshift( {
      title: t( "EDIT-COMMENT" ),
      isPrimary: false,
      onPress: ( ) => {
        editIdentBody( );
      },
      className: "mx-2 flex-1",
      testID: "ObsDetail.AgreeId.EditCommentButton",
      accessibilityHint: t( "Opens-edit-comment-form" )
    } );
  } else {
    buttons.unshift( {
      title: t( "ADD-COMMENT" ),
      isPrimary: false,
      onPress: ( ) => {
        editIdentBody( );
      },
      className: "mx-2 flex-1",
      testID: "ObsDetail.AgreeId.commentButton",
      accessibilityHint: t( "Opens-add-comment-form" )
    } );
  }

  return (
    <BottomSheet
      headerText={t( "AGREE-WITH-ID" )}
      hidden={hidden}
      onPressClose={onPressClose}
    >
      <View
        className="mx-[26px] space-y-[11px] my-[15px]"
      >
        <List2 className="text-darkGray">
          {t( "Agree-with-ID-description" )}
        </List2>
        { identification.body && (
          <View
            className=" flex-row items-center bg-lightGray p-[15px] rounded"
          >
            <INatIcon name="add-comment-outline" size={22} />
            <List2 className="ml-[7px] text-darkGray">
              {identification.body}
            </List2>
          </View>
        )}
        {showTaxon( identification.taxon )}
      </View>
      <ButtonBar buttonConfiguration={buttons} containerClass="px-[15px] pb-[15px]" />
    </BottomSheet>
  );
};

export default AgreeWithIDSheet;
