// @flow

import {
  Body3,
  BottomSheet, BottomSheetStandardBackdrop, Button
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import useTranslation from "sharedHooks/useTranslation";

  type Props = {
    setShowMissingEvidenceSheet: Function
  }

const MissingEvidenceSheet = ( {
  setShowMissingEvidenceSheet
}: Props ): Node => {
  const { t } = useTranslation( );

  const handleClose = useCallback(
    ( ) => setShowMissingEvidenceSheet( false ),
    [setShowMissingEvidenceSheet]
  );

  const renderBackdrop = props => <BottomSheetStandardBackdrop props={props} />;

  return (
    <BottomSheet
      backdropComponent={renderBackdrop}
      handleClose={handleClose}
      headerText={t( "MISSING-EVIDENCE" )}
      snapPoints={[199]}
      hideCloseButton
    >
      <View className="p-5">
        <Body3>
          {t( "Every-observation-needs" )}
        </Body3>
        <Button
          text={t( "OK" )}
          onPress={( ) => handleClose( )}
        />
      </View>
    </BottomSheet>
  );
};

export default MissingEvidenceSheet;
