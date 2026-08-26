import {
  BottomSheetV2,
  Button,
  DisplayTaxon,
  INatIcon,
  List2,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import React from "react";

interface Props {
  hidden?: boolean;
  identification: {
    body?: string;
    taxon: { id: number };
  };
  loading?: boolean;
  onSuggestId: ( ) => void;
  editIdentBody: () => void;
  onPressClose?: () => void;
}

const SuggestIDSheet = ( {
  hidden,
  identification,
  loading,
  onSuggestId,
  editIdentBody,
  onPressClose,
}: Props ): React.ReactNode => (
  <BottomSheetV2
    headerText={t( "SUGGEST-ID" )}
    hidden={hidden}
    onPressClose={onPressClose}
  >
    <>
      <View className="mx-[26px] gap-y-[11px] my-[15px]">
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
      <View className="flex-row justify-evenly mx-3 mb-3">
        {identification.body
          ? (
            <Button
              text={t( "EDIT-COMMENT" )}
              onPress={( ) => {
                editIdentBody( );
              }}
              className="mx-2 flex-1"
              disabled={loading}
              testID="SuggestID.EditCommentButton"
            />
          )
          : (
            <Button
              text={t( "ADD-COMMENT" )}
              onPress={( ) => {
                editIdentBody( );
              }}
              className="mx-2 flex-1"
              disabled={loading}
              testID="SuggestID.commentButton"
              accessibilityHint={t( "Opens-add-comment-form" )}
            />
          )}
        <Button
          text={t( "SUGGEST-ID" )}
          onPress={( ) => {
            onSuggestId( );
          }}
          className="mx-2 flex-1"
          disabled={loading}
          loading={loading}
          testID="SuggestIDSheet.cvSuggestionsButton"
          accessibilityRole="link"
          accessibilityHint={t( "Adds-ID" )}
          level="primary"
        />
      </View>
    </>
  </BottomSheetV2>
);

export default SuggestIDSheet;
