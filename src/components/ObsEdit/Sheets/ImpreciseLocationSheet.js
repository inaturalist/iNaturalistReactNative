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
      setShowImpreciseLocationSheet: Function
    }

const ImpreciseLocationSheet = ( {
  setShowImpreciseLocationSheet
}: Props ): Node => {
  const { t } = useTranslation( );

  const handleClose = useCallback(
    ( ) => setShowImpreciseLocationSheet( false ),
    [setShowImpreciseLocationSheet]
  );

  const renderBackdrop = props => <BottomSheetStandardBackdrop props={props} />;

  return (
    <BottomSheet
      backdropComponent={renderBackdrop}
      handleClose={handleClose}
      headerText={t( "LOCATION-TOO-IMPRECISE" )}
      snapPoints={[216]}
      hideCloseButton
    >
      <View className="p-5">
        <Body3>
          {t( "Your-location-uncertainty-is-over-10km" )}
        </Body3>
        <Button
          text={t( "OK" )}
          onPress={( ) => handleClose( )}
        />
      </View>
    </BottomSheet>
  );
};

export default ImpreciseLocationSheet;
