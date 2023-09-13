// @flow

import { FlashList } from "@shopify/flash-list";
import {
  Body2, Button, FloatingActionBar, INatIconButton, StickyToolbar
} from "components/SharedComponents";
import ViewWrapper from "components/SharedComponents/ViewWrapper";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";

import GroupPhotoImage from "./GroupPhotoImage";

type Props = {
  groupedPhotos: Array<Object>,
  selectedObservations: Array<Object>,
  selectObservationPhotos: Function,
  navToObsEdit: Function,
  combinePhotos: Function,
  removePhotos: Function,
  separatePhotos: Function
}

const GroupPhotos = ( {
  groupedPhotos,
  selectedObservations,
  selectObservationPhotos,
  navToObsEdit,
  combinePhotos,
  removePhotos,
  separatePhotos
}: Props ): Node => {
  const theme = useTheme();
  const renderImage = ( { item } ) => (
    <GroupPhotoImage
      item={item}
      selectedObservations={selectedObservations}
      selectObservationPhotos={selectObservationPhotos}
    />
  );

  const extractKey = ( item, index ) => `${item.photos[0].uri}${index}`;

  const noObsSelected = selectedObservations.length === 0;
  const oneObsSelected = selectedObservations.length === 1;
  const obsWithMultiplePhotosSelected = selectedObservations?.[0]?.photos?.length > 1;

  return (
    <ViewWrapper>
      <FlashList
        ListHeaderComponent={(
          <View className="m-5">
            <Body2>{t( "Group-photos-onboarding" )}</Body2>
          </View>
        )}
        data={groupedPhotos}
        initialNumToRender={4}
        keyExtractor={extractKey}
        numColumns={2}
        renderItem={renderImage}
        testID="GroupPhotos.list"
        estimatedItemSize={178}
        extraData={selectedObservations}
      />
      <FloatingActionBar
        show={selectedObservations.length > 0}
        position="bottomStart"
        containerClass="bottom-[100px] ml-1 rounded-md"
      >
        <View className="rounded-md overflow-hidden flex-row">
          <INatIconButton
            icon="combine"
            mode="contained"
            size={20}
            color={theme.colors.onPrimary}
            backgroundColor={theme.colors.primary}
            className="m-4"
            accessibilityLabel={t( "Combine-Photos" )}
            disabled={noObsSelected || oneObsSelected}
            onPress={combinePhotos}
          />
          <INatIconButton
            icon="separate"
            mode="contained"
            size={20}
            color={theme.colors.onPrimary}
            backgroundColor={theme.colors.primary}
            className="m-4"
            accessibilityLabel={t( "Separate-Photos" )}
            disabled={!obsWithMultiplePhotosSelected}
            onPress={separatePhotos}
          />
          <INatIconButton
            icon="trash-outline"
            mode="contained"
            size={20}
            color={theme.colors.onError}
            backgroundColor={theme.colors.error}
            className="m-4"
            accessibilityLabel={t( "Remove-Photos" )}
            disabled={noObsSelected}
            onPress={removePhotos}
          />
        </View>
      </FloatingActionBar>
      <StickyToolbar>
        <Button
          className="mt-2 mx-4"
          level="focus"
          text={t( "IMPORT-X-OBSERVATIONS", { count: groupedPhotos.length } )}
          onPress={navToObsEdit}
          testID="GroupPhotos.next"
        />
      </StickyToolbar>
    </ViewWrapper>
  );
};

export default GroupPhotos;
