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

interface Props {
  hidden?: boolean;
  identification: {
    body?: string;
    taxon: { id: number };
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  onSuggestId:Function;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  editIdentBody: Function;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  onPressClose: Function;
}

const SuggestIDSheet = ( {
  hidden,
  identification,
  onSuggestId,
  editIdentBody,
  onPressClose
}: Props ): Node => {
  const buttons = [
    {
      title: t( "SUGGEST-ID" ),
      onPress: ( ) => {
        onSuggestId( );
        onPressClose( );
      },
      className: "mx-2 flex-1",
      testID: "SuggestIDSheet.cvSuggestionsButton",
      accessibilityRole: "link",
      accessibilityHint: t( "Adds-ID" ),
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
      testID: "SuggestID.EditCommentButton",
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
      testID: "SuggestID.commentButton",
      accessibilityHint: t( "Opens-add-comment-form" )
    } );
  }
  return (
    <BottomSheet
      onPressClose={onPressClose}
      headerText={t( "SUGGEST-ID" )}
      hidden={hidden}
    >
      <View className="mx-[26px] space-y-[11px] my-[15px]">
        <List2>
          {t( "Would-you-like-to-suggest-the-following-identification" )}
        </List2>
        { identification.body && (
          <View
            className=" flex-row items-center bg-lightGray p-[15px] rounded"
          >
            <INatIcon name="add-comment-outline" size={22} />
            <List2 className="ml-[7px] text-darkGray flex-1">
              {identification.body}
            </List2>
          </View>
        )}
        {
          identification.taxon
            ? (
              <View className="flex-row mx-[15px]">
                <DisplayTaxon taxon={identification.taxon} />
              </View>
            )
            : <List2>{t( "Unknown-organism" )}</List2>
        }
      </View>
      <View className="mx-3 mb-3">
        <ButtonBar buttonConfiguration={buttons} />
      </View>
    </BottomSheet>
  );
};

export default SuggestIDSheet;
